import { ARTWORK_COUNT_ENUM_BOTH, ARTWORK_COUNT_ENUM_DEST, ARTWORK_COUNT_ENUM_ORIGIN, FOCUS_ENUM_COUNTRY, FOCUS_ENUM_TRAVEL } from './enums.js';
import { TRAVEL_DEST_COLOR, TRAVEL_ORIGIN_COLOR } from './map.js';
import { radiansToDegrees, lerp, proportion, throttleAction, runAnimations, createRangeControl, createAdvancedControls } from './utils.js';

//////////////////////
//#region CONSTANTS //
//////////////////////

// set visualization to have constant width and height so screen size doesn't affect
const W = 1000;
const H = 800;

// data logic
const COUNTRY_COLORS = [ // the colors that are assigned to countries, from https://observablehq.com/blog/crafting-data-colors
    '#4269D0',
    '#6CC5B0',
    '#A463F2',
    '#EFB118',
    '#3CA951',
    '#97BBF5',
    '#9498A0',
    '#FF725C',
    '#FF8AB7',
    '#9C6B4E',
];

// layout constants
const DIAGRAM_RADIUS = W/2 - 200;
const DIAGRAM_ORIGIN_Y = 50; // offset slightly from center to give space for focus display
// graph
const DIAGRAM_OUTLINE_WIDTH = 5;
const DIAGRAM_OUTLINE_PADDING = 10;
const DIAGRAM_CHORD_PAD_ANGLE = 0.05;
// arcs
const DIAGRAM_CHORD_ORIGIN_DEST_ARC_WIDTH = 20;
const DIAGRAM_CHORD_ORIGIN_DEST_ARC_PADDING = 10;
const DIAGRAM_CHORD_ORIGIN_DEST_ARC_OUTER_RADIUS = DIAGRAM_RADIUS - DIAGRAM_OUTLINE_WIDTH - DIAGRAM_OUTLINE_PADDING;
const DIAGRAM_CHORD_ORIGIN_DEST_ARC_INNER_RADIUS = DIAGRAM_CHORD_ORIGIN_DEST_ARC_OUTER_RADIUS - DIAGRAM_CHORD_ORIGIN_DEST_ARC_WIDTH;
const DIAGRAM_CHORD_ARC_WIDTH = 20;
const DIAGRAM_CHORD_ARC_PADDING = 10;
const DIAGRAM_CHORD_ARC_OUTER_RADIUS =DIAGRAM_CHORD_ORIGIN_DEST_ARC_INNER_RADIUS - DIAGRAM_CHORD_ORIGIN_DEST_ARC_PADDING;
const DIAGRAM_CHORD_ARC_INNER_RADIUS = DIAGRAM_CHORD_ARC_OUTER_RADIUS - DIAGRAM_CHORD_ARC_WIDTH;
// ribbons
const DIAGRAM_CHORD_RIBBON_ARROW_PADDING = 5;
const DIAGRAM_CHORD_RIBBON_SOURCE_RADIUS = DIAGRAM_CHORD_ARC_INNER_RADIUS - DIAGRAM_CHORD_ARC_PADDING;
const DIAGRAM_CHORD_RIBBON_TARGET_RADIUS = DIAGRAM_CHORD_RIBBON_SOURCE_RADIUS - DIAGRAM_CHORD_RIBBON_ARROW_PADDING;
const DIAGRAM_CHORD_RIBBON_PAD_ANGLE = 0.002;
const DIAGRAM_CHORD_RIBBON_OPACITY = 0.8;
// label
const DIAGRAM_CHORD_LABEL_FONT_SIZE = 15;
// focus travel display
const FOCUS_DISPLAY_FONT_SIZE = 25;
const FOCUS_DISPLAY_TEXT_PADDING = 5;
const FOCUS_DISPLAY_COLOR = '#3073D0';
const FOCUS_OTHER_OPACITY = 0.2;

// animation constants
const UPDATE_COUNTRIES_CHORD_DIAGRAM_ANIMATION_ID = 1;
const UPDATE_FOCUS_ANIMATION_ID = 2;
// how long to throttle the hover detection until beginning the animation, so animations don't start prematurely
const FOCUS_THROTTLE_MS = 100;
// how long to wait before starting focus travel blur animation, so don't need to wait until finish blur before refocusing
const FOCUS_BLUR_DELAY_MS = 300;

// control constants
const COUNTRY_COUNT_SCALE = d3.scaleLinear() // scale HTML range to up to number of distinct colors 
    .domain([1, COUNTRY_COLORS.length]) // discrete
    .rangeRound([1, COUNTRY_COLORS.length])
    .nice();
const WEIGHT_FACTOR_SCALE = d3.scaleLinear() // scale HTML range to 0.01 to 1 exponent scale
    .domain([0, 100])
    .range([0.01, 1]); // not 0 since 0^0 is undefined
const RANGE_SLIDER_THROTTLE_MS = 100;

//#endregion

/////////////////////////////////
//#region TRANSITION CONSTANTS //
/////////////////////////////////

// transition to remove chord ribbons that are no longer relevant
const getFadeOutOldChordsTransition = () => d3.transition()
    .duration(500);
// transition to move remaining chords to their new positions
const getAdjustRemainingChordsTransition = () => d3.transition()
    .duration(1000)
    .ease(d3.easeBackInOut.overshoot(2)); // subtle overshoot bounce
// transition to add chord ribbons that are newly added to the graph
const getFadeInNewChordsTransition = () => d3.transition()
    .duration(500);

// transition to update focused travel
const getFocusTransition = () => d3.transition()
    .duration(300);

//#endregion

/////////////////////////
//#region DOM ELEMENTS //
/////////////////////////

const countriesChordDiagramSVGContainer = document.getElementById('countriesChordDiagramSVGContainer');
const countriesChordDiagramSVG = document.getElementById('countriesChordDiagramSVG');

//#endregion

/////////////////////////////
//#region HELPER FUNCTIONS //
/////////////////////////////

// function takes data and returns a subset of n countries that has the strongest relationships between countries
// utilizes the algorithm to find the maximum edge-weight clique, in order to select a subset of countries with the most interactions
function getTopRelationshipCountriesFromData(countriesAdjacencyMatrix, countryCount) {
    /*
     * use dynamic programming to record the computations (usable since vertices in clique can be ordered from most to least impact)
     * countries data handles as graph, where vertex is country and edge between vertices holds number of artworks between countries
     */

    /*
     * (total country count) x (country count in clique) dp matrix holds the total edge weight sum
     *    when the jth country is chosen as the ith country added to the clique,
     * choice matrix holds whether which clique size i-1 chosen
     */
    const dpMatrix = [];
    const choiceMatrix = [];
    for (let i = 0; i < countryCount; i++) {
        dpMatrix[i] = [];
        choiceMatrix[i] = [];
        for (let j = 0; j < countriesAdjacencyMatrix.length; j++) {
            dpMatrix[i][j] = null;
            choiceMatrix[i][j] = null;
        }
    }
    // cliques with one vertex is number of artworks going to self
    for (let j = 0; j < dpMatrix[0].length; j++) {
        dpMatrix[0][j] = countriesAdjacencyMatrix[j][j];
    }

    // function finds the sum of all weights from a given vertex to all selected vertexes in a clique, or null if the given vertex is already in the clique
    const findArtworkCount = (i, j, k) => {
        // if the given country is the same as the previously selected vertex, cannot choose same vertex multiple times so return null
        if (j === k) return null;
        // get the number of artworks that go between vertex i and j in either direction
        const artworkCount = countriesAdjacencyMatrix[j][k] + countriesAdjacencyMatrix[k][j];
        // if this is the first selected vertex in clique, no other vertexes to check so return this count
        const prevChoice = choiceMatrix[i-1][k];
        if (prevChoice == null) {
            return artworkCount;
        }
        // recursively call to find count for remaining vertexes in clique
        const prevArtworkCount = findArtworkCount(i-1, j, prevChoice);
        // if the count of artworks for the remaining vertexes in the clique returns null, means this clique is not applicable and so propagate the null
        if (prevArtworkCount == null) {
            return null;
        }
        // aggregate the count for this vertex and all previously selected vertexes
        return artworkCount + prevArtworkCount;
    }

    // iterate over cliques of different sizes, using the maximum clique from the size below to calculate
    // since clique with 1 vertex has edge weight sum 0, start at i=1 to compute for 2-vertex cliques
    let lastImproveRow = 0; // keep track of last time a better match was found
    for (let i = 1; i < dpMatrix.length; i++) {
        for (let j = 0; j < dpMatrix[i].length; j++) {
            let maxCount = 0; // the total edge weight sum for the clique with the highest value so far
            let maxChoice = null; // which clique gives the maximum count
            let maxPrevCount = 0; // the total edge weight sum for the clique one smaller with the highest value

            // determine the largest count when this country is added to all below cliques (skipping any already added)
            for (let k = 0; k < dpMatrix[i-1].length; k++) {
                const prevArtworkCount = dpMatrix[i-1][k]; // total before this vertex is added
                if (prevArtworkCount == null) continue; // skip if the clique does not exist
                if (prevArtworkCount > maxPrevCount) { maxPrevCount = prevArtworkCount; } // if this prev clique max so far, update max value
                const currArtworkCount = findArtworkCount(i, j, k); // total artworks relating this vertex to the other vertices in the clique
                if (currArtworkCount == null) continue; // skip if this clique already contains the vertex
                const ownArtworkCount = countriesAdjacencyMatrix[j][j]; // total artworks going from self to self
                const totalArtworkCount = prevArtworkCount + currArtworkCount + ownArtworkCount; // add the count of adding this vertex to the total
                if (totalArtworkCount > maxCount) { // if this choice is the max so far, update the max values
                    maxCount = totalArtworkCount;
                    maxChoice = k;
                }
            }

            // if a solution was found, record the result of the best selection
            if (maxChoice != null) {
                dpMatrix[i][j] = maxCount;
                choiceMatrix[i][j] = maxChoice;
                // if this solution is better than the previous, set the last improve row to this row
                if (maxCount > maxPrevCount) {
                    lastImproveRow = i;
                }
            }
        }
    }

    // function uses recursion to get the best selection form the dynamic programming and choice matrixes
    const getResultsFromChoice = (i, choice) => {
        // if reach end of choice matrix, finish recursion
        if (i < 0) { return []; }
        // recursively iterate based on choices made at each cell, returning the indexes
        return [choice, ...getResultsFromChoice(i-1, choiceMatrix[i][choice])];
    }

    // after computing, find the subset that gives the highest edge weight sum
    const dpBestIndex = dpMatrix[lastImproveRow] // get the index of the best result, from the highest count in the dp matrix
        .reduce((max, count, i, arr) => (count != null && (max === -1 || count > arr[max])) ? i : max, -1); // find the index of the max count, considering null and onstart cases
    const topCountryIndexes = getResultsFromChoice(lastImproveRow, dpBestIndex); // start at last row
    return topCountryIndexes;
}

// function takes an array of countries and converts it to a matrix that can be used in the d3 chord graph generator
function getTopCountriesMatrix(countriesAdjacencyMatrix, topCountryIndexes) {
    // for each origin and dest combination, return edge weight from graph
    let topCountriesMatrix = topCountryIndexes.map(originCountryIndex =>
        topCountryIndexes.map(destCountryIndex =>
            countriesAdjacencyMatrix[originCountryIndex][destCountryIndex]
        )
    );
    return topCountriesMatrix;
}

//#endregion

// function will update the countries chord diagram with the change to the data object, will do nothing if called before init
let updateCountriesChordDiagram = () => { };

// function will change the focused travel ribbon, changing ribbon style and focus text
export let updateCountriesChordDiagramFocus = () => { };

// adding filters to the data will invoke an update so the changes are displayed, and recompute focus styling
export let updateCountriesChordDiagramFiltering = () => {
    updateCountriesChordDiagram();
    updateCountriesChordDiagramFocus();
}

// function initializes the countries chord diagram
export function initCountriesChordDiagram(data, focus, setFocusData, setFocusDetail) {

    //////////////////////
    //#region VARIABLES //
    //////////////////////

    // keep track of which colors not currently used by any chords
    let availableColors = [...COUNTRY_COLORS];
    
    // the values of the user controls that are exposed for this visualization
    const options = {
        weightFactor: 1,
        countryCount: 10,
    };

    // function gets the weight from an artwork count, based on weight factor option
    const getWeight = count => Math.pow(count, options.weightFactor);

    // keep track of the current state of the animation, to avoid race conditions
    const animationState = {
        isRunning: false,
        pendingAnimationsMask: 0,
        animations: { }, // update function not defined yet
    };

    //#endregion

    /////////////////
    //#region INFO //
    /////////////////

    // the title of the visualization
    const title = document.createElement('h3');
    title.classList.add('h5', 'text-center', 'fw-bold');
    title.textContent = 'Artwork Interations between Top Countries';
    
    // extra description for purpose of visualization
    const descriptions = [
        'See how artworks travel between different countries.',
        'Each travel path is colored coded based on the country the artwork originates from.',
    ].map(descriptionText => {
        const description = document.createElement('p');
        description.classList.add('mb-1');
        description.textContent = descriptionText;
        return description;
    });

    // container holding the above info
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('m-3');
    infoContainer.classList.add('text-center');
    infoContainer.style.fontSize = '0.8em';
    infoContainer.style.lineHeight = '1em';
    infoContainer.appendChild(title);
    infoContainer.append(...descriptions);

    // insert the info above the diagram
    countriesChordDiagramSVGContainer.insertBefore(infoContainer, countriesChordDiagramSVG);

    //#endregion

    /////////////////////
    //#region CONTROLS //
    /////////////////////
    
    // create control inputs
    const [countryCountRangeContainer, countryCountRange] =
        createRangeControl('countryCountRange', 'Country Count: ', COUNTRY_COUNT_SCALE, options.countryCount,
            'Controls the number of countries that are represented in the graph. ' +
            'More countries leads to more information about interactions, but adds clutter.'
        );

    const [weightFactorRangeContainer, weightFactorRange] =
        createRangeControl('weightFactorRange', 'Weight Factor: ', WEIGHT_FACTOR_SCALE, options.weightFactor,
            'Applies a scaling to the number of artworks in the interactions. ' +
            'Large values focus on seeing the number of artworks in the interactions, while small values focus on seeing the number of countries the interactions are with.'
        );

    // place controls in advanced controls section
    const { controlsCollapse, collapseButton } = createAdvancedControls('countriesChordDiagramControlsCollapse');
    controlsCollapse.appendChild(countryCountRangeContainer);
    controlsCollapse.appendChild(weightFactorRangeContainer);

    // add elements to DOM
    countriesChordDiagramSVGContainer.appendChild(collapseButton);
    countriesChordDiagramSVGContainer.appendChild(controlsCollapse);

    // add interaction to controls
    countryCountRange.addEventListener('input', throttleAction((e) => {
        const rangeValue = parseInt(e.target.value);
        options.countryCount = COUNTRY_COUNT_SCALE(rangeValue);
        updateCountriesChordDiagram();
    }, RANGE_SLIDER_THROTTLE_MS));

    weightFactorRange.addEventListener('input', throttleAction((e) => {
        const rangeValue = parseInt(e.target.value);
        options.weightFactor = WEIGHT_FACTOR_SCALE(rangeValue);
        updateCountriesChordDiagram();
    }, RANGE_SLIDER_THROTTLE_MS));

    //#endregion

    //////////////////////
    //#region RENDERING //
    //////////////////////

    // create SVG container
    const svg = d3.select(countriesChordDiagramSVG)
        // since centered around origin, center near (0,0) (a little lower for space for focus display)
        .attr('viewBox', `${-W/2} ${-H/2 - DIAGRAM_ORIGIN_Y} ${W} ${H}`);

    // draw outline
    const diagramOutline = svg.append('circle')
        .attr('r', DIAGRAM_RADIUS - DIAGRAM_OUTLINE_WIDTH/2)
        .attr('fill', '#FFF')
        .attr('stroke', '#000')
        .attr('stroke-width', DIAGRAM_OUTLINE_WIDTH);

    // define container for ribbons
    const countriesChordRibbonsContainer = svg.append('g')
        .style('isolation', 'isolate'); // make work with mix-blend-mode so ! consider bg

    // define container for arcs
    const countriesChordArcsContainer = svg.append('g');

    // define generators for chord diagram
    const countriesChordGenerator = d3.chordDirected()
        .padAngle(DIAGRAM_CHORD_PAD_ANGLE)
        .sortSubgroups((a, b) => {
            // sort so origin always comes before dest, and largest values place at center (end of origin, start of dest)
            if (a < 0 && b > 0) return 1;
            if (a > 0 && b < 0) return -1;
            return a - b;
        });
    const countriesChordRibbonGenerator = d3.ribbonArrow()
        .sourceRadius(DIAGRAM_CHORD_RIBBON_SOURCE_RADIUS)
        .targetRadius(DIAGRAM_CHORD_RIBBON_TARGET_RADIUS)
        .padAngle(DIAGRAM_CHORD_RIBBON_PAD_ANGLE);
    const countriesChordArcOriginDestGenerator = d3.arc()
        .outerRadius(DIAGRAM_CHORD_ORIGIN_DEST_ARC_OUTER_RADIUS)
        .innerRadius(DIAGRAM_CHORD_ORIGIN_DEST_ARC_INNER_RADIUS)
        .padAngle(DIAGRAM_CHORD_RIBBON_PAD_ANGLE); // align arc with padding on ribbons
    const countriesChordArcGenerator = d3.arc()
        .outerRadius(DIAGRAM_CHORD_ARC_OUTER_RADIUS)
        .innerRadius(DIAGRAM_CHORD_ARC_INNER_RADIUS);

    // display details about focused travel if any focused
    const focusDisplay = svg.append('text')
        .attr('fill', FOCUS_DISPLAY_COLOR)
        .attr('y', -H/2 + FOCUS_DISPLAY_FONT_SIZE)
        .attr('font-size', FOCUS_DISPLAY_FONT_SIZE)
        .attr('font-weight', 700)
        .attr('text-anchor', 'middle');

    //#endregion

    ///////////////////
    //#region UPDATE //
    ///////////////////

    // functions get the key from data in order to uniquely identify data that remains the same across animations
    function ribbonDataKeyExtractor(d) { return`${d.source.countryIndex}-${d.target.countryIndex}`; }
    function arcDataKeyExtractor(d) { return d.countryIndex; }

    updateCountriesChordDiagram = () => {
        // function tweens a ribbon to transition while maintaining radius values instead of cutting (curved instead of straight)
        function tweenCountriesChordRibbon(prevD, newD) {
            return (t) => {
                const sourceStartAngle = lerp(prevD.source.startAngle, newD.source.startAngle, t);
                const sourceEndAngle = lerp(prevD.source.endAngle, newD.source.endAngle, t);
                const targetStartAngle = lerp(prevD.target.startAngle, newD.target.startAngle, t);
                const targetEndAngle = lerp(prevD.target.endAngle, newD.target.endAngle, t);
                return countriesChordRibbonGenerator({
                    source: {
                        startAngle: sourceStartAngle,
                        endAngle: Math.max(sourceStartAngle, sourceEndAngle), // in case end angle below start angle
                    },
                    target: {
                        startAngle: targetStartAngle,
                        endAngle: Math.max(targetStartAngle, targetEndAngle), // in case end angle below start angle
                    },
                });
            };
        }

        // function tweens an origin/dest arc path to transition while maintaining radius values instead of cutting (curved instead of straight)
        function tweenCountriesChordOriginDestArc(prevD, newD) {
            return (t) => {
                const startAngle = lerp(prevD.startAngle, newD.startAngle, t);
                const endAngle = lerp(prevD.endAngle, newD.endAngle, t);
                return countriesChordArcOriginDestGenerator({
                    startAngle: startAngle,
                    endAngle: Math.max(startAngle, endAngle), // in case end angle below start angle
                });
            };
        }

        // function tweens an arc path to transition while maintaining radius values instead of cutting (curved instead of straight)
        function tweenCountriesChordArc(prevD, newD) {
            return (t) => {
                const startAngle = lerp(prevD.startAngle, newD.startAngle, t);
                const endAngle = lerp(prevD.endAngle, newD.endAngle, t);
                return countriesChordArcGenerator({
                    startAngle: startAngle,
                    endAngle: Math.max(startAngle, endAngle), // in case end angle below start angle
                });
            };
        }

        // function calculates the rotation (in radians) to give text on an arc, keeping roughly straight but trying to avoid overlap
        function calculateCountriesChordArcTextRotation(angle, direction) {
            const textAngle = angle + Math.PI/2 * direction; // rotate left or right based on which side of graph so always upright
            const rotateAngle = textAngle + Math.PI/4 * Math.cos(angle % Math.PI); // rotate extremes by at most 45deg to make straighter
            return rotateAngle;
        }
        // function calculates the text translation to outside arc and rotation so roughly straight but tries to avoid overlap 
        function calculateCountriesChordArcTextTransform(angle, direction, textRotation, thisObj) {
            const x =  Math.sin(angle) * (DIAGRAM_RADIUS + DIAGRAM_CHORD_ARC_PADDING);
            const y = -Math.cos(angle) * (DIAGRAM_RADIUS + DIAGRAM_CHORD_ARC_PADDING);
            const textLength = thisObj.getComputedTextLength();

            // calculate position based on above values
            const translateX = x - Math.cos(textRotation) * textLength/2 * direction; // move to either left or right of text
            const translateY = y - Math.sin(textRotation) * textLength/2 * direction; //
            return `translate(${translateX}, ${translateY}) rotate(${radiansToDegrees(textRotation)})`;
        }
        // function gets the text translation to outside arc and rotation so roughly straight but tries to avoid overlap
        function getCountriesChordArcTextTransform(d, thisObj) {
            const angle = (d.startAngle + d.endAngle) / 2; // angle is center between start and end angles
            const direction = Math.sign(angle - Math.PI); // get the direction the text is facing (left of graph or right of graph)
            const textRotation = calculateCountriesChordArcTextRotation(angle, direction);
            return calculateCountriesChordArcTextTransform(angle, direction, textRotation, thisObj);
        }
        // function transitions the text translation to outside arc and rotation so roughly straight but tries to avoid overlap 
        function tweenCountriesChordArcTextTransform(prevD, newD, thisObj) {
            // get the angles as the center between the start and end angles
            const prevAngle = (prevD.startAngle + prevD.endAngle) / 2;
            const newAngle = (newD.startAngle + newD.endAngle) / 2;
            // get the directions the texts are facing (left of graph, right of graph)
            const prevDirection = Math.sign(prevAngle - Math.PI);
            const newDirection = Math.sign(newAngle - Math.PI);
            // get the rotation of the text, since this will be interpolated linearly to avoid the flip at the verticals
            let prevTextRotation = calculateCountriesChordArcTextRotation(prevAngle, prevDirection);
            const newTextRotation = calculateCountriesChordArcTextRotation(newAngle, newDirection);
            // if the rotation is more than 180deg, flip the prev rotation by 360deg to fix this
            if (prevTextRotation - newTextRotation < -Math.PI) {
                prevTextRotation += Math.PI*2;
            } else if (prevTextRotation - newTextRotation > Math.PI) {
                prevTextRotation -= Math.PI*2;
            }
            // calculate the transform based on an interpolation of angles instead of positions
            return (t) => {
                const angle = lerp(prevAngle, newAngle, t);
                const direction = lerp(prevDirection, newDirection, t);
                const textRotation = lerp(prevTextRotation, newTextRotation, t);
                return calculateCountriesChordArcTextTransform(angle, direction, textRotation, thisObj);
            }
        }

        // function shows details about the arc that is currently hovered
        let focusCountryBlurTimeoutId = null;
        const showCountryDetailsOnHoverArc = (artworkCountType) => throttleAction((e, d) => {
            if (focus.data?.type !== FOCUS_ENUM_COUNTRY // only update if changed
             || focus.data?.countryIndex !== d.countryIndex
             || focus.data?.artworkCountType !== artworkCountType) {
                setFocusData({
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.countryIndex,
                    artworkCountType
                });
            } else { // if unchanged, cancel blur that doesn't need to run
                clearTimeout(focusCountryBlurTimeoutId);
            }
        }, FOCUS_THROTTLE_MS);
        // function hides the details when the mouse of is taken off the arc
        const hideCountryDetailsOnBlurArc = (artworkCountType) => (e, d) => {
            focusCountryBlurTimeoutId = setTimeout(() => {
                if (focus.data?.type === FOCUS_ENUM_COUNTRY // only set to null if not changed
                 && focus.data?.countryIndex === d.countryIndex
                 && focus.data?.artworkCountType === artworkCountType) {
                    setFocusData(null);
                }
            }, FOCUS_BLUR_DELAY_MS)
        };

        // function foucses the country and shows the artworks on the sidebar when an arc has been clicked
        const focusCountryDetailsOnClickArc = (artworkCountType) => (e, d) => {
            if (focus.detail?.type === FOCUS_ENUM_COUNTRY // only set to null if not changed
             && focus.detail?.countryIndex === d.countryIndex) {
                focus.data = null;    // if already focused, unfocus
                setFocusDetail(null); //
            } else {
                setFocusDetail({ // otherwise, focus
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.countryIndex,
                    artworkCountType
                });
            }
        };

        // function shows details about the ribbon that is currently hovered
        let focusTravelBlurTimeoutId = null;
        const showTravelDetailsOnHoverRibbon = throttleAction((e, d) => {
            if (focus.data?.type !== FOCUS_ENUM_TRAVEL // only update if changed
             || focus.data?.originCountryIndex !== d.source.countryIndex
             || focus.data?.destCountryIndex !== d.target.countryIndex) {
                setFocusData({
                    type: FOCUS_ENUM_TRAVEL,
                    originCountryIndex: d.source.countryIndex,
                    destCountryIndex: d.target.countryIndex,
                    includeReverseDirection: false,
                });
            } else { // if unchanged, cancel blur that doesn't need to run
                clearTimeout(focusTravelBlurTimeoutId);
            }
        }, FOCUS_THROTTLE_MS);
        // function hides the details when the mouse of is taken off the ribbon
        const hideTravelDetailsOnBlurRibbon = (e, d) => {
            focusTravelBlurTimeoutId = setTimeout(() => {
                if (focus.data?.type === FOCUS_ENUM_TRAVEL // only set to null if not changed
                 && focus.data?.originCountryIndex === d.source.countryIndex
                 && focus.data?.destCountryIndex === d.target.countryIndex) {
                    setFocusData(null);
                }
            }, FOCUS_BLUR_DELAY_MS)
        };

        // function foucses the travel and shows the artworks on the sidebar when a ribbon has been clicked
        const focusTravelDetailsOnClickRibbon = (e, d) => {
            if (focus.detail?.type === FOCUS_ENUM_TRAVEL // only set to null if not changed
             && focus.detail?.originCountryIndex === d.source.countryIndex
             && focus.detail?.destCountryIndex === d.target.countryIndex) {
                focus.data = null;    // if already focused, unfocus
                setFocusDetail(null); //
            } else {
                setFocusDetail({ // otherwise, focus
                    type: FOCUS_ENUM_TRAVEL,
                    originCountryIndex: d.source.countryIndex,
                    destCountryIndex: d.target.countryIndex,
                    includeReverseDirection: false,
                });
            }
        };


        // function sets up the animation, returning an animation data object that holds data needed to run the animation
        const setup = () => {
            // convert the countries data to a graph
            const countriesAdjacencyMatrix = data.filteredCountriesAdjacencyMatrix.map(countryRow => countryRow.map(count => getWeight(count)));
            // find the top countries with the highest relationship between them
            const topCountryIndexes = getTopRelationshipCountriesFromData(countriesAdjacencyMatrix, options.countryCount);
            /*
            * get countries based on ordering of original data instead of by algorithm which does largest weight first
            * (this is needed to minimize chords from crossing over during animations)
            */
            topCountryIndexes.sort((a, b) => a - b);
            // get the matrix used to generate the chord diagram
            const topCountriesMatrix = getTopCountriesMatrix(countriesAdjacencyMatrix, topCountryIndexes);

            // get chord from generator
            const countriesChord = countriesChordGenerator(topCountriesMatrix);

            // add the country index to each data point
            const newRibbonData = countriesChord.map(d => {
                const sourceCountryIndex = topCountryIndexes[d.source.index];
                const targetCountryIndex = topCountryIndexes[d.target.index];
                return {
                    source: {
                        ...d.source,
                        countryIndex: sourceCountryIndex,
                        country: data.artworkRegionCountryCenterPointsGeoJSONFeatures[sourceCountryIndex].properties.country,
                    },
                    target: {
                        ...d.target,
                        countryIndex: targetCountryIndex,
                        country: data.artworkRegionCountryCenterPointsGeoJSONFeatures[targetCountryIndex].properties.country,
                    },
                    artworkCount: data.filteredCountriesAdjacencyMatrix[sourceCountryIndex][targetCountryIndex],
                }
            });

            // add the country index and name to each data group point, and calculate the angle where origin and dest meet on the arc
            const newArcData = countriesChord.length === 0
                ? [] // for some reason empty chord still gives group of length 1, so if empty set to empty array
                : countriesChord.groups.map(d => {
                    // get the properties of the country this data is tied to
                    const countryIndex = topCountryIndexes[d.index];
                    const { properties } = data.artworkRegionCountryCenterPointsGeoJSONFeatures[countryIndex];
                    // calculate the total weight for the origin and dest for this data
                    let originWeight = 0;
                    let destWeight = 0;
                    for (let j = 0; j < topCountriesMatrix[d.index].length; j++) { originWeight += topCountriesMatrix[d.index][j]; }
                    for (let i = 0; i < topCountriesMatrix.length; i++) { destWeight += topCountriesMatrix[i][d.index]; }
                    // calculate the proportion between the two to find angle where origin and dest borders
                    const originProportion = proportion(destWeight, originWeight);
                    const borderAngle = lerp(d.startAngle, d.endAngle, originProportion); // the angle where the origin and dest protions meet
                    // return data with extra information
                    return {
                        ...d,
                        borderAngle,
                        countryIndex,
                        country: properties.country,
                    }
                });

            // compute intermediary ribbon data
            const remainingPrevRibbonData = [];
            const remainingNewRibbonData = [];
            countriesChordRibbonsContainer.selectAll('path').each(function(d) {
                // if prev data is also in new data, add both to remaining arrays
                const newD = newRibbonData.find(newD => ribbonDataKeyExtractor(newD) === ribbonDataKeyExtractor(d));
                if (newD != null) {
                    const remainingIndex = remainingPrevRibbonData.length; // store index so can associate remaining prev and new (index shuffled)
                    remainingPrevRibbonData.push({ source: { ...d.source }, target: { ...d.target }, remainingIndex });
                    remainingNewRibbonData.push({ source: { ...newD.source }, target: { ...newD.target}, remainingIndex });
                }
            });

            // compute intermediary arc data
            const remainingPrevArcData = [];
            const remainingNewArcData = [];
            countriesChordArcsContainer.selectAll('g').each(function(d) {
                // if prev data is also in new data, add both to remaining arrays
                const newD = newArcData.find(newD => arcDataKeyExtractor(newD) === arcDataKeyExtractor(d));
                if (newD != null) {
                    const remainingIndex = remainingPrevArcData.length; // store index so can associate remaining prev and new (index shuffled)
                    remainingPrevArcData.push({ ...d, remainingIndex });
                    remainingNewArcData.push({ ...newD, remainingIndex });
                }
            });

            // return the computed data so they can be used in the transitions
            return {
                remainingPrevRibbonData,
                remainingNewRibbonData,
                newRibbonData,
                remainingPrevArcData,
                remainingNewArcData,
                newArcData,
            };
        }

        // function finds all the chords that are no longer relevant and fades them out
        const fadeOutOldCountriesChords = ({ remainingPrevRibbonData, remainingPrevArcData }) => {
            // fade out ribbons and arcs that have exited from previous data
            const oldCountriesChordRibbons = countriesChordRibbonsContainer.selectAll('path')
                .data(remainingPrevRibbonData, ribbonDataKeyExtractor) // set the data to the intermediary
                .exit() // remove the data that is not remaining
                .transition(getFadeOutOldChordsTransition())
                .attr('opacity', 0) // fade out
                .remove(); // remove DOM element once transition finished
            const oldCountriesChordArcs = countriesChordArcsContainer.selectAll('g')
                .data(remainingPrevArcData, arcDataKeyExtractor) // set the data to the intermediary
                .exit() // remove the data that is not remaining
                .transition(getFadeOutOldChordsTransition())
                .call(function(g) {
                    g.select('path.origin-arc') // origin portion of arc
                        .attrTween('d', function(d) {
                            const prevD = { // start taking up origin portion
                                startAngle: d.startAngle,
                                endAngle: d.borderAngle,
                            };
                            const newD = { // collapse on start angle
                                startAngle: d.startAngle,
                                endAngle: d.startAngle,
                            };
                            return tweenCountriesChordOriginDestArc(prevD, newD);
                        });
                    g.select('path.dest-arc') // origin portion of arc
                        .attrTween('d', function(d) {
                            const prevD = { // start taking up dest portion
                                startAngle: d.borderAngle,
                                endAngle: d.endAngle,
                            };
                            const newD = { // collapse on end angle
                                startAngle: d.endAngle,
                                endAngle: d.endAngle,
                            };
                            return tweenCountriesChordOriginDestArc(prevD, newD);
                        });
                    g.select('path.country-arc') // portion of arc that covers entire country
                        .each(function() {
                            // add this chord's color to the available colors, since no longer using
                            availableColors.push(d3.select(this).attr('fill'));
                        })
                        .attr('opacity', 0); // fade out
                    g.select('text')
                        .attr('opacity', 0); // fade out
                })
                .remove(); // remove DOM element once transition finished;
            
            // return promise to wait until old chords completely gone
            return Promise.all([oldCountriesChordRibbons.end(), oldCountriesChordArcs.end()]);
        }

        // function takes all the chords that are not old nor new and adjusts them to their new positions
        const adjustRemainingCountriesChords = ({
            remainingPrevRibbonData, remainingNewRibbonData,
            remainingPrevArcData, remainingNewArcData
        }) => {
            // update remaining ribbons and chords (not faded out) using new data
            const remainingCountriesChordRibbons = countriesChordRibbonsContainer.selectAll('path')
                .data(remainingNewRibbonData, ribbonDataKeyExtractor) // set data to intermediary
                .transition(getAdjustRemainingChordsTransition())
                .attrTween('d', function(d) {
                    const prevD = remainingPrevRibbonData[d.remainingIndex];
                    return tweenCountriesChordRibbon(prevD, d);
                });
        
            const remainingCountriesChordArcs = countriesChordArcsContainer.selectAll('g')
                .data(remainingNewArcData, arcDataKeyExtractor) // set data to intermediary
                .transition(getAdjustRemainingChordsTransition())
                .call(function(g) {
                    g.select('path.origin-arc') // origin portion of arc
                        .attrTween('d', function(d) {
                            const prevD = remainingPrevArcData[d.remainingIndex];
                            return tweenCountriesChordOriginDestArc(
                                { startAngle: prevD.startAngle, endAngle: prevD.borderAngle },
                                { startAngle: d.startAngle, endAngle: d.borderAngle }
                            );
                        });
                    g.select('path.dest-arc') // dest portion of arc
                        .attrTween('d', function(d) {
                            const prevD = remainingPrevArcData[d.remainingIndex];
                            return tweenCountriesChordOriginDestArc(
                                { startAngle: prevD.borderAngle, endAngle: prevD.endAngle },
                                { startAngle: d.borderAngle, endAngle: d.endAngle }
                            );
                        });
                    g.select('path.country-arc') // portion of arc that covers entire country
                        .attrTween('d', function(d) {
                            const prevD = remainingPrevArcData[d.remainingIndex];
                            return tweenCountriesChordArc(
                                { startAngle: prevD.startAngle, endAngle: prevD.endAngle },
                                { startAngle: d.startAngle, endAngle: d.endAngle }
                            );
                        })
                    g.select('text')
                        .attrTween('transform', function(d) {
                            const prevD = remainingPrevArcData[d.remainingIndex];
                            return tweenCountriesChordArcTextTransform(prevD, d, this);
                        });
                });

            // return promise to wait until adjustment finishes
            return Promise.all([remainingCountriesChordRibbons.end(), remainingCountriesChordArcs.end()]);
        }

        // function fades in the chords that are newly added to the chord graph
        const fadeInNewCountriesChords = ({ newRibbonData, newArcData }) => {
            // fade in ribbons and arcs that are new in the new data
            const newCountriesChordArcsSelection = countriesChordArcsContainer.selectAll('g')
                .data(newArcData, arcDataKeyExtractor) // set to new data
                .enter() // add the data that is not already existing
                .append('g')
                // initialize children of arc
                .call(function(g) {
                    g.append('path') // origin portion of arc
                        .classed('origin-arc', true)
                        .attr('fill', TRAVEL_ORIGIN_COLOR)
                        .style('pointer-events', 'auto'); // allow interaction
                    g.append('path') // dest portion of arc
                        .classed('dest-arc', true)
                        .attr('fill', TRAVEL_DEST_COLOR)
                        .style('pointer-events', 'auto'); // allow interaction
                    g.append('path') // portion of arc that covers entire country, with color of country
                        .classed('country-arc', true)
                        .attr('d', countriesChordArcGenerator)
                        .attr('fill', function() { return availableColors.pop(); }) // get an available color
                        .attr('opacity', 0) // start faded out
                        .style('pointer-events', 'auto'); // allow interaction
                    g.append('text') // text label of arc
                        .attr('text-anchor', 'middle')
                        .attr('alignment-baseline', 'middle')
                        .attr('font-size', DIAGRAM_CHORD_LABEL_FONT_SIZE)
                        .attr('font-weight', 700)
                        .attr('opacity', 0) // start faded out
                        .style('pointer-events', 'auto') // allow interaction
                        .text(function(d) { return d.country; });
                    // update transform after drawing so that text will be rendered and can calculate width
                    g.select('text')
                        .attr('transform', function(d) { return getCountriesChordArcTextTransform(d, this); });
                });
            const newCountriesChordArcs = newCountriesChordArcsSelection
                .transition(getFadeInNewChordsTransition())
                // add transitions to newly added children
                .call(function(g) {
                    g.select('path.origin-arc') // origin portion of arc
                        .attrTween('d', function(d) {
                            const prevD = { // start with start and end angle collapsed on start
                                startAngle: d.startAngle,
                                endAngle: d.startAngle,
                            };
                            const newD = { // end with arc taking up origin portion
                                startAngle: d.startAngle,
                                endAngle: d.borderAngle
                            };
                            return tweenCountriesChordOriginDestArc(prevD, newD);
                        });
                    g.select('path.dest-arc') // dest portion of arc
                        .attrTween('d', function(d) {
                            const prevD = { // start with start and end angle collapsed on end
                                startAngle: d.endAngle,
                                endAngle: d.endAngle,
                            };
                            const newD = { // end with arc taking up dest portion
                                startAngle: d.borderAngle,
                                endAngle: d.endAngle,
                            };
                            return tweenCountriesChordOriginDestArc(prevD, newD);
                        });
                    g.select('path.country-arc') // portion of arc that covers entire country
                        .attr('opacity', 1); // fade in
                    g.select('text') // text label of arc
                        .attr('opacity', 1); // fade in
                });
            // add interation
            newCountriesChordArcsSelection.select('path.origin-arc') // special interaction on origin and dest arcs
                .on('mouseover', showCountryDetailsOnHoverArc(ARTWORK_COUNT_ENUM_ORIGIN))
                .on('mouseout', hideCountryDetailsOnBlurArc(ARTWORK_COUNT_ENUM_ORIGIN))
                .on('mousedown', focusCountryDetailsOnClickArc(ARTWORK_COUNT_ENUM_ORIGIN));
            newCountriesChordArcsSelection.select('path.dest-arc')
                .on('mouseover', showCountryDetailsOnHoverArc(ARTWORK_COUNT_ENUM_DEST))
                .on('mouseout', hideCountryDetailsOnBlurArc(ARTWORK_COUNT_ENUM_DEST))
                .on('mousedown', focusCountryDetailsOnClickArc(ARTWORK_COUNT_ENUM_DEST));
            newCountriesChordArcsSelection.select('path.country-arc')
                .on('mouseover', showCountryDetailsOnHoverArc(ARTWORK_COUNT_ENUM_BOTH))
                .on('mouseout', hideCountryDetailsOnBlurArc(ARTWORK_COUNT_ENUM_BOTH))
                .on('mousedown', focusCountryDetailsOnClickArc(ARTWORK_COUNT_ENUM_BOTH));
            newCountriesChordArcsSelection.select('text')
                .on('mouseover', showCountryDetailsOnHoverArc(ARTWORK_COUNT_ENUM_ORIGIN)) // text highlights origin only
                .on('mouseout', hideCountryDetailsOnBlurArc(ARTWORK_COUNT_ENUM_ORIGIN))
                .on('mousedown', focusCountryDetailsOnClickArc(ARTWORK_COUNT_ENUM_ORIGIN));
            
            const newCountriesChordRibbonsSelection = countriesChordRibbonsContainer.selectAll('path')
                .data(newRibbonData, ribbonDataKeyExtractor) // set to new data
                .enter() // add the data that is not already existing
                .append('path')
                .style('pointer-events', 'auto'); // allow interaction
            const newCountriesChordRibbons = newCountriesChordRibbonsSelection
                .attr('d', countriesChordRibbonGenerator)
                .attr('fill', function(d) {
                    // use same fill as arc of origin of ribbon
                    return countriesChordArcsContainer.selectAll('g')
                        .filter(function(arcD) { return arcD.countryIndex === d.source.countryIndex; })
                        .select('path.country-arc')
                        .attr('fill');
                })
                .style('mix-blend-mode', 'overlay')
                .attr('opacity', 0) // start faded out
                .transition(getFadeInNewChordsTransition())
                .attr('opacity', DIAGRAM_CHORD_RIBBON_OPACITY);
            // add interation
            newCountriesChordRibbonsSelection
                .on('mouseover', showTravelDetailsOnHoverRibbon)
                .on('mouseout', hideTravelDetailsOnBlurRibbon)
                .on('mousedown', focusTravelDetailsOnClickRibbon);

            // return promise to wait until completely faded in
            return Promise.all([newCountriesChordRibbons.end(), newCountriesChordArcs.end()]);
        }

        try {
            runAnimations(
                animationState,
                UPDATE_COUNTRIES_CHORD_DIAGRAM_ANIMATION_ID,
                setup,
                [
                    fadeOutOldCountriesChords,
                    adjustRemainingCountriesChords,
                    fadeInNewCountriesChords,
                ]
            );
        } catch (e) {
            console.error(e);
        }
    }
    animationState.animations[UPDATE_COUNTRIES_CHORD_DIAGRAM_ANIMATION_ID] = updateCountriesChordDiagram; // add animation to state

    updateCountriesChordDiagramFocus = () => {
        // function creates the text that is displayed in the focus display when a country is focused
        const getFocusCountryText = (country, focusArtworkCountType) => 
            (focusArtworkCountType === ARTWORK_COUNT_ENUM_ORIGIN)
                ? `Artworks originating from ${country}`
          : (focusArtworkCountType === ARTWORK_COUNT_ENUM_DEST)
                ? `Artworks displayed in ${country}`
          : (focusArtworkCountType === ARTWORK_COUNT_ENUM_BOTH)
                ? `Artworks originating or displayed in ${country}`
            : ''; 

        // function creates the text that is displayed in the focus display when a travel is focused
        const getFocusTravelText = (originCountry, destCountry, originToDestCount) => 
                `${originCountry} \u2192 ${destCountry}: ${originToDestCount} artwork${originToDestCount === 1 ? '' : 's'}`;

        // function returns true if the given country is present in the diagram, and there exists relevant ribbons from/to the country
        const containsFocusedCountry = ({ countryIndex, artworkCountType }) => {
            const includeOrigin = (artworkCountType === ARTWORK_COUNT_ENUM_ORIGIN || artworkCountType === ARTWORK_COUNT_ENUM_BOTH);
            const includeDest   = (artworkCountType === ARTWORK_COUNT_ENUM_DEST   || artworkCountType === ARTWORK_COUNT_ENUM_BOTH);

            // if at least one ribbon with relevant origin/dest at country, return true 
            return !countriesChordRibbonsContainer.selectAll('path')
                .filter(function(d) {
                    return (includeOrigin && d.source.countryIndex === countryIndex)
                        || (includeDest   && d.target.countryIndex === countryIndex);
                })
                .empty();
        };

        // function returns true if the given travel is present in the diagram
        const containsFocusedTravel = ({ originCountryIndex, destCountryIndex, includeReverseDirection }) =>
            // if at least one ribbon between countries, return true 
            !countriesChordRibbonsContainer.selectAll('path')
                .filter(function(d) {
                    return (d.source.countryIndex === originCountryIndex && d.target.countryIndex === destCountryIndex)
                        || (includeReverseDirection && d.target.countryIndex === originCountryIndex && d.source.countryIndex === destCountryIndex);
                })
                .empty();

        // function determines whether a ribbon should be highlighted
        const highlightRibbonPredicate = (
            originCountryIndex, destCountryIndex,
            includeForwardDirection, includeReverseDirection,
            d
        ) => {
            // if include forward and starts from origin, highlight if destination matches
            if (includeForwardDirection
                 && d.source.countryIndex === originCountryIndex
                 && (destCountryIndex == null || d.target.countryIndex === destCountryIndex)) {
                    return true;
            }
            // if include reverse and ends at origin, highlight if destination matches
            if (includeReverseDirection
                 && d.target.countryIndex === originCountryIndex
                 && (destCountryIndex == null || d.source.countryIndex === destCountryIndex)) {
                    return true;
            }
            // otherwise, do not highlight
            return false;
        }

        // function transitions the opacities of the ribbons and arcs based on what is focused
        const transitionOpacities = ({
            originCountryIndex,
            destCountryIndex = null, // if null, highlight all ribbons starting from origin
            includeForwardDirection = true,  // default include forward only
            includeReverseDirection = false, //
        }, customOtherOpacities) => {
            // initially set all arcs to faded, update as ribbons highlighted
            const countriesChordArcs = countriesChordArcsContainer.selectAll('g')
                .transition(getFocusTransition())
                .call(function(g) {
                    g.select('path.origin-arc')
                        .attr('opacity', customOtherOpacities?.arcOpacity ?? 1);
                    g.select('path.dest-arc')
                        .attr('opacity', customOtherOpacities?.arcOpacity ?? 1);
                    g.select('path.country-arc')
                        .attr('opacity', customOtherOpacities?.arcOpacity ?? 1);
                });

            // transition ribbons
            const countriesChordRibbons = countriesChordRibbonsContainer.selectAll('path')
                .transition(getFocusTransition())
                // set opacity
                .attr('opacity', function(d) {
                    if (highlightRibbonPredicate(
                        originCountryIndex, destCountryIndex,
                        includeForwardDirection, includeReverseDirection, d)
                    ) {
                        return 1;
                    } else {
                        return customOtherOpacities?.ribbonOpacity ?? DIAGRAM_CHORD_RIBBON_OPACITY;
                    }
                })
                // if opacity set, update opacity of related arcs
                .each(function(d) {
                    if (highlightRibbonPredicate(
                        originCountryIndex, destCountryIndex,
                        includeForwardDirection, includeReverseDirection, d)
                    ) {
                        if ((includeForwardDirection && d.source.countryIndex === originCountryIndex)
                         || (includeReverseDirection && d.source.countryIndex === destCountryIndex)) {
                            const originArcG = countriesChordArcs.filter(arcD => arcD.countryIndex === d.source.countryIndex);
                            originArcG.select('path.origin-arc').attr('opacity', 1);
                            originArcG.select('path.country-arc').attr('opacity', 1);
                        }
                        if ((includeForwardDirection && d.target.countryIndex === destCountryIndex)
                         || (includeReverseDirection && d.target.countryIndex === originCountryIndex)) {
                            const destArcG = countriesChordArcs.filter(arcD => arcD.countryIndex === d.target.countryIndex);
                            destArcG.select('path.dest-arc').attr('opacity', 1);
                            destArcG.select('path.country-arc').attr('opacity', 1);
                        }
                    }
                });

            // return promise until transitions end
            return Promise.all([countriesChordArcs.end(), countriesChordRibbons.end()]);
        }

        // function transitions the opacities of the ribbons and arcs and displays detail text for the focused country
        const transitionFocusCountry = (focusCountryIndex, focusArtworkCountType, customOtherOpacities) => {
            // get details about focused country
            const country = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusCountryIndex].properties.country;
            
            // add text for travel information
            focusDisplay.append('tspan').text(getFocusCountryText(country, focusArtworkCountType));
            
            // format focus country params to work in setOpacity function, by specifying country index as origin country index
            const focusOpacityParam = {
                originCountryIndex: focusCountryIndex,
                includeForwardDirection: focusArtworkCountType === ARTWORK_COUNT_ENUM_ORIGIN // only include forward if include origin
                                      || focusArtworkCountType === ARTWORK_COUNT_ENUM_BOTH,  //
                includeReverseDirection: focusArtworkCountType === ARTWORK_COUNT_ENUM_DEST // if includes dest, include reverse
                                      || focusArtworkCountType === ARTWORK_COUNT_ENUM_BOTH //
            };
            // transition chord diagram
            return transitionOpacities(focusOpacityParam, customOtherOpacities);
        }

        // function transitions the opacities of the ribbons and arcs and displays detail text for the focused travel
        const transitionFocusTravel = (focusD, customOtherOpacities) => {
            // get details about focused travel
            const originCountry = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusD.originCountryIndex].properties.country;
            const destCountry = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusD.destCountryIndex].properties.country;
            const originToDestCount = data.filteredCountriesAdjacencyMatrix[focusD.originCountryIndex][focusD.destCountryIndex];
            
            // add text for travel information
            focusDisplay.append('tspan')
                .text(getFocusTravelText(originCountry, destCountry, originToDestCount));
            // if other direction included, add display for that too, above other one
            if (focusD.includeReverseDirection) {
                const destToOriginCount = data.filteredCountriesAdjacencyMatrix[focusD.destCountryIndex][focusD.originCountryIndex];
                focusDisplay.append('tspan')
                    .attr('x', 0)
                    .attr('dy', -(FOCUS_DISPLAY_FONT_SIZE + FOCUS_DISPLAY_TEXT_PADDING))
                    .text(getFocusTravelText(destCountry, originCountry, destToOriginCount));
            }
            
            // transition chord diagram
            return transitionOpacities(focusD, customOtherOpacities);
        }

        const update = () => {
            // clear the focus display
            focusDisplay.selectAll('tspan').remove();

            // if focused on country, make other ribbons and arcs more transparent
            if (focus.data?.type === FOCUS_ENUM_COUNTRY) {
                if (containsFocusedCountry(focus.data)) { // only focus if diagram contains country
                    return transitionFocusCountry(focus.data.countryIndex, focus.data.artworkCountType, {
                        arcOpacity: FOCUS_OTHER_OPACITY,
                        ribbonOpacity: FOCUS_OTHER_OPACITY,
                    });
                }  
            }
            
            // if focused on travel, put new text into display and make other ribbons and arcs more transparent
            if (focus.data?.type === FOCUS_ENUM_TRAVEL) {
                if (containsFocusedTravel(focus.data)) { // only focus if diagram contains travel
                    return transitionFocusTravel(focus.data, {
                        arcOpacity: FOCUS_OTHER_OPACITY,
                        ribbonOpacity: FOCUS_OTHER_OPACITY,
                    });
                }
            }

            // if focused on country details, put new text into display and make subtly more opaque
            if (focus.detail?.type === FOCUS_ENUM_COUNTRY) {
                if (containsFocusedCountry(focus.detail)) { // only focus if diagram contains country
                    return transitionFocusCountry(focus.detail.countryIndex, focus.detail.artworkCountType);
                }
            }

            // if focused on travel details, put new text into display and make subtly more opaque
            if (focus.detail?.type === FOCUS_ENUM_TRAVEL) {
                if (containsFocusedTravel(focus.detail)) { // only focus if diagram contains travel
                    return transitionFocusTravel(focus.detail);
                }
            }

            // otherwise, return opacity to normal and don't add text to display
            const countryChordArcs = countriesChordArcsContainer.selectAll('g').selectAll('path')
                .transition(getFocusTransition())
                .attr('opacity', 1);
            const countryChordRibbons = countriesChordRibbonsContainer.selectAll('path')
                .transition(getFocusTransition())
                .attr('opacity', DIAGRAM_CHORD_RIBBON_OPACITY);
            return Promise.all([countryChordArcs.end(), countryChordRibbons.end()]); // return promise until transition ends
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
    animationState.animations[UPDATE_FOCUS_ANIMATION_ID] = updateCountriesChordDiagramFocus; // add animation to state

    //#endregion
}