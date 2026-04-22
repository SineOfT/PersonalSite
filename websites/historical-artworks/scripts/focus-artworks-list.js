import { FOCUS_ENUM_COUNTRY, FOCUS_ENUM_TRAVEL } from './enums.js';
import { getImageURL, convertNameToConventional } from './utils.js';

//////////////////////
//#region CONSTANTS //
//////////////////////

const ARTWORK_LIST_DISPLAY_COUNT_STEP = 20; // display 20 artworks at a time, triggering loading in between

//#endregion

/////////////////////////
//#region DOM ELEMENTS //
/////////////////////////

const ARTWORKS_FOCUS__ACCORDION_ID = 'artworksFocusAccordion';

// get HTML elements
const artworksFocusHeader = document.getElementById('artworksFocusHeader');
const artworksFocusAccordion = document.getElementById(ARTWORKS_FOCUS__ACCORDION_ID);

//#endregion

/////////////////////////////
//#region HELPER FUNCTIONS //
/////////////////////////////

// function formats a total and filtered count, only showing the information that is needed
const formatFilteredAndTotalCounts = (totalCount, filteredCount) =>
    totalCount === filteredCount
        ? totalCount // if total and filtered same, show just the one number
        : `${filteredCount}\xa0of\xa0${totalCount}`; // use non-breaking spaces to keep as one text block

//#endregion

// function will update the artworks list sidebar on the site, once initialized
export let updateFocusArtworksListFocusDetail = () => { };

// adding filters to the data will recompute the focus to reflect the new changes
export let updateFocusArtworksListFiltering = () => {
    updateFocusArtworksListFocusDetail();
}

// function initializes the artwork list, connecting it to the focus data and activating the update function
export function initFocusArtworksList(data, focus, setFocusData, setFocusDetail) {

    /////////////////////////////
    //#region RENDER FUNCTIONS //
    /////////////////////////////

    // function takes in artwork data and converts it into HTML content
    function getArtworksFocusItem({ artworkIndex, originIndex, destIndex }) {
        const artwork = data.artworksCSV[artworkIndex];
        const originRegion = data.artworkRegionsCSV[originIndex];
        const destRegion = data.artworkRegionsCSV[destIndex];
        const li = document.createElement('li');
        return `
            <div class="d-flex flex-wrap gap-3 p-1">
                <div>
                    <img src=${getImageURL(artwork.url)} class="artwork-thumbnail" loading="lazy" />
                </div>
                <div class="artwork-thumbnail-content">
                    <h3 class="h6 m-0">${artwork.title} (${artwork.date})</h3>
                    <div class="text-secondary"><small>${artwork.form.toTitleCase()} - ${artwork.technique}</small></div>
                    <div>${convertNameToConventional(artwork.author)} (${originRegion.name}, ${originRegion.country})</div>
                    <div><small>Displayed in ${destRegion.name}, ${destRegion.country}</small></div>
                    <div><a href="${artwork.url}" target="_blank" class="hyperlink-sm">(see on Web Gallery of Art website)</a></div>
                </div>
            </div>
        `;
    };

    // function detects when the bottom of the artworks list has been reached, and loads more artworks when it does
    function loadMoreArtworksWhenReachEnd(artworksList, loadingDisplay, artworks, initalArtworkListDisplayCount) {
        // store the current number of artworks displayed
        let artworkListDisplayCount = initalArtworkListDisplayCount;
        
        // create an observer to detect when the end of the list has been reached
        let loadingObserver;
        
        // function loads another step of artworks into the list, called when the end of the list is reached
        const callbackOnReachEnd = (entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                // when reach bottom, load another step of artworks in list
                const prevArtworkListDisplayCount = artworkListDisplayCount; // store how many displayed before loading more
                for (;
                    // increment until either reach all artworks or load another step of artworks
                    artworkListDisplayCount < Math.min(artworks.length, prevArtworkListDisplayCount + ARTWORK_LIST_DISPLAY_COUNT_STEP);
                    artworkListDisplayCount++
                ) {
                    const artworkData = artworks[artworkListDisplayCount];
                    const li = document.createElement('li');
                    li.innerHTML = getArtworksFocusItem(artworkData);
                    artworksList.append(li);
                }

                // if all artworks loaded, remove observer
                if (artworkListDisplayCount >= artworks.length) {
                    loadingObserver.disconnect();
                    loadingDisplay.remove();
                }
            }
        }

        // instantiate the observer
        loadingObserver = new IntersectionObserver(callbackOnReachEnd, { threshold: 0.0, });
        loadingObserver.observe(loadingDisplay);
    }

    // function renders the artworks based on a list of artworks and puts it into the DOM
    function createArtworksList(artworks) {
        // define DOM elements
        // list that holds the artworks
        const artworksList = document.createElement('ul');
        artworksList.classList.add('block-list');
        // container than combines elements
        const artworksListContainer = document.createElement('div');
        artworksListContainer.appendChild(artworksList);

        // load only up to max number of artworks in list at a time
        let artworkListDisplayCount = 0;
        for (; artworkListDisplayCount < Math.min(artworks.length, ARTWORK_LIST_DISPLAY_COUNT_STEP); artworkListDisplayCount++) {
            const artworkData = artworks[artworkListDisplayCount];
            const li = document.createElement('li');
            li.innerHTML = getArtworksFocusItem(artworkData);
            artworksList.append(li);
        }

        // if still more artworks to load, add observer to load more when bottom reached
        if (artworkListDisplayCount < artworks.length) {
            // show loading display and add to bottom of list
            const loadingDisplay = document.createElement('div');
            loadingDisplay.classList.add('text-center');
            loadingDisplay.textContent = 'Loading more...';
            artworksListContainer.appendChild(loadingDisplay);

            // load more artworks when this loading display is reached
            loadMoreArtworksWhenReachEnd(artworksList, loadingDisplay, artworks, artworkListDisplayCount);
        }

        return artworksListContainer;
    }

    // function creates an accordion item that contains artworks, so the user can collapse the sections freely
    function createAccordionItem(id, headerText, artworks) {
        // render accordion header
        const accordionButton = document.createElement('button');
        accordionButton.type = 'button';
        accordionButton.classList.add('accordion-button', 'collapsed');
        accordionButton.setAttribute('data-bs-toggle', 'collapse');
        accordionButton.setAttribute('data-bs-target', `#${id}`);
        accordionButton.setAttribute('aria-expanded', 'false');
        accordionButton.setAttribute('aria-controls', id);
        accordionButton.textContent = headerText;

        const accordionHeader = document.createElement('h3');
        accordionHeader.classList.add('accordion-header');
        accordionHeader.appendChild(accordionButton);

        // render accordion body
        const accordionBody = document.createElement('div');
        accordionBody.classList.add('accordion-body');

        // render list of artworks, or empty message if none
        if (artworks.length === 0) {
            const emptyMessageBlock = document.createElement('div');
            emptyMessageBlock.textContent = 'No artworks found';
            accordionBody.appendChild(emptyMessageBlock);
        } else {
            const artworksListContainer = createArtworksList(artworks);
            accordionBody.appendChild(artworksListContainer);
        }

        // render collapsing section so can hide unneeded parts
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = id;
        accordionCollapse.classList.add('accordion-collapse', 'collapse');
        accordionCollapse.setAttribute('data-bs-parent', `#${ARTWORKS_FOCUS__ACCORDION_ID}`);
        accordionCollapse.appendChild(accordionBody);

        // combine into one element and return
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item', 'overflow-x-hidden');
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);

        return accordionItem;
    }

    //#endregion

    ///////////////////
    //#region UPDATE //
    ///////////////////

    // function updates the style of a lock icon to be either locked or unlocked
    const updateLockIcon = (lockIcon, isLocked) => {
        if (isLocked) {
            lockIcon.classList.remove('bi-unlock');
            lockIcon.classList.add('bi-lock');
            lockIcon.style.paddingLeft = '0'; // reset padding back to normal
        } else {
            lockIcon.classList.remove('bi-lock');
            lockIcon.classList.add('bi-unlock');
            lockIcon.style.paddingLeft = '0.12em'; // since lock and unlock are slightly offset, unlock offset to left
        }
    }

    // function populates the artworks focus header the provided heading, and with a button to remove focus
    const populateArtworksFocusHeader = (headingText) => {
        const heading = document.createElement('h2');
        heading.classList.add('h5', 'm-0');
        heading.textContent = headingText;

        // button that lets users lock the focused country details selection
        const lockButton = document.createElement('button');
        lockButton.type = 'button';
        lockButton.classList.add('btn', 'p-0');
        lockButton.style.width = '1em';
        lockButton.style.height = '1em';
        lockButton.style.fontSize = '1.5rem';
        lockButton.style.lineHeight = '0';
        // lock icon using Bootstrap Icons
        const lockButtonIcon = document.createElement('i');
        lockButtonIcon.classList.add('bi', 'text-secondary');
        updateLockIcon(lockButtonIcon, focus.detail.isLocked);
        lockButton.appendChild(lockButtonIcon);
        // toggle whether locked on click
        lockButton.addEventListener('click', function() {
            focus.detail.isLocked = !focus.detail.isLocked;
            updateLockIcon(lockButtonIcon, focus.detail.isLocked);
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('btn', 'btn-close', 'ms-auto');
        removeButton.setAttribute('aria-label', 'Close');
        removeButton.addEventListener('click', function() {
            setFocusDetail(null); // remove the focus when the remove button is clicked
        });

        artworksFocusHeader.appendChild(heading);
        artworksFocusHeader.appendChild(lockButton);
        artworksFocusHeader.appendChild(removeButton);
    }

    // function updates the artworks list sidebar on the site
    updateFocusArtworksListFocusDetail = () => {
        // remove previous data from DOM
        artworksFocusHeader.replaceChildren([]);
        artworksFocusAccordion.replaceChildren([]);

        // if focused on country, show all artworks that relate to the country
        if (focus.detail?.type === FOCUS_ENUM_COUNTRY) {
            // find country data
            const countryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focus.detail.countryIndex].properties;
            // determine number of origin and dest artworks, display how many total if there are filters
            const { originTotalCount, destTotalCount } = countryData.regions.reduce(
                ({ originTotalCount, destTotalCount }, { originArtworks, destArtworks }) => (
                    { originTotalCount: originTotalCount + originArtworks.length, destTotalCount: destTotalCount + destArtworks.length }
                ), { originTotalCount: 0, destTotalCount: 0 });
            const originFilteredCount = countryData.filteredOriginArtworks.length;
            const destFilteredCount = countryData.filteredDestArtworks.length;
            
            // update title
            const headingText = countryData.country;
            populateArtworksFocusHeader(headingText);

            // create accordion items for origin and dest artworks
            const originArtworksItem = createAccordionItem(
                'originArtworksAccordionItem',
                `Originating Artworks (${formatFilteredAndTotalCounts(originTotalCount, originFilteredCount)})`,
                countryData.filteredOriginArtworks,
            );
            const destArtworksItem = createAccordionItem(
                'destArtworksAccordionItem',
                `Displayed Artworks (${formatFilteredAndTotalCounts(destTotalCount, destFilteredCount)})`,
                countryData.filteredDestArtworks
            );
            artworksFocusAccordion.appendChild(originArtworksItem);
            artworksFocusAccordion.appendChild(destArtworksItem);

        // if focused on travel, show artworks only between the two countries
        } else if (focus.detail?.type === FOCUS_ENUM_TRAVEL) {
        // find country data and travel line between them
            const originCountryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focus.detail.originCountryIndex].properties;
            const destCountryData = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focus.detail.destCountryIndex].properties;
            const travelLineData = data.artworkTravelLinesGeoJSONFeatures.find(({ properties }) =>
                (properties.country1Index === focus.detail.originCountryIndex && properties.country2Index === focus.detail.destCountryIndex)
            || (properties.country2Index === focus.detail.originCountryIndex && properties.country1Index === focus.detail.destCountryIndex)
            ).properties;
            const isOrderSame = travelLineData.country1Index === focus.detail.originCountryIndex; // store whether 1->2 is same as origin->dest
            // determine number of origin and dest artworks, display how many total if there are filters
            const { originToDestTotalCount, destToOriginTotalCount } = travelLineData.travels.reduce(
                (acc, { isOriginToDest }) => {
                    if (isOriginToDest === isOrderSame) { acc.originToDestTotalCount++; }
                    else                                { acc.destToOriginTotalCount++; }
                    return acc;
                },
                { originToDestTotalCount: 0, destToOriginTotalCount: 0 }
            );
            (originToDestTotalCount, destToOriginTotalCount);
            const { originToDestArtworks, destToOriginArtworks } = travelLineData.filteredTravels.reduce(
                (acc, { artworkIndex, originIndex, destIndex, isOriginToDest }) => {
                    if (isOriginToDest === isOrderSame) { acc.originToDestArtworks.push({ artworkIndex, originIndex, destIndex }); }
                    else                                { acc.destToOriginArtworks.push({ artworkIndex, originIndex, destIndex }); }
                    return acc;
                },
                { originToDestArtworks: [], destToOriginArtworks: [] }
            );

            // update title
            const headingText = `${originCountryData.country} and ${destCountryData.country}`;
            populateArtworksFocusHeader(headingText);

            // create accordion items for artworks for forward travel directions
            const originToDestArtworksItem = createAccordionItem(
                'originToDestArtworksAccordionItem',
                `${originCountryData.country} \u2192 ${destCountryData.country} Artworks (${
                    formatFilteredAndTotalCounts(originToDestTotalCount, originToDestArtworks.length)})`,
                originToDestArtworks,
            );
            artworksFocusAccordion.appendChild(originToDestArtworksItem);

            // if reverse travel direction included, create accordion item for those artworks as well
            // also ensure that not same origin and dest country, since would double up data
            if (focus.detail.includeReverseDirection && focus.detail.originCountryIndex !== focus.detail.destCountryIndex) {
                const destToOriginArtworksItem = createAccordionItem(
                    'destToOriginArtworksAccordionItem',
                    `${destCountryData.country} \u2192 ${originCountryData.country} Artworks (${
                        formatFilteredAndTotalCounts(destToOriginTotalCount, destToOriginArtworks.length)})`,
                    destToOriginArtworks,
                );
                artworksFocusAccordion.appendChild(destToOriginArtworksItem);
            }
        
        // if unfocused, remove text
        } else {
            const heading = document.createElement('div'); // since not a heading, don't use h tags
            heading.classList.add('h5', 'm-0');
            heading.textContent = 'No Country Focused';
            artworksFocusHeader.appendChild(heading);
        }
    }

    //#endregion
}
