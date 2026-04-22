import { proportion, lerp, lerp2, throttleAction, runAnimations, distanceSquared } from './utils.js';
import {
    COUNTRY_CENTER_POINT_TYPE_PROPERTY, TRAVEL_POINT_TYPE_PROPERTY, LASSO_AREA_TYPE_PROPERTY,
    ARTWORK_COUNT_ENUM_BOTH,
    FOCUS_ENUM_COUNTRY, FOCUS_ENUM_TRAVEL
} from './enums.js';
import { updateCountryFilters } from './filter-controls.js';

//////////////////////////////
//#region LAYTOUT CONSTANTS //
//////////////////////////////

/*
 * ideally these shouldn't be needed, butsomething about d3's fitExtent() function
 * doesn't contain azimuthal projections
 */
const MAP_AZIMUTHAL_PADDING_TOP = 200;
const MAP_AZIMUTHAL_PADDING_BOTTOM = 100;
const MAP_AZIMUTHAL_PADDING_LEFT = 200;
const MAP_AZIMUTHAL_PADDING_RIGHT = 100;

const COUNTRY_COLOR = '#777';
const COUNTRY_BORDER_COLOR = '#555';
const COUNTRY_BORDER_WIDTH = 0.5;

const COUNTRY_CENTER_POINT_COLOR = '#333';
const COUNTRY_CENTER_POINT_OPACITY = 0.5;
const COUNTRY_CENTER_POINT_FILTER_COLOR = '#004D03';
const COUNTRY_CENTER_POINT_RADIUS = 5;
const COUNTRY_CENTER_LINE_COLOR = '#0008';
const COUNTRY_CENTER_LINE_WIDTH = 0.5;

export const TRAVEL_ORIGIN_COLOR = '#F00';
export const TRAVEL_DEST_COLOR = '#00F';
export const TRAVEL_COLOR_SCALE = d3.scaleLinear()
    .domain([0, 1])
    .range([TRAVEL_ORIGIN_COLOR, TRAVEL_DEST_COLOR]);
const TRAVEL_POINT_RADIUS = 1;
const TRAVEL_POINT_OPACITY = 0.3;
const TRAVEL_LINE_WIDTH = 0.5;
const TRAVEL_LINE_OPACITY = 0.3;

const MOUSE_FOCUS_FISHEYE_SMOOTHING = 0.2;

const MOUSE_FOCUS_FISHEYE_OUTLINE_COLOR = '#0002';

const LASSO_AREA_POINT_MIN_DISTANCE_SQUARED = 100; // minimum length of drag until another point is added to lasso area
const LASSO_AREA_POINT_MIN_COUNT = 4; // as defined by GeoJSON, polygon must have at least 4 points
const LASSO_AREA_FILL_COLOR = '#5973';
const LASSO_AREA_STROKE_COLOR = '#0005';
const LASSO_AREA_STROKE_WIDTH = 2;
const LASSO_AREA_STROKE_DASH_SIZE = 5;

// opacity of other elements when something is focused
const FOCUS_OTHER_COUNTRY_CENTER_POINT_OPACITY = 0.2;
const FOCUS_OTHER_TRAVEL_POINT_OPACITY = 0; // don't need precise detail when not focused, so hide entirely
const FOCUS_OTHER_TRAVEL_LINE_OPACITY = 0.1;
const TRAVEL_LINE_FOCUS_WIDTH = 5; // other than making more opaque, also make thicker so easier to see and interact

// set visualization to have constant width and height so screen size doesn't affect
const W = 1000;
const H = 1000;

// animation constants
const UPDATE_FILTERING_ANIMATION_ID = 1; // in order of precedence
const UPDATE_FOCUS_ANIMATION_ID = 2;
const UPDATE_MAP_ANIMATION_ID = 3;
// how long to throttle the hover detection until beginning the animation, so animations don't start prematurely
const FOCUS_THROTTLE_MS = 100;
// how long to wait before starting focus travel blur animation, so don't need to wait until finish blur before refocusing
const FOCUS_BLUR_DELAY_MS = 300;

//#endregion

/////////////////////////////////
//#region TRANSITION CONSTANTS //
/////////////////////////////////

const getMapTransition = () => d3.transition()
    .duration(800);

const getFocusTransition = () => d3.transition()
    .duration(300);

const getFilteringTransition = () => d3.transition()
    .duration(300);

//#endregion

/////////////////////////
//#region DOM ELEMENTS //
/////////////////////////

const mapScrollElement = document.getElementById('mapScroll');
const mapSVGElement = document.getElementById('mapSVG');
const mapFocusDisplay = document.getElementById('mapFocusDisplay');

//#endregion

////////////////////
//#region OPTIONS //
////////////////////

// options that define how the map is drawn
let options = {
    mouseFocus: [0, 0],
    isMapProjectionAzimuthal: false,
    isMouseFocusFisheyeEnabled: false,
    mouseFocusFisheyeRadius: 0,
    mouseFocusFisheyeDistortion: 0,
    lassoAppendType: null,
};

//#endregion

/*
 * function updates the map's options by changing the provided values only, and updates the map projection.
 * can choose to skip projection such as on startup when map not initialized, or when change doesn't affect projection.
 */
export function updateOptions(newOptions, requireUpdateProjection = true) {
    options = { ...options, ...newOptions };
    if (requireUpdateProjection) {
        updateMapProjection();
    }
}

// function will update the map once it's initiated. If it's called before initialization, does nothing
let updateMapProjection = () => { };

// function will update the country focus to a new focus
export let updateMapFocus = () => { }

// function will update the data displayed on the map once it's initialized. If it's called before initialization, does nothing
export let updateMapFiltering = () => { }

export function initMap(data, focus, setFocusData, setFocusDetail) {

    const mouseFocusFisheyeGradientID = 'mouse-focus-fisheye-gradient';
    function defineMouseFocusFisheyeGradient(svgDefs) {
        // predefine outline gradient around fisheye distortion
        const mouseFocusFisheyeGradient = svgDefs.append('radialGradient')
            .attr('id', mouseFocusFisheyeGradientID);
        mouseFocusFisheyeGradient.append('stop').attr('offset',  '80%').attr('stop-color', 'transparent');
        mouseFocusFisheyeGradient.append('stop').attr('offset',  '90%').attr('stop-color', MOUSE_FOCUS_FISHEYE_OUTLINE_COLOR);
        mouseFocusFisheyeGradient.append('stop').attr('offset', '100%').attr('stop-color', 'transparent');
    }


    //////////////////////
    //#region VARIABLES //
    //////////////////////

    // keep track of the previous options so they can be referenced when transitioning
    let prevOptions = { ...options }; // default to default options

    // keep track of the current state of the animation, to avoid race conditions
    const animationState = {
        isRunning: false,
        pendingAnimationsMask: 0,
        animations: { }, // update function not defined yet
    };

    //#endregion

    ///////////////////////
    //#region GENERATORS //
    ///////////////////////

    // create projection for map
    const getMapProjection = (tOptions) => {
        tOptions ??= options;
        if (tOptions.isMapProjectionAzimuthal) {
            return d3.geoAzimuthalEquidistant()
                .fitExtent([
                    [MAP_AZIMUTHAL_PADDING_LEFT, MAP_AZIMUTHAL_PADDING_TOP],
                    [W-MAP_AZIMUTHAL_PADDING_RIGHT, H-MAP_AZIMUTHAL_PADDING_BOTTOM]
                ], data.countriesGeoJSON)
                .rotate(tOptions.mouseFocus.map(angle => -angle) ?? [0, 0]); // flip angles so centered
        } else {
            return d3.geoEquirectangular()
                .fitSize([W, H], data.countriesGeoJSON)
                .rotate([-(tOptions.mouseFocus?.[0]) ?? 0, 0]); // do not rotate phi, just lambda
        }
    }
    const getMapProjectionRaw = (tOptions) => {
        tOptions ??= options;
        if (tOptions.isMapProjectionAzimuthal) {
            return d3.geoAzimuthalEquidistantRaw;
        } else {
            return d3.geoEquirectangularRaw;
        }
    }

    // create projection for fisheye on mouse click focus
    const getMouseFocusFisheye = (tOptions) => {
        tOptions ??= options;
        const mapProjection = getMapProjection(tOptions);
        return d3Fisheye()
            .smoothing(MOUSE_FOCUS_FISHEYE_SMOOTHING)
            .radius(tOptions.isMouseFocusFisheyeEnabled ? tOptions.mouseFocusFisheyeRadius : 0) // if disabled, set radius to none so doesn't show up
            .distortion(tOptions.mouseFocusFisheyeDistortion)
            .focus(mapProjection(tOptions.mouseFocus));
    }
    const getMouseFocusProjection = (fisheye) => { // allow use custom
        fisheye ??= getMouseFocusFisheye();
        return d3.geoTransform({
            point: function(px, py) {
                const [x, y] = fisheye([px, py]);
                return this.stream.point(x, y);
            },
        });
    };

    // combine projections, with optinal parameters if want use custom
    const getMapWithFishEyeProjection = (mapProjection, mouseFocusProjection) => {
        mapProjection ??= getMapProjection();
        mouseFocusProjection ??= getMouseFocusProjection();
        return {
            stream: function(s) {
                return mapProjection.stream(mouseFocusProjection.stream(s));
            },
        };
    };

    const getGeoGenerator = (projection) => {
        projection ??= getMapWithFishEyeProjection();
        return d3.geoPath()
            .pointRadius(function(d) {
                // return point radius based on type of point
                if (d.properties.type === COUNTRY_CENTER_POINT_TYPE_PROPERTY) {
                    return COUNTRY_CENTER_POINT_RADIUS;
                }
                if (d.properties.type === TRAVEL_POINT_TYPE_PROPERTY) {
                    return TRAVEL_POINT_RADIUS;
                }
                return 0; // if unknown point type, do not show point
            })
            .projection(projection);
    }

    // function gets the longitude and latitude positions of a pointer position
    const getPointerLngLat = (pointer, mapProjection, mouseFocusFisheye) => {
        // invert projections of pointer position to get lng-lat coordinates
        mapProjection ??= getMapProjection();
        mouseFocusFisheye ??= getMouseFocusFisheye();
        const [lng, lat] = mapProjection.invert(mouseFocusFisheye(pointer, true));
        // clamp coordinates to not exceed extends of map
        const pointerLngLat = [
            Math.min(Math.max(lng, -180), 180),
            Math.min(Math.max(lat, -90), 90),
        ];
        return pointerLngLat;
    }

    //#endregion

    //////////////////////
    //#region RENDERING //
    //////////////////////

    // get current geo generator to use to draw the geoJSON data
    const mapProjection = getMapProjection();
    const mouseFocusFisheye = getMouseFocusFisheye();
    const geoGenerator = getGeoGenerator();

    // create containing SVG, using viewBox instead of width/height so that zooming works without breaking SVG coordinates
    const svg = d3.select(mapSVGElement).attr('viewBox', `0 0 ${W} ${H}`);

    // hold predefined elements such as gradients to reference later
    const svgDefs = svg.append('defs');
    defineMouseFocusFisheyeGradient(svgDefs);

    // container for map elements
    const mapContainer = svg.append('g');

    // draw countries
    const contriesContainer = mapContainer.append('g');
    const countries = contriesContainer.selectAll('path')
        .data(data.countriesGeoJSON.features).enter().append('path')
        .attr('d', geoGenerator)
        .attr('fill', COUNTRY_COLOR)
        .attr('stroke', COUNTRY_BORDER_COLOR)
        .attr('stroke-width', COUNTRY_BORDER_WIDTH);

    // draw the lines between each country and each of its regions
    const countryCenterLinesContainer = mapContainer.append('g');
    const countryCenterLines = countryCenterLinesContainer.selectAll('path')
        .data(data.artworkRegionCountryCenterLinesGeoJSONFeatures).enter().append('path')
        .attr('d', geoGenerator)
        .attr('fill', 'none')
        .attr('stroke', COUNTRY_CENTER_LINE_COLOR)
        .attr('stroke-width', COUNTRY_CENTER_LINE_WIDTH)
        .attr('opacity', TRAVEL_POINT_OPACITY);

    // draw the points at each region, where color interpolated based on number of origins and destinations at region
    const travelPointsContainer = mapContainer.append('g');
    const travelPoints = travelPointsContainer.selectAll('path')
        .data(data.artworkTravelPointsGeoJSONFeatures).enter().append('path')
        .attr('d', geoGenerator)
        .attr('fill', function(d) {
            const p = proportion(d.properties.originArtworks.length, d.properties.destArtworks.length);
            return TRAVEL_COLOR_SCALE(p);
        })
        .attr('opacity', TRAVEL_POINT_OPACITY);
    
    // draw the lines showing artwork travels from origin to destination
    // function gets a unique ID name from the index of the data
    const getTravelLineGradientId = (i) => `travelLineGradient-${i}`;
    // function updates the start and end position of the gradient based on a given projection, and updates the colors
    function calculateTravelLineGradientAttrs(d, element, mapProjection, mouseFocusFisheye) {
        // calculate position of countries
        const country1Position = mouseFocusFisheye(mapProjection(d.geometry.coordinates[0]));
        const country2Position = mouseFocusFisheye(mapProjection(d.geometry.coordinates[1]));

        // apply calculations to SVG gradient
        d3.select(element)
            .attr('x1', country1Position[0])
            .attr('y1', country1Position[1])
            .attr('x2', country2Position[0])
            .attr('y2', country2Position[1]);
        updateTravelLineGradientColors(d, element);
    }
    // function updates the colors at the color stops of the gradient
    function updateTravelLineGradientColors(d, element) {
        // calculate proportion of artworks going from country1 to country2
        const originToDestCount = d.properties.filteredTravels.reduce((acc, { isOriginToDest }) => acc + (isOriginToDest ? 1 : 0), 0);
        const totalCount = d.properties.filteredTravels.length;
        if (totalCount === 0) return; // if 0, line not shown so just skip
        const p = originToDestCount / totalCount;

        // determine the color at each country using the proportion (adds up to one)
        const country1Color = TRAVEL_COLOR_SCALE(1-p);
        const country2Color = TRAVEL_COLOR_SCALE(p);

        // apply calculations to SVG gradient
        d3.select(element).selectAll('stop')
            .data(['0%', '100%']).enter().append('stop')
            .attr('offset', function(d) { return d; })
            .attr('stop-color', function(d) { return d === '0%' ? country1Color : country2Color; });
    }
    const travelLineGradientsContainer = svgDefs.append('g')
    const travelLineGradients = travelLineGradientsContainer.selectAll('linearGradient')
        .data(data.artworkTravelLinesGeoJSONFeatures).enter().append('linearGradient')
        .attr('id', function(_, i) { return getTravelLineGradientId(i); })
        .attr('gradientUnits', 'userSpaceOnUse') // use screen space coordinates instead of relative bounding boxes
        .each(function(d) { calculateTravelLineGradientAttrs(d, this, mapProjection, mouseFocusFisheye); });
    const travelLinesContainer = mapContainer.append('g');
    const travelLines = travelLinesContainer.selectAll('path')
        .data(data.artworkTravelLinesGeoJSONFeatures).enter().append('path')
        .attr('d', geoGenerator)
        .attr('fill', 'none')
        .attr('stroke', function(_, i) { return `url(#${getTravelLineGradientId(i)})`; })
        .attr('stroke-width', TRAVEL_LINE_WIDTH)
        .attr('stroke-linecap', 'round')
        .attr('opacity', TRAVEL_LINE_OPACITY);

    // draw the points at the center of each country
    const countryCenterPointsContainer = mapContainer.append('g');
    const countryCenterPoints = countryCenterPointsContainer.selectAll('path')
        .data(data.artworkRegionCountryCenterPointsGeoJSONFeatures).enter().append('path')
        .attr('d', geoGenerator)
        .attr('fill', COUNTRY_CENTER_POINT_COLOR)
        .attr('opacity', COUNTRY_CENTER_POINT_OPACITY);

    // draw the circle outline around fisheye distortion if enabled
    const mouseFocusFisheyeOutline = (() => {
        const mouseFocusFisheye = getMouseFocusFisheye();
        const mouseFocusFisheyeFocus = mouseFocusFisheye.focus();
        const mouseFocusFisheyeRadius = mouseFocusFisheye.radius();
        return mapContainer.append('circle')
            .attr('cx', mouseFocusFisheyeFocus[0])
            .attr('cy', mouseFocusFisheyeFocus[1])
            .attr('r', mouseFocusFisheyeRadius)
            .attr('fill', `url(#${mouseFocusFisheyeGradientID})`);
            // for now disabled so don't worry about other attrs, only constants
    })();

    // draw the lasso area that shows up when lasso selecting an area
    const lassoArea = mapContainer.append('path')
        .attr('fill', LASSO_AREA_FILL_COLOR)
        .attr('stroke', LASSO_AREA_STROKE_COLOR)
        .attr('stroke-width', LASSO_AREA_STROKE_WIDTH)
        .attr('stroke-dasharray', LASSO_AREA_STROKE_DASH_SIZE);
    // function generates the path that is passed to the lasso area by using an array of points
    const lassoAreaGenerator = (lassoPoints) => lassoPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

    //#endregion

    ////////////////////////
    //#region INTERACTION //
    ////////////////////////

    // distinguish between pressing down and lasso dragging
    let isLassoDragging = false;
    let lassoAreaGeoJSONFeatures = null;

    // function shows details about the country that is currently hovered
    let focusCountryBlurTimeoutId = null;
    const highlightCountryDetailsOnHoverPoint = throttleAction((e, d) => {
        if (!options.isHighlightOnHover) return; // skip if highlighting disabled
        if (!isLassoDragging) { // only focus if lasso not currently dragging
            if (focus.data?.type !== FOCUS_ENUM_COUNTRY // only update if changed
            || focus.data?.countryIndex !== d.properties.countryIndex) {
                setFocusData({
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.properties.countryIndex,
                    artworkCountType: ARTWORK_COUNT_ENUM_BOTH, // since travel lines bidirectional
                });
            } else { // if unchanged, cancel blur that doesn't need to run
                clearTimeout(focusCountryBlurTimeoutId);
            }
        }
    }, FOCUS_THROTTLE_MS);
    // function hides the details when the mouse of is taken off the point
    const unhighlightCountryDetailsOnBlurPoint = (e, d) => {
        focusCountryBlurTimeoutId = setTimeout(() => {
            if (focus.data?.type === FOCUS_ENUM_COUNTRY // only set to null if not changed
            && focus.data?.countryIndex === d.properties.countryIndex) {
                setFocusData(null);
            }
        }, FOCUS_BLUR_DELAY_MS)
    };

    // function focuses the country and shows its details in the artworks sidebar when the point is clicked
    const focusCountryDetailsOnClickPoint = (e, d) => {
        if (!isLassoDragging) { // only focus if was click and not lasso drag
            if (focus.detail?.type === FOCUS_ENUM_COUNTRY
            && focus.detail?.countryIndex === d.properties.countryIndex) {
                focus.data = null;    // if already focused, unfocused
                setFocusDetail(null); //
            } else {
                setFocusDetail({ // otherwise, focus
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.properties.countryIndex,
                    artworkCountType: ARTWORK_COUNT_ENUM_BOTH, // since travel lines bidrectional
                });
            }
        }
    };

    // function shows details about the travel that is currently hovered
    let focusTravelBlurTimeoutId = null;
    const highlightTravelDetailsOnHoverLine = throttleAction((e, d) => {
        if (!isLassoDragging) { // only focus if lasso not currently dragging
            if (!options.isHighlightOnHover) return; // skip if highlighting disabled
            if (focus.data?.type !== FOCUS_ENUM_TRAVEL // only update if changed
            || focus.data?.originCountryIndex !== d.properties.country1Index
            || focus.data?.destCountryIndex !== d.properties.country2Index) {
                setFocusData({
                    type: FOCUS_ENUM_TRAVEL,
                    originCountryIndex: d.properties.country1Index,
                    destCountryIndex: d.properties.country2Index,
                    includeReverseDirection: true, // since travel lines are bidirectional
                });
            } else { // if unchanged, cancel blur that doesn't need to run
                clearTimeout(focusTravelBlurTimeoutId);
            }
        }
    }, FOCUS_THROTTLE_MS);
    // function hides the details when the mouse of is taken off the line
    const unhighlightTravelDetailsOnBlurLine = (e, d) => {
        focusTravelBlurTimeoutId = setTimeout(() => {
            if (focus.data?.type === FOCUS_ENUM_TRAVEL // only set to null if not changed
            && focus.data?.originCountryIndex === d.properties.country1Index
            && focus.data?.destCountryIndex === d.properties.country2Index) {
                setFocusData(null);
            }
        }, FOCUS_BLUR_DELAY_MS)
    };

    // function focuses the travel and shows its details in the artworks sidebar when the line is clicked
    const focusTravelDetailsOnClickLine = (e, d) => {
        if (!isLassoDragging) { // only focus if was click and not lasso drag
            if (focus.detail?.type === FOCUS_ENUM_TRAVEL // only set to null if not changed
             && focus.detail?.originCountryIndex === d.properties.country1Index
             && focus.detail?.destCountryIndex === d.properties.country2Index) {
                focus.data = null;    // if already focused, unfocus
                setFocusDetail(null); //
            } else {
                setFocusDetail({ // otherwise, focus
                    type: FOCUS_ENUM_TRAVEL,
                    originCountryIndex: d.properties.country1Index,
                    destCountryIndex: d.properties.country2Index,
                    includeReverseDirection: true, // since travel lines directional
                });
            }
        }
    }

    // function uses the shoelace theorem to determine if the lasso area is winded counter-clockwise and needs to be reversed
    const updateLassoAreaGeoJSONFeaturesWindingOrder = (isPolygon) => {
        // temporarily use uninverted positions to create geometry coordinates to check calculates bounds
        lassoAreaGeoJSONFeatures.geometry = {
            type: 'Polygon',
            coordinates: [[
                ...lassoAreaGeoJSONFeatures.properties.uninvertedLngLats,
                lassoAreaGeoJSONFeatures.properties.uninvertedLngLats[0] // add first point to end so closes shape
            ]],
        }
        // if bounds take up entire map, likely is winding in wrong order and taking outside of lasso area instead
        const bounds = d3.geoBounds(lassoAreaGeoJSONFeatures);
        const isInverse = bounds[0][0] === -180 && bounds[0][1] === -90 && bounds[1][0] === 180 && bounds[1][1] === 90;
        lassoAreaGeoJSONFeatures.geometry = {
            type: isPolygon ? 'Polygon' : 'LineString',
            coordinates: isInverse
                ? lassoAreaGeoJSONFeatures.properties.uninvertedLngLats.toReversed() // if inverted, reverse order of points to get coordinates
                : [...lassoAreaGeoJSONFeatures.properties.uninvertedLngLats], // otherwise, put copy of uninverted points as coordinates
        };
        if (isPolygon) {
            lassoAreaGeoJSONFeatures.geometry.coordinates.push(lassoAreaGeoJSONFeatures.geometry.coordinates[0]); // polygon needs to end at same coords as start
            lassoAreaGeoJSONFeatures.geometry.coordinates = [lassoAreaGeoJSONFeatures.geometry.coordinates]; // polygon needs wrap coordinates in another array
        }
    }

    // function updates the filter control values based on what is contained within the lasso area
    const updateFiltersFromLassoArea = () => {
        // add bounding box to lasso area GeoJSON features
        const lassoAreaBounds = d3.geoBounds(lassoAreaGeoJSONFeatures);
        lassoAreaGeoJSONFeatures.bbox = [lassoAreaBounds[0][0], lassoAreaBounds[0][1], lassoAreaBounds[1][0], lassoAreaBounds[1][1]];

        // find the countries that are within the lasso area
        const selectedCountries = data.artworkRegionCountryCenterPointsGeoJSONFeatures
            .filter(({ geometry }) => d3.geoContains(lassoAreaGeoJSONFeatures, geometry.coordinates))
            .map(({ properties }) => properties.country);

        // update the filter from the selection
        updateCountryFilters(selectedCountries, options.lassoAppendType);
    }

    // begin detection when mouse pressed down, although still ambiguous if click or drag
    svg.on('mousedown', function(e) {
        if (options.lassoAppendType != null) { // if no lasso, don't need to worry about detecting drag
            const pointer = d3.pointer(e, this);
            const pointerLngLat = getPointerLngLat(pointer);
            lassoAreaGeoJSONFeatures = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    // will be populated later
                },
                properties: {
                    type: LASSO_AREA_TYPE_PROPERTY,
                    // since may need to be inverted if user lassos in counter-clockwise direction, store in properties
                    uninvertedLngLats: [pointerLngLat],
                    mostRecentLassoPointer: pointer, // store the position of this pointer so can use to delay next point until adequately far
                },
            }
        }
    });

    // if mouse pressed down and dragged, add point to lasso area if moved enough distance, confirms is lasso drag
    svg.on('mousemove', function(e) {
        if (lassoAreaGeoJSONFeatures != null) {
            const pointer = d3.pointer(e, this);
            // only add point if distance from previous is large enough to make meaningful
            if (distanceSquared(pointer, lassoAreaGeoJSONFeatures.properties.mostRecentLassoPointer) >= LASSO_AREA_POINT_MIN_DISTANCE_SQUARED) {
                // translate position of pointer to longitude and latitude
                const mapProjection = getMapProjection();
                const pointerLngLat = getPointerLngLat(pointer, mapProjection);
                // add to coordinates of lasso area
                lassoAreaGeoJSONFeatures.properties.uninvertedLngLats.push(pointerLngLat);
                // once enough points detected, means it is lasso and not click
                if (lassoAreaGeoJSONFeatures.properties.uninvertedLngLats.length >= LASSO_AREA_POINT_MIN_COUNT) {
                    isLassoDragging = true;
                }
                // if detected as lasso, update lasso area on screen
                if (isLassoDragging) {
                    const geoGenerator = getGeoGenerator(getMapWithFishEyeProjection(mapProjection));
                    updateLassoAreaGeoJSONFeaturesWindingOrder(false); // keep unclosed since still dragging
                    lassoArea.datum(lassoAreaGeoJSONFeatures).attr('d', geoGenerator);
                }
                // update most recent pointer point so can use to delay next plot
                lassoAreaGeoJSONFeatures.properties.mostRecentLassoPointer = pointer;
            }
        }
    });

    // either complete lasso selection or move map and change fisheye position, based on whether was dragging or not
    svg.on('mouseup', function(e) {
        // get pointer position
        const pointer = d3.pointer(e, this);
        const pointerLngLat = getPointerLngLat(pointer);

        // if was lasso drag, determine selected country center points and send to filter controls
        if (isLassoDragging) {
            // add the current pointer's longitude and latitude to the coordinates
            lassoAreaGeoJSONFeatures.properties.uninvertedLngLats.push(pointerLngLat);
            // update the filter based on the lasso selection
            updateLassoAreaGeoJSONFeaturesWindingOrder(true); // close it so can be used in intersection calculation
            updateFiltersFromLassoArea();
        
        // if was click, move map
        } else {
            // update the projection to have new mouse position
            updateOptions({ mouseFocus: pointerLngLat });
        }
    });

    window.addEventListener('mouseup', function() {
        // reset lasso when finished dragging, SVG mouseup logic runs before window
        lassoArea.attr('d', null);
        isLassoDragging = false;
        lassoAreaGeoJSONFeatures = null;
    });

    // highlight travels on country point click event
    countryCenterPoints
        .style('pointer-events', 'auto')
        .on('mouseup', focusCountryDetailsOnClickPoint);

    //#endregion

    ///////////////////
    //#region UPDATE //
    ///////////////////

    updateMapProjection = () => {
        // prepare the data that will be used in the animation
        const setup = () => {
            // get previous projection configs
            const prevMapProjection = getMapProjection(prevOptions);
            const prevMapProjectionRaw = getMapProjectionRaw(prevOptions);
            const prevMapProjectionScale = prevMapProjection.scale();
            const prevMapProjectionTranslate = prevMapProjection.translate();
            let prevMapProjectionRotate = prevMapProjection.rotate();
            const prevMapProjectionClipAngle = prevMapProjection.clipAngle();

            const prevMouseFocusFisheye = getMouseFocusFisheye(prevOptions);
            const prevMouseFocusFisheyeRadius = prevMouseFocusFisheye.radius();
            const prevMouseFocusFisheyeDistortion = prevMouseFocusFisheye.distortion();
            const prevMouseFocusFisheyeFocus = prevMouseFocusFisheye.focus();

            const prevScrollLeft = mapScrollElement.scrollLeft;
            const prevScrollTop  = mapScrollElement.scrollTop;

            // get the new projection configs
            const newMapProjection = getMapProjection();
            const newMapProjectionRaw = getMapProjectionRaw();
            const newMapProjectionScale = newMapProjection.scale();
            const newMapProjectionTranslate = newMapProjection.translate();
            const newMapProjectionRotate = newMapProjection.rotate();
            const newMapProjectionClipAngle = newMapProjection.clipAngle();

            const newMouseFocusFisheye = getMouseFocusFisheye()
            const newMouseFocusFisheyeRadius = newMouseFocusFisheye.radius();
            const newMouseFocusFisheyeDistortion = newMouseFocusFisheye.distortion();
            const newMouseFocusFisheyeFocus = newMouseFocusFisheye.focus();

            const newScrollLeft = (mapSVGElement.clientWidth  - mapScrollElement.clientWidth)  / 2; // center of scroll
            let newScrollTop    = (mapSVGElement.clientHeight - mapScrollElement.clientHeight) / 2; // center of scroll
            /*
            * if equirectangular and height of SVG map projection (half of width since 2:1) if larger than height of screen,
            * in order to avoid the possibility of the point becoming offscreen, change scroll center to center of focus point instead
            */
            if (!options.isMapProjectionAzimuthal && mapSVGElement.clientWidth/2 > mapScrollElement.clientHeight) {
                // convert SVG position of focus to DOM position then subtract half of screen size so that focus is centered
                newScrollTop = (newMouseFocusFisheyeFocus[1] * mapSVGElement.clientHeight/H) - mapScrollElement.clientHeight/2;
            }

            // if the rotation is more than half a full rotation around the projection, go the other way
            const rotateLambdaDiff = newMapProjectionRotate[0] - prevMapProjectionRotate[0];
            if (rotateLambdaDiff < -180) {
                prevMapProjectionRotate[0] -= 360;
            } else if (rotateLambdaDiff > 180) {
                prevMapProjectionRotate[0] += 360;
            }

            // update the previous options store
            prevOptions = { ...options };

            // put prepared data in object to pass to animation transitions
            return {
                prevMapProjectionRaw,
                prevMapProjectionScale,
                prevMapProjectionTranslate,
                prevMapProjectionRotate,
                prevMapProjectionClipAngle,

                prevMouseFocusFisheyeRadius,
                prevMouseFocusFisheyeDistortion,
                prevMouseFocusFisheyeFocus,

                prevScrollLeft,
                prevScrollTop ,

                newMapProjectionRaw,
                newMapProjectionScale,
                newMapProjectionTranslate,
                newMapProjectionRotate,
                newMapProjectionClipAngle,

                newMouseFocusFisheyeRadius,
                newMouseFocusFisheyeDistortion,
                newMouseFocusFisheyeFocus,

                newScrollLeft,
                newScrollTop,
            };
        }

        const update = ({
            prevMapProjectionRaw,
            prevMapProjectionScale,
            prevMapProjectionTranslate,
            prevMapProjectionRotate,
            prevMapProjectionClipAngle,

            prevMouseFocusFisheyeRadius,
            prevMouseFocusFisheyeDistortion,
            prevMouseFocusFisheyeFocus,

            prevScrollLeft,
            prevScrollTop ,

            newMapProjectionRaw,
            newMapProjectionScale,
            newMapProjectionTranslate,
            newMapProjectionRotate,
            newMapProjectionClipAngle,

            newMouseFocusFisheyeRadius,
            newMouseFocusFisheyeDistortion,
            newMouseFocusFisheyeFocus,

            newScrollLeft,
            newScrollTop,
        }) => {
            // store references for quick access in tweening, for performance
            let t = 1;
            const mapProject = (lambda, phi) => lerp2(prevMapProjectionRaw(lambda, phi), newMapProjectionRaw(lambda, phi), t);
            const mapProjection = d3.geoProjection(mapProject)
                .clipAngle(Math.min(prevMapProjectionClipAngle, newMapProjectionClipAngle)); // ensure to clip anything that was clipped by either projection
            const mouseFocusFisheye = getMouseFocusFisheye(); // get fisheye distortion just for constants, change variables later
            const mouseFocusProjection = getMouseFocusProjection(mouseFocusFisheye); // reference fisheye so changes referenced
            const mapWithFishEyeProjection = getMapWithFishEyeProjection(mapProjection, mouseFocusProjection); // reference projections so changes referenced
            const tweenGeoGenerator = getGeoGenerator(mapWithFishEyeProjection);
            
            // function updates the map projection and mouse focus fisheye based on a t value
            const updateProjections = (t) => {
                mapProjection // update projection config properties based on new t value
                    .scale(lerp(prevMapProjectionScale, newMapProjectionScale, t))
                    .translate(lerp2(prevMapProjectionTranslate, newMapProjectionTranslate, t))
                    .rotate(lerp2(prevMapProjectionRotate, newMapProjectionRotate, t)); // ignore gamma as will not be animated
                mouseFocusFisheye // update mouse focus fisheye distortions based on new t value
                    .radius(lerp(prevMouseFocusFisheyeRadius, newMouseFocusFisheyeRadius, t))
                    .distortion(lerp(prevMouseFocusFisheyeDistortion, newMouseFocusFisheyeDistortion, t))
                    .focus(lerp2(prevMouseFocusFisheyeFocus, newMouseFocusFisheyeFocus, t));
            }

            // function returns a function of t that tweens between the previous and new map projection
            const tweenPath = (d) => {
                return function(newT) {
                    t = newT;
                    updateProjections(t);
                    return tweenGeoGenerator(d);
                }
            }

            const tweenTravelLineGradientAttrs = (d) => {
                return function(newT) {
                    t = newT;
                    updateProjections(t);
                    return calculateTravelLineGradientAttrs(d, this, mapProjection, mouseFocusFisheye);
                }
            }

            // function returns a function of t that tweens betweens the previous and new scroll position
            const tweenScroll = () => {
                return (t) => {
                    mapScroll.scrollLeft = lerp(prevScrollLeft, newScrollLeft, t);
                    mapScroll.scrollTop  = lerp(prevScrollTop,  newScrollTop,  t);
                }
            }

            // transition paths based on new geo generator
            const transition = getMapTransition();
            const countriesTransitioning = countries
                .transition(transition)
                .attrTween('d', tweenPath)
            const countryCenterPointsTransitioning = countryCenterPoints
                .transition(transition)
                .attrTween('d', tweenPath)
            const countryCenterLinesTransitioning = countryCenterLines
                .transition(transition)
                .attrTween('d', tweenPath)
            const travelPointsTransitioning = travelPoints
                .transition(transition)
                .attrTween('d', tweenPath)
            const travelLineGradientsTransitioning = travelLineGradients
                .transition(transition)
                .tween('travel-line-gradient-attrs', tweenTravelLineGradientAttrs);
            const travelLinesTransitioning = travelLines
                .transition(transition)
                .attrTween('d', tweenPath)
            
            // update mouse focus fisheye outline
            const mouseFocusFisheyeOutlineTransitioning = mouseFocusFisheyeOutline
                .transition(transition)
                .attr('cx', newMouseFocusFisheyeFocus[0])
                .attr('cy', newMouseFocusFisheyeFocus[1])
                .attr('r', newMouseFocusFisheyeRadius);


            // update scroll position
            const scrollTransitioning = svg
                .transition(transition)
                .tween('scroll-transition', tweenScroll);

            return Promise.all([
                countriesTransitioning.end(),
                countryCenterPointsTransitioning.end(),
                countryCenterLinesTransitioning.end(),
                travelPointsTransitioning.end(),
                travelLineGradientsTransitioning.end(),
                travelLinesTransitioning.end(),
                mouseFocusFisheyeOutlineTransitioning.end(),
                scrollTransitioning.end(),
            ]);
        };

        try {
            runAnimations(
                animationState,
                UPDATE_MAP_ANIMATION_ID,
                setup,
                [update]
            );
        } catch (e) {
            console.error(e);
        }
    };
    animationState.animations[UPDATE_MAP_ANIMATION_ID] = updateMapProjection; // add animation to state

    updateMapFocus = () => {
        // function transitions the opacities of map elements to emphasize focused data
        const transitionOpacities = (
            countryCenterPointsPredicate,
            travelPointsPredicate,
            travelLinesPredicate,
            countryCenterPointsHoverPredicate,
            travelLinesHoverPredicate,
            customOtherOpacities,
        ) => {
            const countryCenterPointsTransitioning = countryCenterPoints
                .transition(getFocusTransition())
                .attr('opacity', function(d) {
                    return countryCenterPointsPredicate(d.properties)
                        ? 1
                        : (customOtherOpacities?.countryCenterPointOpacity ?? COUNTRY_CENTER_POINT_OPACITY);
                });
            const travelPointsTransitioning = travelPoints
                .transition(getFocusTransition())
                .attr('opacity', function(d) {
                    return travelPointsPredicate(d.properties)
                        ? 1
                        : (customOtherOpacities?.travelPointOpacity ?? TRAVEL_POINT_OPACITY);
                });
            const countryCenterLinesTransitioning = countryCenterLines
                .transition(getFocusTransition())
                .attr('opacity', function(_, i) {
                    return travelPointsPredicate(data.artworkTravelPointsGeoJSONFeatures[i].properties)
                        ? 1
                        : (customOtherOpacities?.travelPointOpacity ?? TRAVEL_POINT_OPACITY);
                });
            const travelLinesTransitioning = travelLines
                .transition(getFocusTransition())
                .attr('opacity', function(d) {
                    return travelLinesPredicate(d.properties)
                        ? 1
                        : (customOtherOpacities?.travelLineOpacity ?? TRAVEL_LINE_OPACITY);
                })
                .attr('stroke-width', function(d) {
                    return travelLinesPredicate(d.properties)
                        ? TRAVEL_LINE_FOCUS_WIDTH
                        : TRAVEL_LINE_WIDTH;
                });

            // if should update hoverable, remove hover interaction from all irrelevant country center points
            if (countryCenterPointsHoverPredicate != null) {
                countryCenterPoints.each(function(d) {
                    // this country is hoverable, add hover interactivity
                    if (countryCenterPointsHoverPredicate(d.properties)) {
                        d3.select(this)
                            .on('mouseover', highlightCountryDetailsOnHoverPoint)
                            .on('mouseout', unhighlightCountryDetailsOnBlurPoint);

                    // otherwise, remove hover interactivity
                    } else {
                        d3.select(this)
                            .on('mouseover', null)
                            .on('mouseout', null);
                    }
                });
            }
                
            // if should update hoverable, add interaction to travel lines that are focused
            if (travelLinesHoverPredicate != null) {
                travelLines.each(function(d) {
                    // if travel line is hoverable, add interactivity
                    if (travelLinesHoverPredicate(d.properties)) {
                        d3.select(this)
                            .style('pointer-events', 'auto')
                            .on('mouseover', highlightTravelDetailsOnHoverLine)
                            .on('mouseout', unhighlightTravelDetailsOnBlurLine)
                            .on('mouseup', focusTravelDetailsOnClickLine);

                    // otherwise, remove interactivity
                    } else {
                        d3.select(this)
                            .style('pointer-events', 'none')
                            .on('mouseover', null)
                            .on('mouseout', null)
                            .on('mouseup', null);
                    }
                });
            }

            // return promise until all transitions end
            return Promise.all([
                countryCenterPointsTransitioning.end(),
                travelPointsTransitioning.end(),
                countryCenterLinesTransitioning.end(),
                travelLinesTransitioning.end(),
            ]);
        }
        // function transitions the opacities of map elements to emphasize focused country
        const transitionFocusCountry = (focusCountryIndex, customOtherOpacities, updateHoverable) => {
            // get data about the country
            const countryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusCountryIndex].properties;
            const originArtworkCount = countryData.filteredOriginArtworks.length;
            const destArtworkCount = countryData.filteredDestArtworks.length;
            // update the focus display text
            const displayText = `${countryData.country}: ${
                originArtworkCount} originating artwork${originArtworkCount === 1 ? '' : 's'}, ${
                destArtworkCount} displayed artwork${destArtworkCount === 1 ? '' : 's'}`;
            mapFocusDisplay.textContent = displayText;

            // transition the opacities
            return transitionOpacities(
                ({ countryIndex }) => countryIndex === focusCountryIndex, // city is in country
                ({ countryIndex, filteredOriginArtworks, filteredDestArtworks }) => (
                    (countryIndex === focusCountryIndex // city is in country
                  || filteredOriginArtworks.some(artwork => artwork.destCountryIndex === focusCountryIndex)    // origin city of artwork displayed in country
                  || filteredDestArtworks.some(artwork => artwork.originCountryIndex === focusCountryIndex))), // display city of artwork originating from country
                ({ country1Index, country2Index }) =>
                    (country1Index === focusCountryIndex || country2Index === focusCountryIndex),
                updateHoverable && (({ countryIndex, filteredOriginArtworks, filteredDestArtworks }) => (
                    countryIndex === focus.detail.countryIndex // focus city is in country
                 || filteredOriginArtworks.some(artwork => artwork.destCountryIndex === focus.detail.countryIndex)  // origin city of artwork displayed in focus country
                 || filteredDestArtworks.some(artwork => artwork.originCountryIndex === focus.detail.countryIndex))), // display city of artwork originating from focus country
                updateHoverable && (({ country1Index, country2Index }) => (
                    (country1Index === focus.detail.countryIndex || country2Index === focus.detail.countryIndex))),
                customOtherOpacities,
            );
        }
        // function transitions the opacities of map elements to emphasize focused travel
        const transitionFocusTravel = (focusOriginCountryIndex, focusDestCountryIndex, customOtherOpacities, updateHoverable) => {
            // get data about the travel
            const originCountryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusOriginCountryIndex].properties;
            const destCountryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusDestCountryIndex].properties;
            const originToDestArtworkCount = data.filteredCountriesAdjacencyMatrix[focusOriginCountryIndex][focusDestCountryIndex];
            const destToOriginArtworkCount = data.filteredCountriesAdjacencyMatrix[focusDestCountryIndex][focusOriginCountryIndex];
            // update the focus display text
            const displayText = `${
                originCountryData.country} \u2192 ${destCountryData.country}: ${
                originToDestArtworkCount} artwork${originToDestArtworkCount === 1 ? '' : 's'}, ${
                destCountryData.country} \u2192 ${originCountryData.country}: ${
                destToOriginArtworkCount} artwork${destToOriginArtworkCount === 1 ? '' : 's'}`;
            mapFocusDisplay.textContent = displayText;

            // transition the opacities
            return transitionOpacities(
                ({ countryIndex }) =>
                    (countryIndex === focusOriginCountryIndex || countryIndex === focusDestCountryIndex),
                ({ countryIndex, filteredOriginArtworks, filteredDestArtworks }) => (
                    (countryIndex === focusOriginCountryIndex
                  && (filteredOriginArtworks.some(artwork => artwork.destCountryIndex === focusDestCountryIndex)   // originates from this city, goes to dest country
                   || filteredDestArtworks.some(artwork => artwork.originCountryIndex === focusDestCountryIndex))) // displayed in this city, comes from dest country
                 || (countryIndex === focusDestCountryIndex
                  && (filteredOriginArtworks.some(artwork => artwork.destCountryIndex === focusOriginCountryIndex)     // origintes from this city, goes to origin country
                   || filteredDestArtworks.some(artwork => artwork.originCountryIndex === focusOriginCountryIndex)))), // displayed in this city, comes from origin country
                ({ country1Index, country2Index }) => (
                    (country1Index === focusOriginCountryIndex && country2Index === focusDestCountryIndex)   // check both directions since line no direction
                 || (country2Index === focusOriginCountryIndex && country1Index === focusDestCountryIndex)), //
                updateHoverable && (({ countryIndex }) =>
                    (countryIndex === focusOriginCountryIndex || countryIndex === focusDestCountryIndex)),
                updateHoverable && (({ country1Index, country2Index }) => (
                    (country1Index === focusOriginCountryIndex && country2Index === focusDestCountryIndex)    // check both directions since line no direction
                 || (country2Index === focusOriginCountryIndex && country1Index === focusDestCountryIndex))), //
                customOtherOpacities,
            );
        }

        const update = () => {
            // clear focus display text
            mapFocusDisplay.textContent = '';

            // if country is focused, emphasize
            if (focus.data?.type === FOCUS_ENUM_COUNTRY) {
                return transitionFocusCountry(focus.data.countryIndex, {
                    countryCenterPointOpacity: FOCUS_OTHER_COUNTRY_CENTER_POINT_OPACITY,
                    travelPointOpacity: FOCUS_OTHER_TRAVEL_POINT_OPACITY,
                    travelLineOpacity: FOCUS_OTHER_TRAVEL_LINE_OPACITY,
                });

            // if travel is focused, emphasize
            } else if (focus.data?.type === FOCUS_ENUM_TRAVEL) {
                return transitionFocusTravel(focus.data.originCountryIndex, focus.data.destCountryIndex, {
                    countryCenterPointOpacity: FOCUS_OTHER_COUNTRY_CENTER_POINT_OPACITY,
                    travelPointOpacity: FOCUS_OTHER_TRAVEL_POINT_OPACITY,
                    travelLineOpacity: FOCUS_OTHER_TRAVEL_LINE_OPACITY,
                });

            // if country details focused, emphasize
            } else if (focus.detail?.type === FOCUS_ENUM_COUNTRY) {
                return transitionFocusCountry(focus.detail.countryIndex, null, true);

            // if travel details focused, emphasize
            } else if (focus.detail?.type === FOCUS_ENUM_TRAVEL) {
                return transitionFocusTravel(focus.detail.originCountryIndex, focus.detail.destCountryIndex, null, true);

            // if no focus, return all to default opacity
            } else {
                return transitionOpacities(
                    () => false, // reset opacities
                    () => false, //
                    () => false, //
                    () => true, // all country center points hoverable
                    () => false, // all travel lines unhoverable
                );
            }
        }

        try {
            runAnimations(
                animationState,
                UPDATE_FOCUS_ANIMATION_ID,
                null,
                [update]
            );
        } catch (e) {
            console.error(e);
        }
    }
    animationState.animations[UPDATE_FOCUS_ANIMATION_ID] = updateMapFocus; // add animation to state

    updateMapFiltering = () => {
        // predicates for whether the element is filtered out or not, before and after changes (true if remain, false if filtered)
        const countryCenterPointFilterPredicate = (d, i) => d.properties.filteredOriginArtworks.length > 0
                                                    || d.properties.filteredDestArtworks.length   > 0
                                                    || data.countryFilters[i]; // if in country filter, show
        const countryCenterLineFilterPredicate = (_, i) => {
            const travelPoint = data.artworkTravelPointsGeoJSONFeatures[i];
            return travelPoint.properties.filteredOriginArtworks.length > 0
                || travelPoint.properties.filteredDestArtworks.length   > 0;
        };
        const travelPointFilterPredicate = d => d.properties.filteredOriginArtworks.length > 0
                                             || d.properties.filteredDestArtworks.length   > 0;
        const travelLineFilterPredicate = d => d.properties.filteredTravels.length > 0;

        // function updates the element's opacity based on how the element changes from before to after the filtering
        const updateOpacity = (filterPredicate, newFilteredOpacity) => function(...params) {
            // get values
            const selection = d3.select(this);
            const prevShown = selection.attr('display') !== 'none'; // if hidden, know was filtered out
            const currShown = filterPredicate(...params);
            
            if (prevShown === currShown) {
                return selection.attr('opacity'); // if not changed, don't change
            }
            if (currShown) {
                return newFilteredOpacity; // if newly included in filtering, fade in to given opacity
            } else {
                return 0; // if newly removed from filtering, fade out
            }
        }

        // function sets the element's opacity to 0 if it is fading in, so that it can start from a transparent state
        const setOpacityIfNewlyShown = (filterPredicate) => function(...params) {
            // get values
            const selection = d3.select(this);
            const prevShown = selection.attr('display') !== 'none'; // if hidden, know was filtered out
            const currShown = filterPredicate(...params);
            
            if (!prevShown && currShown) {
                return 0; // so will fade in from transparent
            } else {
                return selection.attr('opacity'); // leave unchanged otherwise
            }
        }

        // function unhides the display if the element is shown so can be faded in, otherwise leaves as is
        const unhideDisplayIfShown = (filterPredicate) => function(...params) {
            if (filterPredicate(...params)) {
                return 'inherit';
            } else {
                return d3.select(this).attr('display'); // leave unchanged otherwise
            }
        }

        // function hides the display if the element is hidden so don't waste resources, otherwise leaves as is
        function hideDisplayIfHidden() {
            const selection = d3.select(this);
            if (selection.attr('opacity') === '0') { // don't use filterPredicate, since is after await data may have different values
                return 'none';
            } else {
                return d3.select(this).attr('display'); // leave unchanged otherwise
            }
        }

        const update = async () => {
            // fade country points
            const countryCenterPointsTransitioning = countryCenterPoints
                .attr('opacity', setOpacityIfNewlyShown(countryCenterPointFilterPredicate))
                .transition(getFilteringTransition())
                .attr('opacity', updateOpacity(countryCenterPointFilterPredicate, COUNTRY_CENTER_POINT_OPACITY))
                .attr('display', unhideDisplayIfShown(countryCenterPointFilterPredicate))
                .attr('fill', function(_, i) {
                    if (data.countryFilters[i]) {
                        return COUNTRY_CENTER_POINT_FILTER_COLOR;
                    } else {
                        return COUNTRY_CENTER_POINT_COLOR;
                    }
                });
            
            // fade lines to regions
            const countryCenterLinesTransitioning = countryCenterLines
                .attr('opacity', setOpacityIfNewlyShown(countryCenterLineFilterPredicate))
                .transition(getFilteringTransition())
                .attr('opacity', updateOpacity(countryCenterLineFilterPredicate, TRAVEL_POINT_OPACITY))
                .attr('display', unhideDisplayIfShown(countryCenterLineFilterPredicate));
            
            // fade the travel points, adjust color based on new origin-dest proportion
            const travelPointsTransitioning = travelPoints
                .attr('opacity', setOpacityIfNewlyShown(travelPointFilterPredicate))
                .transition(getFilteringTransition())
                .attr('opacity', updateOpacity(travelPointFilterPredicate, TRAVEL_POINT_OPACITY))
                .attr('display', unhideDisplayIfShown(travelPointFilterPredicate))
                .attr('fill', function(d) { // transition all fills to be updated color
                    const p = proportion(d.properties.originArtworks.length, d.properties.destArtworks.length);
                    return TRAVEL_COLOR_SCALE(p);
                });

            // fade the travel lines
            const travelLinesTransitioning = travelLines
                .attr('opacity', setOpacityIfNewlyShown(travelLineFilterPredicate))
                .transition(getFilteringTransition())
                .attr('opacity', updateOpacity(travelLineFilterPredicate, TRAVEL_LINE_OPACITY))
                .attr('display', unhideDisplayIfShown(travelLineFilterPredicate));

            // update the gradients of the travel lines to match the updated data
            const travelLineGradientsTransitioning = travelLineGradients
                .transition(getFilteringTransition())
                .each(function(d) { updateTravelLineGradientColors(d, this); });

            // wait until the transitions finish
            await Promise.all([
                countryCenterPointsTransitioning.end(),
                countryCenterLinesTransitioning.end(),
                travelPointsTransitioning.end(),
                travelLinesTransitioning.end(),
                travelLineGradientsTransitioning.end(),
            ]);

            // hide the faded elements so don't take up unnecessary resources
            countryCenterPoints.attr('display', hideDisplayIfHidden);
            countryCenterLines.attr('display', hideDisplayIfHidden);
            travelPoints.attr('display', hideDisplayIfHidden);
            travelLines.attr('display', hideDisplayIfHidden);

            // update the focus styling to reflect the new data
            updateMapFocus();
        };

        try {
            runAnimations(
                animationState,
                UPDATE_FILTERING_ANIMATION_ID,
                null,
                [update]
            );
        } catch (e) {
            console.error(e);
        }
    };
    animationState.animations[UPDATE_FILTERING_ANIMATION_ID] = updateMapFiltering; // add animation to state


    //#endregion
}