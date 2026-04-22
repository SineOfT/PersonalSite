import { updateCountriesChordDiagramFiltering } from "./countries-chord-diagram.js";
import { APPEND_TYPE_ENUM_ADDITIVE, APPEND_TYPE_ENUM_REPLACE, APPEND_TYPE_ENUM_SUBTRACTIVE } from "./enums.js";
import { updateFocusArtworksListFiltering } from "./focus-artworks-list.js";
import { updateMapFiltering } from "./map.js";
import { updateTopCountriesFiltering } from "./top-countries-graph.js";
import { convertNameToConventional, inverseLerp, throttleAction } from "./utils.js";

//////////////////////
//#region CONSTANTS //
//////////////////////

const DUAL_RANGE_THROTTLE_MS = 100;

const DROPDOWN_MAX_HEIGHT = '10rem'; // not too big to reduce problems with nested scroll bars
const DROPDOWN_OPTIONS_LOAD_STEP = 20; // only load 20 options at a time

//#endregion

// function will update the selected countries in the filter based on the provided countries list and append type, used for lassoing
export let updateCountryFilters = () => { };

export function initFilterControls(data) {

    /////////////////////////
    //#region DOM ELEMENTS //
    /////////////////////////

    const filtersContainer = document.getElementById('filtersContainer');

    let artworkFormsFilterEnableSwitch = null;
    let artworkFormsFilterInputs = [];

    let artworkThemesFilterEnableSwitch = null;
    let artworkThemesFilterInputs = [];

    let artworkArtistsFilterEnableSwitch = null;
    let artworkArtistsFilterDropdown = null;

    let countriesFilterEnableSwitch = null;
    let countriesFilterDropdown = null;
    let countriesFilterRequireBothSidesOfTravelSwitch = null;

    let artworkTitleKeywordsFilterEnableSwitch = null;
    let artworkTitleKeywordsFilterDropdown = null;

    let artworkTimeframeFilterEnableSwitch = null;
    let artworkTimeframeFilterMinRangeInput = null;
    let artworkTimeframeFilterMaxRangeInput = null;

    let artworkIgnoreWithinCountryTravelsFilterEnableSwitch = null;

    /////////////////////////
    //#region UPDATE LOGIC //
    /////////////////////////

    // function updates the artwork filters flag array based on the selected artwork form options, if enabled
    function updateFiltersFromArtworkFormsFilter() {
        if (artworkFormsFilterEnableSwitch.checked) { // only apply filters if enabled
            // get artwork form filters from user inputs
            const artworkFormFilters = artworkFormsFilterInputs
                .filter(checkbox => checkbox.checked) // find all unchecked artwork forms
                .map(checkbox => checkbox.value); // get the name of the artwork forms
            // do not filter if none selected
            if (artworkFormFilters.length === 0) return;
            // filter to include only where form included in selected options
            data.artworkFilters = data.artworkFilters.map((filter, i) => filter && artworkFormFilters.includes(data.artworksCSV[i].form));
        }
    }

    // function updates the artwork filters flag array based on the selected artwork theme options, if enabled
    function updateFiltersFromArtworkThemesFilter() {
        if (artworkThemesFilterEnableSwitch.checked) { // only apply filters if enabled
            // get artwork theme filters from user inputs
            const artworkThemeFilters = artworkThemesFilterInputs
                .filter(checkbox => checkbox.checked) // find all unchecked artwork themes
                .map(checkbox => checkbox.value); // get the name of the artwork themes
            // do not filter if none selected
            if (artworkThemeFilters.length === 0) return;
            // filter to include only where theme included in selected options
            data.artworkFilters = data.artworkFilters.map((filter, i) => filter && artworkThemeFilters.includes(data.artworksCSV[i].type));
        }
    }

    // function updates the artwork filters flag array based on the selected artwork artists, if enabled
    function updateFiltersFromArtworkArtistsFilter() {
        if (artworkArtistsFilterEnableSwitch.checked) { // only apply filters if enabled
            // get artwork artist filters from user inputs
            const artworkArtistFilters = Array.from(artworkArtistsFilterDropdown.selectedOptions, option => option.value); // get the name of the artwork artists
            // do not filter if none selected
            if (artworkArtistFilters.length === 0) return;
            // filter to include only where artist included in selected options
            data.artworkFilters = data.artworkFilters.map((filter, i) => filter && artworkArtistFilters.includes(data.artworksCSV[i].author));
        }
    }

    // function updates the artwork filters flag array based on the selected countries, if enabled
    function updateFiltersFromCountriesFilter() {
        if (countriesFilterEnableSwitch.checked) { // only apply filters if enabled
            // get country filters from user inputs
            const countryFilters = Array.from(countriesFilterDropdown.selectedOptions, option => option.value);
            // do not filter if none selected
            if (countryFilters.length === 0) {
                data.countryFilters = data.countryFilters.map(_ => false); // remove all country filters from data
                return;
            };
            // check if both sides of travel are required
            const requireBothSidesOfTravel = countriesFilterRequireBothSidesOfTravelSwitch.checked;
            // update filter to include only where the country where artwork originates and is displayed is both in selected list
            data.artworkRegionCountryCenterPointsGeoJSONFeatures.forEach(({ properties }, countryIndex) => {
                const filterIncludesCountry = countryFilters.includes(properties.country);
                data.countryFilters[countryIndex] = filterIncludesCountry; // add to data so can use for special styling
                if (filterIncludesCountry && !requireBothSidesOfTravel) return; // if origin country in filters and both sides not required, none filtered out
                const filterOutAll = !filterIncludesCountry && requireBothSidesOfTravel; // if origin country not in filters and both sides required, all filtered out
                // otherwise, either way dest country must be in filters for artwork to not be filtered out
                properties.regions.forEach(({ originArtworks }) => { // only need iterate origin since iterating over all and dests will be another's origin
                    originArtworks.forEach(({ artworkIndex, destIndex }) => {
                        if (filterOutAll || !countryFilters.includes(data.artworkRegionsCSV[destIndex].country)) {
                            data.artworkFilters[artworkIndex] = false; // if filtered out or dest not in selection, filter out
                        }
                    });
                });
            });
        } else {
            // if disabled, ensure that country filters is cleared
            data.countryFilters = data.countryFilters.map(_ => false);
        }
    }

    // function updates the artwork filters flag array based on the selected artwork title keywords, if enabled
    function updateFiltersFromArtworkTitleKeywordsFilter() {
        if (artworkTitleKeywordsFilterEnableSwitch.checked) { // only apply filters if enabled
            // get artwork title keyword filters from user inputs
            const artworkTitleKeywordFilters = Array.from(artworkTitleKeywordsFilterDropdown.selectedOptions, option => option.value); // get the title keywords
            // do not filter if none selected
            if (artworkTitleKeywordFilters.length === 0) return;
            // filter to include only where title contains a given title keyword
            data.artworkFilters = data.artworkFilters.map((filter, i) => filter && artworkTitleKeywordFilters.some(titleKeyword =>
                titleKeyword.split(' AND ').every(keyword => // if any AND operators, split and require all to be included
                    data.artworksCSV[i].title.toLowerCase().includes(keyword.trim().toLowerCase())
                )
            ));
        }
    }
    
    // function updates the artwork filters flag array based on the selected artwork timeframe, if enabled 
    function updateFiltersFromArtworkTimeframeFilter() {
        if (artworkTimeframeFilterEnableSwitch.checked) { // only apply filters if enabled
            // get user inputted range
            const minYear = parseInt(artworkTimeframeFilterMinRangeInput.value);
            const maxYear = parseInt(artworkTimeframeFilterMaxRangeInput.value);
            // define condition to keep artwork
            const withinRange = (timeframe) => {
                const [minTimeframeYear, maxTimeframeYear] = timeframe.split('-');
                return minYear <= parseInt(minTimeframeYear) && maxYear >= parseInt(maxTimeframeYear);
            }
            // filter to include only where timeframe within user defined range
            data.artworkFilters = data.artworkFilters.map((filter, i) => filter && withinRange(data.artworksCSV[i].timeframe));
        }
    }

    // function updates the artwork filters flag array based on whether within-country travels is enabled
    function udpateFiltersFromArtworkIgnoreWithinCountryTravelsFilter() {
        if (artworkIgnoreWithinCountryTravelsFilterEnableSwitch.checked) { // only apply filters if enabled
            data.artworkRegionCountryCenterPointsGeoJSONFeatures.forEach(({ properties }) => {
                properties.regions.forEach(({ originArtworks }) => { // only need iterate origin since if within-country will also be in dest
                    originArtworks.forEach(({ artworkIndex, destIndex }) => {
                        if (data.artworkRegionsCSV[destIndex].country === properties.country) {
                            data.artworkFilters[artworkIndex] = false; // if origin and dest countries same, filter out
                        }
                    });
                });
            });
        }
    }

    // function updates the artwork data based on the filters that are currently set at time of call
    function updateDataFromFilters() {
        // reset artwork filters flag array to be all included
        data.artworkFilters = data.artworkFilters.map(() => true);

        // update artwork filters flag array based on enabled filters
        updateFiltersFromArtworkFormsFilter();
        updateFiltersFromArtworkThemesFilter();
        updateFiltersFromArtworkArtistsFilter();
        updateFiltersFromCountriesFilter();
        updateFiltersFromArtworkTitleKeywordsFilter();
        updateFiltersFromArtworkTimeframeFilter();
        udpateFiltersFromArtworkIgnoreWithinCountryTravelsFilter();

        // update artwork country points based on filters
        data.artworkRegionCountryCenterPointsGeoJSONFeatures.forEach(({ properties }) => {
            const { filteredOriginArtworks, filteredDestArtworks } =
                properties.regions.reduce((acc, { regionIndex, originArtworks, destArtworks }) => {
                    // accumulate only the origin artworks that are not filtered out
                    acc.filteredOriginArtworks.push(...originArtworks
                        .filter(({ artworkIndex }) => data.artworkFilters[artworkIndex])
                        .map(artwork => ({ ...artwork, originIndex: regionIndex }))
                    );
                    // accumulate only the dest artworks that are not filtered out
                    acc.filteredDestArtworks.push(...destArtworks
                        .filter(({ artworkIndex }) => data.artworkFilters[artworkIndex])
                        .map(artwork => ({ ...artwork, destIndex: regionIndex }))
                    );
                    return acc;
                }, { filteredOriginArtworks: [], filteredDestArtworks: [] });
            properties.filteredOriginArtworks = filteredOriginArtworks;
            properties.filteredDestArtworks = filteredDestArtworks;
        });

        // update artwork travel points based on filters
        data.artworkTravelPointsGeoJSONFeatures.forEach(({ properties }) => {
            properties.filteredOriginArtworks = properties.originArtworks
                .filter(({ artworkIndex }) => data.artworkFilters[artworkIndex]);
            properties.filteredDestArtworks = properties.destArtworks
                .filter(({ artworkIndex }) => data.artworkFilters[artworkIndex]);
        });

        // update artwork travel lines based on filters
        data.artworkTravelLinesGeoJSONFeatures.forEach(({ properties }) => {
            properties.filteredTravels = properties.travels
                .filter(({ artworkIndex }) => data.artworkFilters[artworkIndex]);
        });

        // determine the artwork counts of each country, convert to graph format (directed and weighted)
        data.filteredCountriesAdjacencyMatrix = data.artworkRegionCountryCenterPointsGeoJSONFeatures.map(({ properties }) => // create a row for each top country (row represents origin)
            properties.filteredOriginArtworks.reduce(
                (acc, artwork) => { // increment the count for this artwork's dest country (column represents dest)
                    acc[artwork.destCountryIndex]++;
                    return acc;
                },
                data.artworkRegionCountryCenterPointsGeoJSONFeatures.map(_ => 0) // row contains one entry per each top country, start count at 0
            )
        );

        // update visualizations based on new filtering
        updateMapFiltering();
        updateTopCountriesFiltering();
        updateCountriesChordDiagramFiltering();
        updateFocusArtworksListFiltering();
    }
 
    //#endregion

    ///////////////////////////
    //#region INITIALIZATION //
    ///////////////////////////

    // function creates controls for a multiselect filter on the DOM
    const createFilterContainer = (idPrefix, labelText, isEnabled, collapseBody, collapseButtons, tooltipText) => {
        // create unique IDs to give to elements
        const filterEnableSwitchId = `${idPrefix}FilterEnableSwitch`;
        const collapseClass = `${idPrefix}Collapse`;
        const collapseButtonsId = `${collapseClass}Buttons`;
        const collapseBodyId = `${collapseClass}Body`;
        
        // create the label and switch to enable filtering
        const legend = document.createElement('legend');
        legend.classList.add('h6', 'fw-bold', 'm-0');
        legend.textContent = labelText;

        const legendLabel = document.createElement('label');
        legendLabel.htmlFor = filterEnableSwitchId;
        legendLabel.classList.add('form-check-label');
        legendLabel.appendChild(legend);

        const filterEnableInput = document.createElement('input');
        filterEnableInput.type = 'checkbox';
        filterEnableInput.id = filterEnableSwitchId;
        filterEnableInput.role = 'switch';
        filterEnableInput.checked = isEnabled;
        filterEnableInput.classList.add('form-check-input', 'site-form-check-input');
        filterEnableInput.setAttribute('switch', 'switch');
        // toggling this input will affect whether the collapse is collapsed or not
        filterEnableInput.setAttribute('data-bs-toggle', 'collapse');
        filterEnableInput.setAttribute('data-bs-target', `.${collapseClass}`);
        filterEnableInput.setAttribute('aria-expanded', 'false'),
        filterEnableInput.setAttribute('aria-controls', `${
            collapseBody != null ? collapseBodyId : ''} ${
            collapseButtons != null ? collapseButtonsId : ''}`);
        filterEnableInput.addEventListener('change', updateDataFromFilters); // update if change whether filters enabled

        const filterEnableSwitch = document.createElement('div');
        filterEnableSwitch.classList.add('form-check', 'form-check-reverse', 'form-switch', 'w-fit', 'm-0');
        filterEnableSwitch.appendChild(legendLabel);
        filterEnableSwitch.appendChild(filterEnableInput);

        // a tooltip to get information when hovering about what this control does
        const tooltip = document.createElement('button');
        tooltip.type = 'button';
        tooltip.classList.add('btn', 'p-0', 'fw-bold', 'info-tooltip');
        tooltip.setAttribute('data-bs-toggle', 'tooltip');
        tooltip.setAttribute('data-bs-title', tooltipText);
        new bootstrap.Tooltip(tooltip); // instantiate tooltip

        const tooltipIcon = document.createElement('i');
        tooltipIcon.classList.add('bi', 'bi-info-circle-fill', 'text-secondary');
        tooltip.appendChild(tooltipIcon);

        // create container to put tooltip inside
        const filterEnableSwitchContainer = document.createElement('div');
        filterEnableSwitchContainer.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-3');
        filterEnableSwitchContainer.appendChild(filterEnableSwitch);
        filterEnableSwitchContainer.appendChild(tooltip);

        // create header to show content in a row
        const headerRow = document.createElement('div');
        headerRow.classList.add('d-flex', 'flex-row', 'flex-wrap', 'justify-content-between', 'mb-2');
        headerRow.appendChild(filterEnableSwitchContainer);

        // if any collapse buttons, add to header and configure to hide when filtering disabled
        if (collapseButtons != null) {
            const selectionButtonsContainer = document.createElement('div');
            selectionButtonsContainer.classList.add('d-flex', 'flex-row', 'gap-2');
            selectionButtonsContainer.style.width = 'max-content'; // needed for horizontal collapse
            selectionButtonsContainer.append(...collapseButtons);
            
            const selectionButtonsCollapse = document.createElement('div');
            selectionButtonsCollapse.id = collapseButtonsId;
            selectionButtonsCollapse.classList.add('collapse', 'collapse-horizontal', collapseClass);
            if (isEnabled) { selectionButtonsCollapse.classList.add('show'); } // if enabled, show on default
            selectionButtonsCollapse.appendChild(selectionButtonsContainer);
            headerRow.appendChild(selectionButtonsCollapse);
        }

        // combine elements in semantic fieldset container
        const fieldset = document.createElement('fieldset');
        fieldset.appendChild(headerRow);

        // if any collapse body, add to fieldset and configure to hide when filtering disabled
        if (collapseBody != null) {
            const body = document.createElement('div');
            body.id = collapseBodyId;
            body.classList.add('collapse', collapseClass);
            if (isEnabled) { body.classList.add('show'); } // if enabled, show on default
            body.appendChild(collapseBody);
            fieldset.appendChild(body);
        }

        // wrap in container
        const container = document.createElement('div');
        container.classList.add('mb-2');
        container.appendChild(fieldset);

        return [container, filterEnableInput];
    }

    // function creates an option switch that can  be toggled on or off on the DOM
    const createSwitch = (id, labelText, isEnabled) => {
        const label = document.createElement('label');
        label.htmlFor = id;
        label.classList.add('form-check-label');
        label.textContent = (labelText);

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.role = 'switch';
        input.checked = isEnabled;
        input.classList.add('form-check-input', 'site-form-check-input');
        input.setAttribute('switch', 'switch');
        input.addEventListener('change', updateDataFromFilters); // update data when changed

        const inputSwitch = document.createElement('div');
        inputSwitch.classList.add('form-check', 'form-check-reverse', 'form-switch', 'w-fit', 'm-0');
        inputSwitch.appendChild(label);
        inputSwitch.appendChild(input);

        return [inputSwitch, input];
    }

    // function creates an option checkbox to put in a multiselect filter on the DOM
    const createMultiselectOption = (idPrefix, option, isChecked) => {
        const id = `${idPrefix}Checkbox-${option}`; // make ID unique

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.classList.add('btn-check');
        input.autocomplete = false;
        input.value = option;
        input.checked = isChecked; // set default value based on option
        input.addEventListener('change', updateDataFromFilters); // update on change selection

        const label = document.createElement('label');
        label.htmlFor = id;
        label.classList.add('btn', 'btn-sm', 'btn-outline-site-primary');
        label.textContent = option.toTitleCase();

        const checkbox = document.createElement('div');
        checkbox.append(input);
        checkbox.append(label);

        return [checkbox, input];
    }

    // function creates controls for a multiselect filter on the DOM
    const createMultiselectFilter = (idPrefix, labelText, options, isEnabled, tooltipText) => {
        // get the options to put into the multiselect fitler
        const [optionNodes, inputs] = options.reduce((acc, option) => {
            const [node, input] = createMultiselectOption(idPrefix, option, false); // all deselected on default
            acc[0].push(node);
            acc[1].push(input);
            return acc;
        }, [[], []]);

        // create container for options, compacted into rows
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('d-flex', 'flex-row', 'flex-wrap', 'gap-1', 'mb-4');
        optionsContainer.append(...optionNodes);

        // button to select and deselect all
        const deselectAllButton = document.createElement('button');
        deselectAllButton.classList.add('btn', 'btn-sm', 'btn-site-primary');
        deselectAllButton.textContent = 'Deselect All';
        deselectAllButton.addEventListener('click', function() {
            inputs.forEach(input => input.checked = false);
            updateDataFromFilters();
        });

        const selectAllButton = document.createElement('button');
        selectAllButton.classList.add('btn', 'btn-sm', 'btn-site-primary');
        selectAllButton.textContent = 'Select All';
        selectAllButton.addEventListener('click', function() {
            inputs.forEach(input => input.checked = true);
            updateDataFromFilters();
        });

        const [container, filterEnableInput] = createFilterContainer(
            idPrefix, labelText, isEnabled, optionsContainer, [deselectAllButton, selectAllButton], tooltipText);

        return [container, filterEnableInput, inputs];

    }

    // function create a dropdown filter on the DOM, exposing functionality on the use-bootstrap-select library for customization
    const createUseBootstrapSelectDropdown = (
        idPrefix, labelText, options, placeholder,
        isMultiple, isSearchable, isCreatable, isEnabled, useLazyLoading,
        getOptionDisplay, tooltipText, collapseButtons,
    ) => {
        // function adds an observer that loads more options once the end of the dropdown is reached, ensuring that options match search
        const loadMoreOptionsWhenReachEnd = (bootstrapSelectDropdown, select, searchInput, loadingDisplay, options) => {
            // store the index of the last option displayed
            let optionIndex = 0;
            
            // store the current search text
            let searchText = searchInput.value;

            // create an observer to detect when the end of the dropdown has been reached
            let loadingObserver;
            
            // function loads another step of options into the dropdown, called when the end of the dropdown is reached
            const loadMoreOptions = () => {
                // when reach bottom, load another step of options in dropdown
                for (let loadCount = 0; optionIndex < options.length && loadCount < DROPDOWN_OPTIONS_LOAD_STEP;) {
                    // if option matches search, add to dropdown
                    const option = options[optionIndex];
                    const optionDisplay = getOptionDisplay(option);
                    if (optionDisplay.toLowerCase().includes(searchText.trim().toLowerCase())) {
                        const optionNode = document.createElement('option');
                        optionNode.value = option;
                        optionNode.textContent = optionDisplay;
                        select.appendChild(optionNode);
                        options.splice(optionIndex, 1); // remove option from remaining options list (thus don't increment option index)
                        loadCount++; // if add, increment count loaded so far
                    } else {
                        optionIndex++; // if skip, go to next option
                    }
                }

                // if all artworks loaded, remove observer
                if (optionIndex >= options.length) {
                    loadingObserver.disconnect();
                    loadingDisplay.classList.add('d-none');
                }

                bootstrapSelectDropdown.update(); // update dropdown with changes
            }

            // instantiate the observer
            loadingObserver = new IntersectionObserver((entries) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    loadMoreOptions();
                }
            }, { threshold: 0.0 });
            loadingObserver.observe(loadingDisplay);
            
            // reset the check for remaining options back to the start if the search changes and the new search is less restrictive
            function updateSearchText() {
                const newSearchText = this.value;
                if (!newSearchText.includes(searchText)) {
                    optionIndex = 0;
                    // if loading display was hidden, means that observer stopped so restart observation
                    if (loadingDisplay.classList.contains('d-none')) {
                        loadingObserver.observe(loadingDisplay);
                        loadingDisplay.classList.remove('d-none');
                    }
                }
                searchText = newSearchText;
            }
            searchInput.addEventListener('click', updateSearchText); // when first clicking on input
            searchInput.addEventListener('input', updateSearchText); // when changing the text
        }
        
        // create dropdown element using use-bootstrap-select library
        const select = document.createElement('select');
        select.classList.add('form-select', 'mb-4');
        select.setAttribute('data-max-height', DROPDOWN_MAX_HEIGHT);
        select.setAttribute('data-clearable', true); // always clearable
        // set attributes based on settings passed in as parameters
        if (isMultiple) { select.setAttribute('multiple', true); }
        if (isSearchable) { select.setAttribute('data-searchable', true); }
        if (isCreatable) {
            select.setAttribute('data-creatable', true);
            select.setAttribute('data-creatable-text', 'Click to add <b>{value}</b>');
            select.setAttribute('data-no-results-text', 'Type a keyword to add it to the selection');
        }

        // add options to dropdown
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        select.appendChild(placeholderOption);

        // create container for filter so option enableable
        const [container, filterEnableInput] = createFilterContainer(idPrefix, labelText, isEnabled, select, collapseButtons, tooltipText);

        // instantiate dropdown after it has been added to DOM
        const bootstrapSelectDropdown = new UseBootstrapSelect(select);
        const abstractedDropdown = select.nextElementSibling; // get the abstracted dropdown
        const searchInput = abstractedDropdown.querySelector('input'); // search bar input in abstracted dropdown
        const dropdownMenu = abstractedDropdown.querySelector('.dropdown-menu'); // list of options in abstracted dropdown

        // load first step of options to dropdown
        const dropdownOptionsLoadStep = useLazyLoading ? DROPDOWN_OPTIONS_LOAD_STEP : options.length; // if not using lazy loading, load all
        for (let loadCount = 0; options.length > 0 && loadCount < dropdownOptionsLoadStep; loadCount++) {
            const option = options.shift();
            const optionNode = document.createElement('option');
            optionNode.value = option;
            optionNode.textContent = getOptionDisplay(option);
            select.appendChild(optionNode);
        }

        // if still more options, add observer to listen to when reach end of dropdown
        if (options.length > 0) {
            const loadingDisplay = document.createElement('div');
            loadingDisplay.classList.add('text-center');
            loadingDisplay.textContent = 'Loading more...';
            dropdownMenu.appendChild(loadingDisplay); // add the loading display to the actual list (not the select dropdown which is hidden)
            
            loadMoreOptionsWhenReachEnd(bootstrapSelectDropdown, select, searchInput, loadingDisplay, options);
        }

        bootstrapSelectDropdown.update(); // udpate new changes

        // update data when selection changed
        select.addEventListener('change', updateDataFromFilters);

        return [container, filterEnableInput, select, bootstrapSelectDropdown];
    }

    // function creates a range filter control with 2 range sliders, one to configure min and one to configure max
    const createDualEndRangeFilter = (idPrefix, labelText, minValue, maxValue, step, isEnabled, getValueDisplay, tooltipText) => {
        // create unique IDs to give to elements
        const minSliderId = `${idPrefix}MinRangeSlider`;
        const maxSliderId = `${idPrefix}MaxRangeSlider`;
        
        // input elements for min slider
        const minSliderLabel = document.createElement('label');
        minSliderLabel.htmlFor = minSliderId;
        minSliderLabel.classList.add('form-label', 'm-0');
        minSliderLabel.textContent = 'From:';

        const minSliderInput = document.createElement('input');
        minSliderInput.type = 'range';
        minSliderInput.id = minSliderId;
        minSliderInput.min = minValue;
        minSliderInput.max = maxValue;
        minSliderInput.value = minValue;
        minSliderInput.step = step;
        minSliderInput.classList.add('form-range');

        // input elements for max slider
        const maxSliderLabel = document.createElement('label');
        maxSliderLabel.htmlFor = maxSliderId;
        maxSliderLabel.classList.add('form-label', 'm-0');
        maxSliderLabel.textContent = 'To:';

        const maxSliderInput = document.createElement('input');
        maxSliderInput.type = 'range';
        maxSliderInput.id = maxSliderId;
        maxSliderInput.min = minValue;
        maxSliderInput.max = maxValue;
        maxSliderInput.value = maxValue;
        maxSliderInput.step = step;
        maxSliderInput.classList.add('form-range');

        // container for slider labels and inputs, stack on top of each other
        const labelContainer = document.createElement('div');
        labelContainer.classList.add('d-flex', 'flex-column', 'justify-space-between', 'pe-3');
        labelContainer.appendChild(minSliderLabel);
        labelContainer.appendChild(maxSliderLabel);
        
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('d-flex', 'flex-column', 'justify-space-between');
        inputContainer.classList.add('flex-grow-1');
        inputContainer.appendChild(minSliderInput);
        inputContainer.appendChild(maxSliderInput);

        // displays for min and max 
        const minValueDisplay = document.createElement('div');
        minValueDisplay.textContent = minValue;

        const maxValueDisplay = document.createElement('div');
        maxValueDisplay.textContent = maxValue;

        const slidersContainer = document.createElement('div');
        slidersContainer.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-3', 'pt-3', 'mb-4'); // add space on top for value display
        slidersContainer.style.width = '90%'; // so not squished to right side
        slidersContainer.appendChild(labelContainer);
        slidersContainer.appendChild(minValueDisplay);
        slidersContainer.appendChild(inputContainer);
        slidersContainer.appendChild(maxValueDisplay);

        // create display that shows current selection
        const valueDisplayText = document.createElement('span');
        valueDisplayText.classList.add('dual-range-value-display-text', 'fw-bold');

        const valueDisplayBox = document.createElement('div');
        valueDisplayBox.classList.add('dual-range-value-display-box');
        valueDisplayBox.appendChild(valueDisplayText);
        
        const valueDisplayContainer = document.createElement('div');
        valueDisplayContainer.classList.add('dual-range-value-display-container');
        valueDisplayContainer.appendChild(valueDisplayBox);

        // append value display on input container so width matches
        inputContainer.classList.add('position-relative');
        inputContainer.appendChild(valueDisplayContainer);

        // update value and size of value display based on changes to slider values, also disallow min > max
        const updateValueDisplay = () => {
            const currMinValue = parseInt(minSliderInput.value);
            const currMaxValue = parseInt(maxSliderInput.value);
            valueDisplayBox.style.left  = `${inverseLerp(minValue, maxValue, currMinValue) * 100}%`;
            valueDisplayBox.style.right = `${inverseLerp(maxValue, minValue, currMaxValue) * 100}%`;
            valueDisplayText.textContent = getValueDisplay(currMinValue, currMaxValue);
        }
        minSliderInput.addEventListener('input', function() {
            if (parseInt(this.value) >= parseInt(maxSliderInput.value)) {
                this.value = parseInt(maxSliderInput.value) - step; // if exceed max, reset to previous step
            }
            updateValueDisplay();
        });
        maxSliderInput.addEventListener('input', function() {
            if (parseInt(minSliderInput.value) >= parseInt(this.value)) {
                this.value = parseInt(minSliderInput.value) + step; // if below min, reset to previous step
            }
            updateValueDisplay();
        });
        updateValueDisplay(); // run initial update

        // update data on change input, throttled so don't waste resources
        minSliderInput.addEventListener('input', throttleAction(updateDataFromFilters, DUAL_RANGE_THROTTLE_MS));
        maxSliderInput.addEventListener('input', throttleAction(updateDataFromFilters, DUAL_RANGE_THROTTLE_MS));

        // create container for filter controls
        const [container, filterEnableInput] = createFilterContainer(idPrefix, labelText, isEnabled, slidersContainer, null, tooltipText);
        
        return [container, filterEnableInput, minSliderInput, maxSliderInput];
    }

    // function creates controls for artwork forms filter on the DOM
    const createArtworkFormsFilter = () => {
        // find unique artwork forms
        const artworkForms = [...new Set(data.artworksCSV.map(artwork => artwork.form))];
        artworkForms.sort((a, b) => { // always move painting to top and others to bottom
            if (a === 'painting' || b === 'others'  ) return -1;
            if (a === 'others'   || a === 'painting') return  1;
            return 0;
        });

        return createMultiselectFilter('artworkForms', 'Artwork Forms: ', artworkForms,
            false, // disabled on startup
            'Filters to artworks created using the selected mediums or techniques, such as paintings, landscapes, and sculptures.'
        );
    }

    // function creates controls for artwork themes filter on the DOM
    const createArtworkThemesFilter = () => {
        // find unique artwork themes
        const artworkThemes = [...new Set(data.artworksCSV.map(artwork => artwork.type))];
        artworkThemes.sort((a, b) => { // always move other to bottom
            if (b === 'other') return -1;
            if (a === 'other') return  1;
            return 0;
        });

        return createMultiselectFilter('artworkThemes', 'Artwork Themes: ', artworkThemes,
            false, // disabled on startup
            'Filters to artworks with the selected themes or moods, such as mythological, historical, and landscapes.'
        );
    }

    // function creates controls for artwork artists filter on the DOM
    const createArtworkArtistsFilter = () => {
        const artworkArtists = [...new Set(data.artworksCSV.map(artwork => artwork.author))];
        return createUseBootstrapSelectDropdown(
            'artworkArtists', 'Artwork Artists: ',
            artworkArtists,
            'Search or select artists from the dropdown',
            true, true, false, false, true, // multiselect, searchable, cannot create new artists, not enabled on default, use lazy loading
            convertNameToConventional,
            'Filters to artworks created by the selected artist(s). You can search for them or scroll through the list.'
        );
    }

    // function creates controls for artwork artists filter on the DOM
    const createCountriesFilter = () => {
        // get all countries from data
        const countries = [...new Set(data.artworkRegionCountryCenterPointsGeoJSONFeatures.map(({ properties }) => properties.country))];
        // create option to require both sides of travel
        const [requireBothSidesOfTravelSwitch, requireBothSidesOfTravelInput] =
            createSwitch('countriesRequireBothSidesOfTravelSwitch', 'Require both sides of travel? ', false); // disabled by default
        // create the dropdown
        const [container, filterEnableSwitch, select, bootstrapSelectDropdown] = createUseBootstrapSelectDropdown(
            'countries', 'Countries: ',
            countries,
            'Search or select countries from the dropdown',
            true, true, false, false, false, // multiselect, searchable, cannot create new countries, not enabled on default, no need for lazy loading (since only ~100)
            option => option, // leave option name unchanged
            'Filters to artworks that only travel within the selected countries. ' +
            'You can search for them, scroll through the list, or alternatively enable the feature in the Map Controls to lasso regions of the map. ' +
            'You can also choose to require that both ends of a travel are in the selection, or just one.',
            [requireBothSidesOfTravelSwitch],
        );
        return [container, filterEnableSwitch, select, requireBothSidesOfTravelInput, bootstrapSelectDropdown];
    }

    // function creates controls for artwork title keywords filter on the DOM
    const createArtworkTitleKeywordsFilter = () => {
        return createUseBootstrapSelectDropdown(
            'artworkTitleKeywords', 'Artwork Title Keywords: ',
            [], // no options, options are created by user
            'Enter a keyword or phrase, and click Enter',
            true, true, true, false, false, // multiselect, searchable, creatable, not enabled on default, no need for lazy loading (since empty)
            option => option, // no change
            'Filters to artworks whose title contains the specified keyword(s). ' +
            'You can include multiple to find titles with either keyword, or type AND to include only titles with both keywords (ex. "flower AND water").'
        );
    }

    // function creates controls for artwork timeframe filter on the DOM
    const createArtworkTimeframeFilter = () => {
        // find unique artwork timeframes, and get min and max from them
        const timeframes = [...new Set(data.artworksCSV.map(artwork => artwork.timeframe))];
        const years = timeframes.flatMap(timeframe => timeframe.split('-')).map(year => parseInt(year));
        const [minYear, maxYear] = years.reduce(([minYear, maxYear], year) => {
            if (minYear == null || year < minYear) { minYear = year; }
            if (maxYear == null || year > maxYear) { maxYear = year; }
            return [minYear, maxYear];
        }, [null, null]);

        // create element to DOM
        return createDualEndRangeFilter(
            'artworkTimeframe',
            'Artwork Timeframe: ',
            minYear-1, // since timeframes start at XX1 ex. 1801-1850, subtract one to make clean multiple of 50
            maxYear,
            50, // years are defined in steps of 50 years ex. 1801-1850
            false, // disabled on default
            (minValue, maxValue) => `${minValue}\u2013${maxValue} CE`, // append common era to end to make clear that is years
            'Filters to artworks created during the selected time period, from the start year to the end year. They are in steps of 50 years.'
        );
    }

    // function creates controls for filtering out within-country travels on the DOM
    const createArtworkIgnoreWithinCountryTravelsFilter = () => {
        return createFilterContainer('ignoreWithinCountryTravels', 'Ignore Within-Country Travels: ',
            false, // disabled on default
            null, null, // no colllapsable elements, just the enable or disable control
            'Whether to ignore artworks that originated and are displayed in the same country. ' +
            'If enabled, the visualizations will focus more on seeing the interactions between distinct countries.'
        );
    }

    // create filters and append to DOM
    let artworkFormsFilter;
    ([artworkFormsFilter, artworkFormsFilterEnableSwitch, artworkFormsFilterInputs] = createArtworkFormsFilter());
    filtersContainer.appendChild(artworkFormsFilter);

    let artworkThemesFilter;
    ([artworkThemesFilter, artworkThemesFilterEnableSwitch, artworkThemesFilterInputs] = createArtworkThemesFilter());
    filtersContainer.appendChild(artworkThemesFilter);

    let artworkArtistsFilter;
    ([artworkArtistsFilter, artworkArtistsFilterEnableSwitch, artworkArtistsFilterDropdown] = createArtworkArtistsFilter());
    filtersContainer.appendChild(artworkArtistsFilter);

    let countriesFilter, countriesBootstrapSelectDropdown;
    ([
        countriesFilter,
        countriesFilterEnableSwitch,
        countriesFilterDropdown,
        countriesFilterRequireBothSidesOfTravelSwitch, 
        countriesBootstrapSelectDropdown
    ] = createCountriesFilter());
    filtersContainer.appendChild(countriesFilter);

    let artworkTitleKeywordsFilter;
    ([artworkTitleKeywordsFilter, artworkTitleKeywordsFilterEnableSwitch, artworkTitleKeywordsFilterDropdown] = createArtworkTitleKeywordsFilter());
    filtersContainer.appendChild(artworkTitleKeywordsFilter);

    let artworkTimeframeFilter;
    ([
        artworkTimeframeFilter,
        artworkTimeframeFilterEnableSwitch,
        artworkTimeframeFilterMinRangeInput,
        artworkTimeframeFilterMaxRangeInput
    ] = createArtworkTimeframeFilter());
    filtersContainer.appendChild(artworkTimeframeFilter);

    let artworkIgnoreWithinCountryTravelsFilter;
    ([artworkIgnoreWithinCountryTravelsFilter, artworkIgnoreWithinCountryTravelsFilterEnableSwitch] = createArtworkIgnoreWithinCountryTravelsFilter());
    filtersContainer.appendChild(artworkIgnoreWithinCountryTravelsFilter);

    // update data and map based on default filter settings
    updateDataFromFilters();

    //#endregion

    ///////////////////
    //#region UPDATE //
    ///////////////////

    updateCountryFilters = (newCountryFilters, appendType) => {
        // determine logic based on append type
        const [updateOnSelected, updateOnNotSelected] =
            // if replacing, update all options
            appendType === APPEND_TYPE_ENUM_REPLACE
                ? [option => { option.selected = true; }, option => { option.selected = false; }]
            // if additive, select option if included in new filters but do not remove if not
          : appendType === APPEND_TYPE_ENUM_ADDITIVE
                ? [option => { option.selected = true; }, null]
            // if subtractive, deselect option if included in new filters and do not change if not
          : appendType === APPEND_TYPE_ENUM_SUBTRACTIVE
                ? [option => { option.selected = false; }, null]
          : [null, null]; // fallback to do nothing if append type none of above
        // update selected options based on new filters
        for (const option of countriesFilterDropdown.options) {
            if (newCountryFilters.includes(option.value)) {
                updateOnSelected?.(option);
            } else {
                updateOnNotSelected?.(option);
            }
        }
        // update dropdown to reflect changes
        countriesBootstrapSelectDropdown.update();
        // if filter currently disabled, enable it
        if (!countriesFilterEnableSwitch.checked) {
            countriesFilterEnableSwitch.click();
        }
        // update the data to reflect the new filters
        updateDataFromFilters();
    }

    //#endregion
}