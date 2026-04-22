const GEONAMES_USERNAME = '4166_artwork_project';

// get one row for search for region query, with fuzzy turned on so typos forgiven
export const geonamesSearchApi = (q) =>
    fetch(`http://api.geonames.org/searchJSON?q=${encodeURIComponent(q)}&maxRows=1&username=${GEONAMES_USERNAME}`);


// function parses the born-died field in the catalog.csv file to get the region the artist was born or was active
export function getBornOrActiveRegions(bornDied) {
    let bornOrActiveRegion; // store region name found after parsing

    // format is (b. date, region ,/; d. date, region), want just region portion
    // also sometimes contains US state in form Xx., so remove
    // also sometimes contains square brackets after region, so remove
    const bornDiedMatchResult = bornDied.match(/^\(b\. .*\d+.*, ([^,]+)(?:, [A-Z][a-z]\.)?(?:\[.+\])?(?:,|;) d\. .*\d+.*, ([^,]+)(?:, [A-Z][a-z]\.)?(?:\[.+\])?\)$/);
    if (bornDiedMatchResult != null) { // if cannot find born region, skip
        let [_, bornRegion, diedRegion] = bornDiedMatchResult; // first is full match so don't care
        bornOrActiveRegion = bornRegion;
    
        // if could not find born region, see if can find active region
    } else {
        // format is (active date in/at region), want just region portion
        // also sometimes contains US state in form Xx., so remove
        // region definitely does not contain numbers, so removes edge case where date placed after region
        const activeMatchResult = bornDied.match(/^\(active[^)]*(?:in|at) ([^,)]+)(?:, [A-Z][a-z]\.)?/);
        if (activeMatchResult != null) { // if cannot find active region, skip
            let [_, activeRegion] = activeMatchResult; // first is full match so don't care
            bornOrActiveRegion = activeRegion;
        }
    }
    
    if (bornOrActiveRegion != null) {
        // convert to lowercase and trim any whitespace
        bornOrActiveRegion = bornOrActiveRegion.toLowerCase().trim();

        // if begins with 'near ' or 'nr ' or 'at ' or contains ' near ' remove it and only keep part after
        let keywordMatchResult;
        if ((keywordMatchResult = bornOrActiveRegion.match(/(^|\s)near (.+)$/)) != null) bornOrActiveRegion = keywordMatchResult[1]; // first full match, so only care second
        if ((keywordMatchResult = bornOrActiveRegion.match(/^nr (.+)$/))        != null) bornOrActiveRegion = keywordMatchResult[1]; //
        if ((keywordMatchResult = bornOrActiveRegion.match(/^at (.+)$/))        != null) bornOrActiveRegion = keywordMatchResult[1]; //
        // one instance where region placed before date using keyword 'from', so also check for that
        if ((keywordMatchResult = bornOrActiveRegion.match(/^(.+) from /))      != null) bornOrActiveRegion = keywordMatchResult[1]; //

        // if multiple regions separated by ' and ' or ' or ', separate and search separately
        const regions = bornOrActiveRegion.split(/ and|or /g);

        return regions;
    }
}

// function parses the location field of the catalog.csv file to get the region the artwork is being displayed, without any specific buildings or addresses
export function getLocationRegions(location) {
    // last section after comma, can remove ending comma or brackets
    // also check if ends with XX or Xx. , as that is US state and can be ignored
    const locationMatchResult = location.match(/([^,;()]+),?(?:, [A-Z][A-Z]\s?)?(?:, [A-Z][a-z]\.\s?)?(?:\(.+\))?$/);
    if (locationMatchResult != null) {
        let [_, locationRegion] = locationMatchResult; // first is full match so don't care

        // convert to lowercase and trim any whitespace
        locationRegion = locationRegion.toLowerCase().trim();

        // if begins with 'near ' or contains ' near ' or ' in ' remove it and only keep part after
        let keywordMatchResult;
        if ((keywordMatchResult = locationRegion.match(/(?:^|\s)near (.+)$/)) != null) locationRegion = keywordMatchResult[1]; // first full match, so only care second
        if ((keywordMatchResult = locationRegion.match(/ in (.+)$/))   != null) locationRegion = keywordMatchResult[1]; //

        // if multiple regions separated by ' and ' or ' or ', separate and search separately
        const regions = locationRegion.split(/ and|or /g);

        return regions;
    }
}

/*
 * function takes the URL for the Web Gallary of Art page for an artwork and returns the URL to the artwork
 * for performance reasons this only shows the preview version which is a much lower resolution
 */ 
export function getImageURL(siteURL) {
    return siteURL
        .replace('/html/', '/preview/') // difference of page, site at wga.hu/html/ while image preview at wga.hu/preview/
        .replace('.html', '.jpg');  // difference of extension, site is HTML file while image JPG file
}

// function takes in a number and an other number and determines what propertion a makes of the total
export function proportion(other, a) {
    if (a === 0 && other === 0) {return 0.5; } // if both zero, return between to avoid division by 0, proportion meaningless anyway
    return a / (a+other);
}

// function returns a function that only calls the inputted action if it not called within the throttle time
export function throttleAction(action, ms) {
    let throttleID = 0;
    return (...params) => {
        if (throttleID) { clearTimeout(throttleID); }
        throttleID = setTimeout(() => {
            action(...params); // propagate params
        }, ms);
    }
} 

// function runs a list of transitions in chronological order, waiting until one finishes before starting the next
// it also supports waiting until a previously called instance of this function finishes, and cancelling a previously called instanse
export async function runAnimations(state, id, setup, transitions) {

    // if animation currently running, add this animation to the pending animations mask
    if (state.isRunning) {
        state.pendingAnimationsMask |= (1<<id);
        return;
    }

    state.isRunning = true; // begin running this animation
    const setupData = setup?.(); // set up the animation
    for (let i = 0; i < transitions.length; i++) {
        // run the transitions chronologically, awaiting until finished
        await transitions[i](setupData);

        // if animation of higher priority now pending, cancel this one, run that one, and queue this one to resume after finish
        if ((state.pendingAnimationsMask & ((1<<id) - 1)) !== 0) {
            let nextId = 0;
            // search through all animations of lower priority, first nonzero bit found is ID of next animation
            for (; nextId < id; nextId++) {
                if (((state.pendingAnimationsMask >> nextId) & 1) === 1) {
                    break;
                }
            }

            // if this animation did not finish, add this animation to pending state
            if (i < transitions.length - 1) {
                state.pendingAnimationsMask |= 1<<id;
            }

            // run the next animation
            state.isRunning = false; // stop this animation
            state.pendingAnimationsMask &= ~(1<<nextId); // remove from pending animations mask
            state.animations[nextId](); // run animation
            return;
        }

        // if the same animation is pending a rerender, cancel this one and rerun it
        if (((state.pendingAnimationsMask >> id) & 1) === 1) {
            state.isRunning = false; // stop this animation
            state.pendingAnimationsMask &= ~(1<<id); // remove from pending animations mask
            state.animations[id](); // rerun the animation
            return;
        }
    }

    // if completed without being cancelled, finish running this animation
    state.isRunning = false;
    
    // if another animation is pending, run it
    if (state.pendingAnimationsMask !== 0) {
        let nextId = 0;
        // search through all animations of lower priority, first nonzero bit found is ID of next animation
        for (; nextId < 32; nextId++) {
            if (((state.pendingAnimationsMask >> nextId) & 1) === 1) {
                break;
            }
        }
        state.pendingAnimationsMask &= ~(1<<nextId); // remove from pending animations mask
        state.animations[nextId](); // run the animation
    }
}

// function creates a range slider control to add to the DOM to control visualizations
export function createRangeControl(id, title, scale, defaultValue, info) {
    // the label for the range slider
    const rangeLabel = document.createElement('label');
    rangeLabel.htmlFor = id;
    rangeLabel.classList.add('form-label', 'm-0');
    rangeLabel.textContent = title;

    const valueDisplay = document.createElement('span');
    valueDisplay.classList.add('ms-2');
    valueDisplay.textContent = defaultValue;

    // weight factor range slider allows users to change weights
    const range = document.createElement('input');
    range.type = 'range';
    range.id = id;
    range.value = scale.invert(defaultValue); // set value to reflect default option
    range.min = scale.domain()[0];
    range.max = scale.domain()[1];
    range.classList.add('form-range', 'col');

    const rangeLowerBound = document.createElement('span');
    rangeLowerBound.classList.add('col-auto');
    rangeLowerBound.textContent = scale.range()[0];

    const rangeUpperBound = document.createElement('span');
    rangeUpperBound.classList.add('col-auto');
    rangeUpperBound.textContent = scale.range()[1];

    // show range input along with text for minimum and maximum value in one row
    const rangeRow = document.createElement('div');
    rangeRow.classList.add('row');
    rangeRow.appendChild(rangeLowerBound);
    rangeRow.appendChild(range);
    rangeRow.appendChild(rangeUpperBound);

    // group the user input range slider with its label
    const rangeContainer = document.createElement('div');
    rangeContainer.classList.add('mb-3', 'col');
    rangeContainer.appendChild(rangeLabel);
    rangeContainer.appendChild(valueDisplay);
    rangeContainer.appendChild(rangeRow);

    // a tooltip to get information when hovering about what this control does
    const tooltip = document.createElement('button');
    tooltip.type = 'button';
    tooltip.classList.add('btn', 'p-0', 'fw-bold', 'info-tooltip');
    tooltip.setAttribute('data-bs-toggle', 'tooltip');
    tooltip.setAttribute('data-bs-title', info);
    new bootstrap.Tooltip(tooltip); // instantiate tooltip

    const tooltipIcon = document.createElement('i');
    tooltipIcon.classList.add('bi', 'bi-info-circle-fill', 'text-secondary');
    tooltip.appendChild(tooltipIcon);

    // add a tooltip to the range container
    const container = document.createElement('div');
    container.classList.add('d-flex', 'flex-row', 'gap-3');
    container.appendChild(rangeContainer);
    container.appendChild(tooltip);

    // update value display when changing slider
    range.addEventListener('input', function() {
        const inputValue = parseInt(this.value);
        const scaledValue = scale(inputValue);
        const roundedValue = parseFloat(scaledValue.toFixed(3)); // get rid of trailing 0s by parsing
        valueDisplay.textContent = roundedValue;
    });

    return [container, range];
}

// function creates a section for advanced controls to add to the DOM, being collapsed on default
export function createAdvancedControls(id) {
    // hide the controls on default by placing them in a collapsable section
    const controlsCollapse = document.createElement('div');
    controlsCollapse.classList.add('collapse');
    controlsCollapse.style.paddingInline = '10%';
    controlsCollapse.id = id;

    // add button to expand/collapse controls
    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.classList.add('advanced-controls-button', 'collapsed');
    collapseButton.setAttribute('data-bs-toggle', 'collapse');
    collapseButton.setAttribute('data-bs-target', `#${id}`);
    collapseButton.setAttribute('aria-expanded', 'false'),
    collapseButton.setAttribute('aria-controls', id);
    collapseButton.textContent = 'Advanced Controls';

    return { controlsCollapse, collapseButton };
}

// basic linear interpolation function
export const lerp = (a, b, t) => (1-t) * a + t * b;

// basic linear interpolation for 2D array
export const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// basic inverse linear interpolation function
export const inverseLerp = (a, b, v) => (v - a) / (b - a);

// function calculates the square distance between two points
export const distanceSquared = ([x1, y1], [x2, y2]) => (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);

// function finds the center point of a GeoJSON BBox definition
export const getBBoxCenter = (bbox) => [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];

// function converts an angle from radians to degrees and vice-versa
export const radiansToDegrees = (radians) => radians * 180 / Math.PI;
export const degreesToRadians = (degrees) => degrees / 180 * Math.PI;

// function converts the artist names in the artistsCSV data from a LASTNAME, firstname to a firstname LASTNAME format
export const convertNameToConventional = (name) => `${name.split(', ').slice(1).join(' ')} ${name.split(', ')[0]}`;

// basic title case converter, changing the first letter of the word to a capital letter
String.prototype.toTitleCase = function() {
    return this
        .split('-') // treat hyphen separators as spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
        .join(' '); // join back as spaces
}