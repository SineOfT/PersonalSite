import { getBornOrActiveRegions, getLocationRegions } from './utils.js';
import {
    COUNTRY_CENTER_POINT_TYPE_PROPERTY,
    COUNTRY_CENTER_LINE_TYPE_PROPERTY,
    TRAVEL_POINT_TYPE_PROPERTY,
    TRAVEL_LINE_TYPE_PROPERTY
} from './enums.js';
import { initMap, updateMapFocus } from './map.js';
import { initFilterControls } from './filter-controls.js';
import { initTopCountriesGraph, updateTopCountriesGraphFocus } from './top-countries-graph.js';
import { initCountriesChordDiagram, updateCountriesChordDiagramFocus } from './countries-chord-diagram.js';
import { initFocusArtworksList, updateFocusArtworksListFocusDetail } from './focus-artworks-list.js';

document.addEventListener('DOMContentLoaded', async function() {
    
    /////////////////
    //#region DATA //
    /////////////////

    // read countries data
    const countriesGeoJSON = await d3.json('./data/ne_110m_admin_0_countries.geojson');

    // read artworks data
    const artworksCSV = await d3.csv('./data/catalog.csv');

    // read artwork regions data, filter out any where data not found
    const artworkRegionsCSV = (await d3.csv('./data/artwork-regions.csv'))
        .filter(({ name, country, lat, lng }) => name !== '' && country !== '' && lat !== '' && lng !== '');
    artworkRegionsCSV.forEach(region => { // convert coordinates from strings to numbers
        region.lat = parseFloat(region.lat);
        region.lng = parseFloat(region.lng);
    });

    // create new dataset that contains where artwork originated to where artwork ended up
    const artworkTravelIndexes = artworksCSV.flatMap(({ ['born-died']: bornDied, location }, i) => {
        const bornOrActiveRegionIndexes = getBornOrActiveRegions(bornDied)
            ?.map(r => artworkRegionsCSV.findIndex(({ region }) => region === r))
            .filter(rIndex => rIndex !== -1)
            ?? []; // if could not find any regions, set to empty array
        const locationRegionIndexes = getLocationRegions(location)
            ?.map(r => artworkRegionsCSV.findIndex(({ region }) => region === r))
            .filter(rIndex => rIndex !== -1)
            ?? []; // if could not find any regions, set to empty array
        return bornOrActiveRegionIndexes.flatMap(bornOrActionRegionIndex =>
            locationRegionIndexes.map(locationRegionIndex => ({
                artworkIndex: i,
                originIndex: bornOrActionRegionIndex,
                destIndex: locationRegionIndex,
            }))
        );
    });

    // get the countries for each of the artwork regions, maintaining index order
    const artworkRegionCountryCenterPointsGeoJSONFeatures = artworkTravelIndexes.reduce((acc, { artworkIndex, originIndex, destIndex }) => {
        // function gets the indexes of where the given country and region are in the accumulator if they are existing, otherwise creating a new entry
        function addOrGetIndexes(country, regionIndex) {
            // get the index of the country in the accumulator, adding the entry if not existing
            let countryIndex = acc.findIndex(({ properties }) => properties.country === country);
            if (countryIndex === -1) {
                countryIndex = acc.length; // the new country will be added to the end of the accumulator
                acc.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        // position will be calculated later
                    },
                    properties: {
                        type: COUNTRY_CENTER_POINT_TYPE_PROPERTY,
                        country,
                        countryIndex,
                        regions: [],
                        filteredOriginArtworks: [], // default filter to none shown, will be set later
                        filteredDestArtworks: []    //
                    },
                });
            }

            // get the index of the region in the country properties, adding the entry if not existing
            const countryData = acc[countryIndex];
            let regionDataIndex = countryData.properties.regions.findIndex(({ regionIndex: rI }) => rI === regionIndex);
            if (regionDataIndex === -1) {
                regionDataIndex = countryData.properties.regions.length; // the new region will be added to the end of the regions array
                countryData.properties.regions.push({
                    regionIndex,
                    originArtworks: [],
                    destArtworks: [],
                });
            }

            // return the found or added indexes
            return { countryIndex, regionDataIndex };
        }
        
        // get the regions
        const originRegion = artworkRegionsCSV[originIndex];
        const destRegion = artworkRegionsCSV[destIndex];

        // get the indexes of the existing data in the accumulator
        const origin = addOrGetIndexes(originRegion.country, originIndex);
        const dest = addOrGetIndexes(destRegion.country, destIndex);

        // add the origin and dest of the artwork to the accumulator
        const originCountryData = acc[origin.countryIndex];
        const originRegionData = originCountryData.properties.regions[origin.regionDataIndex];
        originRegionData.originArtworks.push({ artworkIndex, destIndex, destCountryIndex: dest.countryIndex });

        const destCountryData = acc[dest.countryIndex];
        const destRegionData = destCountryData.properties.regions[dest.regionDataIndex];
        destRegionData.destArtworks.push({ artworkIndex, originIndex, originCountryIndex: origin.countryIndex });
        
        return acc;
    }, []);
    // calculate the center of the country by averaging the regions
    artworkRegionCountryCenterPointsGeoJSONFeatures.forEach(country => {
        // accumulate total of center positions of each region in country
        const regionCoordsTotal = country.properties.regions.reduce(([lng, lat], { regionIndex }) => {
            const region = artworkRegionsCSV[regionIndex];
            return [lng + region.lng, lat + region.lat];
        }, [0, 0]);
        // calculate the average position by diving by number of regions in country
        const regionCount = country.properties.regions.length;
        const regionCoordsAvg = [
            regionCoordsTotal[0] / regionCount,
            regionCoordsTotal[1] / regionCount
        ];
        // set country center's coordinates as average of regions within country
        country.geometry.coordinates = regionCoordsAvg;
    });

    // determine the artworks that have origins and destinations at each region, place geo point at that region
    const artworkTravelPointsGeoJSONFeatures = artworkRegionCountryCenterPointsGeoJSONFeatures.flatMap(({ properties }) =>
        properties.regions.map(({ regionIndex, originArtworks, destArtworks }) => {
            // convert accumulated region data into GeoJSON for each region, store accumulated data in properties
            const region = artworkRegionsCSV[regionIndex];
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [region.lng, region.lat],
                },
                properties: {
                    type: TRAVEL_POINT_TYPE_PROPERTY,
                    country: properties.country,
                    countryIndex: properties.countryIndex,
                    regionIndex,
                    originArtworks,
                    destArtworks,
                    filteredOriginArtworks: [], // default filter to none shown, will be set later
                    filteredDestArtworks: [],   //
                },
            }
        })
    );
    
    // place geo line from country center to each of its regions, using same indexes so easy to associate with region points
    const artworkRegionCountryCenterLinesGeoJSONFeatures = artworkTravelPointsGeoJSONFeatures.map(feature => {
        const country = artworkRegionCountryCenterPointsGeoJSONFeatures[feature.properties.countryIndex];
        const region = artworkRegionsCSV[feature.properties.regionIndex];
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    country.geometry.coordinates, // start at country's center point
                    [region.lng, region.lat] // end at region's coordinates
                ],
            },
            properties: {
                type: COUNTRY_CENTER_LINE_TYPE_PROPERTY,
            },
        };
    });

    // place geo line from the origin country to destination country of each artwork
    const artworkTravelLinesGeoJSONFeatures = artworkTravelIndexes.reduce((acc, { artworkIndex, originIndex, destIndex }) => {
        // get regions relating to artwork
        const originRegion = artworkRegionsCSV[originIndex];
        const destRegion = artworkRegionsCSV[destIndex];

        // if origin-dest pair already in accumulator, append origin and dest artworks to properties along with direction flag
        const existingOriginToDestTravelLine = acc.find(({ properties }) => // search for origin -> dest travels
            properties.country1 === originRegion.country && properties.country2 === destRegion.country);
        if (existingOriginToDestTravelLine != null) {
            existingOriginToDestTravelLine.properties.travels.push({ artworkIndex, originIndex, destIndex, isOriginToDest: true });
            return acc;
        }
        const existingDestToOriginTravelLine = acc.find(({ properties }) => // search for dest -> origin travels, flip direction flag
            properties.country2 === originRegion.country && properties.country1 === destRegion.country);
        if (existingDestToOriginTravelLine != null) {
            existingDestToOriginTravelLine.properties.travels.push({ artworkIndex, originIndex, destIndex, isOriginToDest: false });
            return acc;
        }
            
        // if this origin-dest pair still not in accumulator, add it
        // find country data for origin and dest regions
        const originCountry = artworkRegionCountryCenterPointsGeoJSONFeatures.find(({ properties: p }) => p.country === originRegion.country);
        const destCountry   = artworkRegionCountryCenterPointsGeoJSONFeatures.find(({ properties: p }) => p.country === destRegion.country);
        // push new GeoJSON entry into accumulator
        acc.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    originCountry.geometry.coordinates,
                    destCountry.geometry.coordinates
                ]
            },
            properties: {
                type: TRAVEL_LINE_TYPE_PROPERTY,
                country1: originRegion.country,
                country1Index: artworkRegionCountryCenterPointsGeoJSONFeatures.findIndex(({ properties }) => properties.country === originRegion.country),
                country2: destRegion.country,
                country2Index: artworkRegionCountryCenterPointsGeoJSONFeatures.findIndex(({ properties }) => properties.country === destRegion.country),
                travels: [{ artworkIndex, originIndex, destIndex, isOriginToDest: true }],
                filteredTravels: [], // default filter to none shown, will be set later
            }
        });

        return acc;
    }, []);

    // adjacency matrix for countries to be repesented as a graph, directed and weights equal to filtered artwork counts (0 default)
    const filteredCountriesAdjacencyMatrix = artworkRegionCountryCenterPointsGeoJSONFeatures.map(_ =>
        artworkRegionCountryCenterPointsGeoJSONFeatures.map(_ => 0)
    );

    // add all data to object so easy to pass around
    const data = {
        countriesGeoJSON,
        artworksCSV,
        artworkRegionsCSV,
        artworkTravelIndexes,
        artworkRegionCountryCenterPointsGeoJSONFeatures,
        artworkRegionCountryCenterLinesGeoJSONFeatures,
        artworkTravelPointsGeoJSONFeatures,
        artworkTravelLinesGeoJSONFeatures,
        filteredCountriesAdjacencyMatrix,
        artworkFilters: artworksCSV.map(_ => false), // default to all artworks filtered on startup
        countryFilters: artworkRegionCountryCenterPointsGeoJSONFeatures.map(_ => false), // default to no countries in filter on startup
    }

    //#endregion

    //////////////////
    //#region FOCUS //
    //////////////////

    // details about what is currently focused, on startup nothing is focused
    const focus = { data: null, detail: null };

    function setFocusData(newFocusData) {
        focus.data = newFocusData;
        updateMapFocus();
        updateTopCountriesGraphFocus();
        updateCountriesChordDiagramFocus();
    }

    function setFocusDetail(newFocusDetail) {
        // do not allow change focus to different detail if is locked
        if (focus.detail?.isLocked && newFocusDetail != null) return;

        focus.detail = newFocusDetail;
        updateMapFocus();
        updateTopCountriesGraphFocus();
        updateCountriesChordDiagramFocus();
        updateFocusArtworksListFocusDetail();
    }

    //#endregion

    // initiate visualizations using data
    initMap(data, focus, setFocusData, setFocusDetail);
    initTopCountriesGraph(data, focus, setFocusData, setFocusDetail);
    initCountriesChordDiagram(data, focus, setFocusData, setFocusDetail);
    initFocusArtworksList(data, focus, setFocusData, setFocusDetail);

    // initialize controls
    initFilterControls(data);
    
}, { once: true });