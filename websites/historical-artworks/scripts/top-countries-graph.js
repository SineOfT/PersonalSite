import { FOCUS_ENUM_COUNTRY, ARTWORK_COUNT_ENUM_ORIGIN, ARTWORK_COUNT_ENUM_DEST, ARTWORK_COUNT_ENUM_BOTH } from './enums.js';
import { TRAVEL_DEST_COLOR, TRAVEL_ORIGIN_COLOR } from './map.js';
import { lerp, throttleAction, runAnimations, createRangeControl, createAdvancedControls } from './utils.js';

//////////////////////
//#region CONSTANTS //
//////////////////////

// set visualization to have constant width and height so screen size doesn't affect
const W = 1000;
const H = 800;

const MAX_COUNTRY_COUNT = 20; // maximum of 20 bars on graph

const MIN_AXIS_Y_MAX = 10; // default max of y axis when no countries are in the graph

// layout constants
// focus display
const GRAPH_FOCUS_DISPLAY_PADDING = 30;
const GRAPH_FOCUS_DISPLAY_FONT_SIZE = 25;
const GRAPH_FOCUS_DISPLAY_TEXT_SPACING = 15;
const GRAPH_FOCUS_DISPLAY_COLOR = '#555';
const FOCUS_OTHER_OPACITY = 0.3;
// legend
const GRAPH_LEGEND_X = 100;
const GRAPH_LEGEND_Y = GRAPH_FOCUS_DISPLAY_FONT_SIZE + GRAPH_FOCUS_DISPLAY_PADDING;
const GRAPH_LEGEND_WIDTH = 300;
const GRAPH_LEGEND_PADDING = 30;
const GRAPH_LEGEND_FONT_SIZE = 30;
const GRAPH_LEGEND_SWATCH_SIZE = 30;
const GRAPH_LEGEND_SWATCH_PADDING = 10;
// set space that graph will take up, leave extra room for axis texts and animations
const GRAPH_ORIGIN_X = 150;
const GRAPH_EXTENT_X = W - 150;
const GRAPH_ORIGIN_Y = H - 200;
const GRAPH_EXTENT_Y = GRAPH_LEGEND_Y + GRAPH_LEGEND_FONT_SIZE + GRAPH_LEGEND_PADDING;
const GRAPH_WIDTH = GRAPH_EXTENT_X - GRAPH_ORIGIN_X;
const GRAPH_HEIGHT = -(GRAPH_EXTENT_Y - GRAPH_ORIGIN_Y);
// axes
const GRAPH_AXIS_TICK_SIZE = 20;
const GRAPH_AXIS_TICK_PADDING = 10;
const GRAPH_AXIS_STROKE_WIDTH = 5;
const GRAPH_AXIS_FONT_SIZE = 20;
const GRAPH_AXIS_X_PADDING = 0.05; // add 5% of padding to make axis go above highest count
// axis guidelines
const GRAPH_GUIDELINE_STROKE_WIDTH = 1;
const GRAPH_GUIDELINE_OPACITY = 0.5;
// bars
const GRAPH_BAR_PADDING = 0.2;
const GRAPH_BAR_OPACITY = 0.8;

// animation constants
const UPDATE_TOP_COUNTRIES_GRAPH_ANIMATION_ID = 1;
const UPDATE_FOCUS_ANIMATION_ID = 2;
// how long to throttle the hover detection until beginning the animation, so animations don't start prematurely
const FOCUS_COUNTRY_THROTTLE_MS = 100;
// how long to wait before starting focus travel blur animation, so don't need to wait until finish blur before refocusing
const FOCUS_COUNTRY_BLUR_DELAY_MS = 300;

// control constants
const COUNTRY_COUNT_SCALE = d3.scaleLinear() // scale HTML range to up to number of distinct colors 
    .domain([1, MAX_COUNTRY_COUNT]) // discrete
    .rangeRound([1, MAX_COUNTRY_COUNT])
    .nice();
const AXIS_Y_POWER_SCALE = d3.scaleLinear() // scale HTML range to range of powers to give Y axis to better see small values
    .domain([0, 100])
    .range([0.25, 1]); // up to forth root
const RANGE_SLIDER_THROTTLE_MS = 100;

//#endregion

/////////////////////////////////
//#region TRANSITION CONSTANTS //
/////////////////////////////////

// transitions for update animation
const getFadeOutTopCountriesTransition = () => d3.transition()
    .duration(500)
    .ease(d3.easeQuadIn)
const getFadeInTopCountriesTransition = () => d3.transition()
    .duration(500)
    .ease(d3.easeQuadInOut);
const getBounceBarHeightsTransition = () => d3.transition()
    .delay(100)
    .duration(800)
    .ease(d3.easeBackOut);
const getScaleAxisYTransition = () => d3.transition()
    .duration(600)
    .ease(d3.easeQuadInOut);

// transition for hover interaction
const getFocusCountryTransition = () => d3.transition()
    .duration(300);

//#endregion

/////////////////////////
//#region DOM ELEMENTS //
/////////////////////////

const topCountriesGraphSVGContainer = document.getElementById('topCountriesGraphSVGContainer');
const topCountriesGraphSVG = document.getElementById('topCountriesGraphSVG');

//#endregion

// function will update the graph based on the changes to the data once it's initialized, if called before initialized will do nothing
let updateTopCountriesGraph = () => { };

// function will update the country being focused, displaying info in the display and make other bars more transparent
export let updateTopCountriesGraphFocus = () => { };

// adding filters to the data will invoke an update so the changes are displayed, and recompute focus styling
export let updateTopCountriesFiltering = () => {
    updateTopCountriesGraph();
    updateTopCountriesGraphFocus();
}

// function initializes the top countries graph
export function initTopCountriesGraph(data, focus, setFocusData, setFocusDetail) {

    //////////////////////
    //#region VARIABLES //
    //////////////////////

    // the values of the user controls that are exposed for this visualization
    const options = {
        countryCount: 10, // default top 5 countries shown
        axisYPowerScale: 1, // default to no distortion scaling
        graphArtworkType: ARTWORK_COUNT_ENUM_BOTH, // default show both origin and dest artworks
        isOriginOverDest: true, // default put origin bar stacked over dest bar when both shown
    };

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
    title.textContent = 'Top Country Artwork Counts';
    
    // extra description for purpose of visualization
    const descriptions = [
        'See how many artworks originate or are displayed in different countries.',
        'Click on the legend to compare the artworks originating from a country versus the artworks displayed in a country.',
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
    topCountriesGraphSVGContainer.insertBefore(infoContainer, topCountriesGraphSVG);

    // warning for using scale distortion alongside stacked bars
    const distortedStackedBarsWarning = document.createElement('div');
    distortedStackedBarsWarning.classList.add('alert', 'alert-warning', 'm-3', 'd-none'); // hidden on default
    distortedStackedBarsWarning.style.fontSize = '0.8em';
    distortedStackedBarsWarning.role = 'alert';
    distortedStackedBarsWarning.textContent =
        'Note - When you use a distorted scale with stacked bars, the bars on top will become distorted unevenly, ' +
        'making it misleading to compare between different bars. In order to compare the top bars, either view only the ' +
        'originating or displayed artworks, or switch the order of the stack, by clicking on the legend.';
    
    // insert the warning below the diagram
    topCountriesGraphSVGContainer.appendChild(distortedStackedBarsWarning);

    //#endregion

    /////////////////////
    //#region CONTROLS //
    /////////////////////
    
    // create control inputs
    const [countryCountRangeContainer, countryCountRange] =
        createRangeControl('countryCountRange', 'Country Count: ', COUNTRY_COUNT_SCALE, options.countryCount,
            'Controls the number of countries that are represented in the graph. ' +
            'More countries leads to more information, but adds clutter.'
        );

    const [axisYPowerScaleRangeContainer, axisYPowerScaleRange] =
        createRangeControl('axisYPowerScaleRange', 'Y Axis Scale Power: ', AXIS_Y_POWER_SCALE, options.axisYPowerScale,
            'Control how distored the Y axis on the graph is. ' +
            'Numbers smaller than 1 will make it easier to see smaller values without getting overpowered by large values.'
        );

    // place controls in advanced controls section
    const { controlsCollapse, collapseButton } = createAdvancedControls('topCountriesGraphControlsCollapse');
    controlsCollapse.appendChild(countryCountRangeContainer);
    controlsCollapse.appendChild(axisYPowerScaleRangeContainer);

    // add elements to DOM
    topCountriesGraphSVGContainer.appendChild(collapseButton);
    topCountriesGraphSVGContainer.appendChild(controlsCollapse);

    // add interaction to controls
    countryCountRange.addEventListener('input', throttleAction((e) => {
        const rangeValue = parseInt(e.target.value);
        options.countryCount = COUNTRY_COUNT_SCALE(rangeValue);
        updateTopCountriesGraph();
    }, RANGE_SLIDER_THROTTLE_MS));

    axisYPowerScaleRange.addEventListener('input', throttleAction((e) => {
        const rangeValue = parseInt(e.target.value);
        options.axisYPowerScale = AXIS_Y_POWER_SCALE(rangeValue);
        updateTopCountriesGraph();
    }, RANGE_SLIDER_THROTTLE_MS));
    
    //#endregion

    //////////////////////
    //#region RENDERING //
    //////////////////////

    // create SVG container
    const svg = d3.select(topCountriesGraphSVG).attr('viewBox', `0 0 ${W} ${H}`);

    // gradients for legend swatch
    const svgDefs = svg.append('defs');
    const originOverDestGradientId = 'originOverDestGradient';
    svgDefs.append('linearGradient')
        .attr('id', originOverDestGradientId)
        .attr('x1', 0.35) // Y gradient steeper than X so is closer-to-horizontal slope, show which on top
        .attr('x2', 0.65) //
        .attr('y1', 0)    //
        .attr('y2', 1)    //
        .call(function(linearGradient) {
            linearGradient.append('stop').attr('offset', '49.9%').attr('stop-color', TRAVEL_ORIGIN_COLOR);
            linearGradient.append('stop').attr('offset', '51.1%').attr('stop-color', TRAVEL_DEST_COLOR);
        });
    const destOverOriginGradientId = 'destOverOriginGradient';
    svgDefs.append('linearGradient')
        .attr('id', destOverOriginGradientId)
        .attr('x1', 0.65) // Y gradient steeper than X so is closer-to-horizontal slope, show which on top
        .attr('x2', 0.35) // switch direction of gradient for visual interest
        .attr('y1', 0)    //
        .attr('y2', 1)    //
        .call(function(linearGradient) {
            linearGradient.append('stop').attr('offset', '49.9%').attr('stop-color', TRAVEL_DEST_COLOR);
            linearGradient.append('stop').attr('offset', '51.1%').attr('stop-color', TRAVEL_ORIGIN_COLOR);
        });

    // define axis scales, domains to be dynamically changed in update function
    const axisX = d3.scaleBand()
        .range([GRAPH_ORIGIN_X, GRAPH_EXTENT_X])
        .padding(GRAPH_BAR_PADDING);
    const axisY = d3.scalePow()
        .range([GRAPH_ORIGIN_Y, GRAPH_EXTENT_Y]);
    // define axis generators, with scales references to above axis scales
    const axisBottomGenerator = d3.axisBottom(axisX)
        .tickSize(0)
        .tickFormat(d => typeof d === 'string' ? d : '') // if is not string (ex. empty object), no label
        .tickPadding(GRAPH_AXIS_TICK_PADDING);
    const axisLeftGenerator = d3.axisLeft(axisY)
        .ticks(0, 's') // no ticks when first rendering
        .tickSizeInner(GRAPH_AXIS_TICK_SIZE)
        .tickSizeOuter(0)
        .tickPadding(GRAPH_AXIS_TICK_PADDING);

    // define axis elements
    const graphAxisBottom = svg.append('g')
        .attr('transform', `translate(0, ${GRAPH_ORIGIN_Y + GRAPH_AXIS_STROKE_WIDTH/2})`) // shift down so bar not overlapping
        .call(axisBottomGenerator);
    const graphAxisLeft = svg.append('g')
        .attr('transform', `translate(${GRAPH_ORIGIN_X}, 0)`)
        .call(axisLeftGenerator);
    
    axisLeftGenerator.ticks(10, 's'); // add 10 ticks to graph once there is actual data to show

    // style the constant stylings of the axes
    d3.selectAll([...graphAxisBottom, ...graphAxisLeft]) // so that can style together
        .attr('stroke-width', GRAPH_AXIS_STROKE_WIDTH)
        .attr('stroke-linecap', 'square'); // so that corner is nice and sharp

    // define graph bars
    const graphBarsContainer = svg.append('g');

    // add legend to graph
    const generateLegendContent = (fill, text) => function(g) {
        g.append('rect')
            .style('pointer-events', 'auto')
            .attr('width', GRAPH_LEGEND_SWATCH_SIZE)
            .attr('height', GRAPH_LEGEND_SWATCH_SIZE)
            .attr('fill', fill);
        g.append('text')
            .style('pointer-events', 'auto')
            .attr('x', GRAPH_LEGEND_SWATCH_SIZE + GRAPH_LEGEND_SWATCH_PADDING)
            .attr('dy', GRAPH_LEGEND_SWATCH_SIZE/2 + GRAPH_LEGEND_FONT_SIZE/2)
            .attr('font-size', GRAPH_LEGEND_FONT_SIZE)
            .attr('font-weight', 700)
            .text(text);
    };

    const legendContainer = svg.append('g')
        .attr('transform', `translate(${GRAPH_LEGEND_X}, ${GRAPH_LEGEND_Y})`);
    const originLegend = legendContainer.append('g')
        .call(generateLegendContent(TRAVEL_ORIGIN_COLOR, 'Originating'));
    const destLegend = legendContainer.append('g')
        .attr('transform', `translate(${GRAPH_LEGEND_WIDTH}, 0)`)
        .call(generateLegendContent(TRAVEL_DEST_COLOR, 'Displayed'));
    const originAndDestLegend = legendContainer.append('g')
        .attr('transform', `translate(${GRAPH_LEGEND_WIDTH*2}, 0)`)
        .call(generateLegendContent(
            options.isOriginOverDest
                ? `url(#${originOverDestGradientId})`
                : `url(#${destOverOriginGradientId})`,
            'Both'
        ));
    // add interaction to legend
    originLegend
        .on('mousedown', function() {
            options.graphArtworkType = ARTWORK_COUNT_ENUM_ORIGIN;
            updateTopCountriesGraph();
        });
    destLegend
        .on('mousedown', function() {
            options.graphArtworkType = ARTWORK_COUNT_ENUM_DEST;
            updateTopCountriesGraph();
        });
    originAndDestLegend
        .on('mousedown', function() {
            // if already selected, switch order
            if (options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
                options.isOriginOverDest = !options.isOriginOverDest;
                originAndDestLegend.select('rect')
                    .attr('fill', options.isOriginOverDest
                        ? `url(#${originOverDestGradientId})`
                        : `url(#${destOverOriginGradientId})`);
            // otherwise, just change type to show both
            } else {
                options.graphArtworkType = ARTWORK_COUNT_ENUM_BOTH;
            }
            updateTopCountriesGraph();
        });
    
    // show details about focused country if any focused
    const focusCountryDisplay = svg.append('text')
        .attr('x', (GRAPH_ORIGIN_X + GRAPH_EXTENT_X) / 2) // align to center of graph
        .attr('y', GRAPH_FOCUS_DISPLAY_FONT_SIZE)
        .attr('text-anchor', 'middle')
        .attr('font-size', GRAPH_FOCUS_DISPLAY_FONT_SIZE)
        .attr('font-weight', 700);

    //#endregion

    ///////////////////
    //#region UPDATE //
    ///////////////////

    // since the countries are unique, use as key identifier
    const dataKeyExtractor = d => d.country;

    updateTopCountriesGraph = async () => {
        // determine the way artworks are counted based on the graph artwork type
        let countOriginArtworks = _d => 0; // default return 0
        let countDestArtworks   = _d => 0; //
        if (options.graphArtworkType === ARTWORK_COUNT_ENUM_ORIGIN || options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
            countOriginArtworks = d => d.filteredOriginArtworks.length
        }
        if (options.graphArtworkType === ARTWORK_COUNT_ENUM_DEST || options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
            countDestArtworks = d => d.filteredDestArtworks.length;
        }
        // shorthand function adds up the origin and dest artworks
        const countTotalArtworks = d => countOriginArtworks(d) + countDestArtworks(d);

        // get the positions of each bar based on the options
        const { countOriginBarY, countOriginBarBottom, countDestBarY, countDestBarBottom } = options.isOriginOverDest
            ? {
                countOriginBarY: countTotalArtworks,
                countOriginBarBottom: countDestArtworks,
                countDestBarY: countDestArtworks,
                countDestBarBottom: () => 0,
            } : {
                countDestBarY: countTotalArtworks,
                countDestBarBottom: countOriginArtworks,
                countOriginBarY: countOriginArtworks,
                countOriginBarBottom: () => 0,
            };

        // function counts the number of artworks via the current option and finds the top N countries
        function findTopCountryProperties() {
            // find the indexes of the top N countries based on the artwork counts
            const topCountryIndexes = data.artworkRegionCountryCenterPointsGeoJSONFeatures.reduce((acc, { properties }, countryIndex) => {
                // get count of country
                const count = countTotalArtworks(properties);
                if (count === 0) { return acc; } // do not include any with no count
                // compare against the highest counts found so far
                for (let i = 0; i < acc.length; i++) {
                    // if this count is larger than a count in the highests accumulator:
                    if (count > acc[i].count) {
                        // append the count to the highests accumulator in front of the current
                        acc.splice(i, 0, { countryIndex, count });
                        // if this makes the number of highests more than the number of top countries on the graph, remove the last
                        if (acc.length > options.countryCount) { acc.pop(); }
                        return acc;
                    }
                    // this maintains order to highest at the start of acc, so inserting at first instance of higher works to maintain this order
                }
                // if the count is not higher than any of the counts in the accumulator but there is still space in the acc, add it to the end
                if (acc.length < options.countryCount) {
                    acc.push({ countryIndex, count });
                }
                return acc;
            }, []);

            // get the country properties from the indexes
            const topCountryProperties = topCountryIndexes.map(({ countryIndex, count }) => (
                { ...data.artworkRegionCountryCenterPointsGeoJSONFeatures[countryIndex].properties, countryIndex, count }));

            return topCountryProperties;
        }

        // function tweens the bar's Y value so it never goes below graph
        const tweenBarY = (newY, selection) => {
            const prevY = selection.attr('y');
            return (t) => Math.min(lerp(prevY, newY, t), GRAPH_ORIGIN_Y); // clamp to not go below graph
        };

        // function tweens the bar's height so it never becomes negative nor goes below graph
        const tweenBarHeight = (newY, newBottom, selection) => {
            const prevY = parseFloat(selection.attr('y'));
            const prevBottom = parseFloat(selection.attr('height')) + prevY;
            return (t) => Math.max(
                Math.min(lerp(prevBottom, newBottom, t), GRAPH_ORIGIN_Y) // clamp to not go below graph
                - Math.min(lerp(prevY, newY, t), GRAPH_ORIGIN_Y) // clamp to not go below graph
            , 0); // clamp to non-negative
        };

        // function focuses on the country whose bar has been hovered or unhovered
        let focusBlurTimeoutId = null;
        const showCountryDetailsOnHoverBar = throttleAction((e, d) => {
            if (focus.data?.type !== FOCUS_ENUM_COUNTRY || focus.data?.countryIndex !== d.countryIndex) { // if changed, update
                setFocusData({
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.countryIndex,
                    artworkCountType: options.graphArtworkType,
                });
            } else { // if no change, cancel the blur that does not need to run (occurs when ex. origin -> dest same country)
                clearTimeout(focusBlurTimeoutId);
            }
        }, FOCUS_COUNTRY_THROTTLE_MS);
        const hideCountryDetailsOnBlurBar = (e, d) => {
            focusBlurTimeoutId = setTimeout(() => { // delay to avoid incorrect blurs
                if (focus.data?.type === FOCUS_ENUM_COUNTRY && focus.data?.countryIndex === d.countryIndex) {
                    setFocusData(null);
                }
            }, FOCUS_COUNTRY_BLUR_DELAY_MS);
        };

        // function foucses the country and shows the artworks on the sidebar when a bar has been clicked
        const focusCountryDetailsOnClickBar = (e, d) => {
            if (focus.detail?.type === FOCUS_ENUM_COUNTRY && focus.detail?.countryIndex === d.countryIndex) {
                focus.data = null;    // if already focused, unfocus
                setFocusDetail(null); //
            } else {
                setFocusDetail({ // otherwise, focus
                    type: FOCUS_ENUM_COUNTRY,
                    countryIndex: d.countryIndex,
                    artworkCountType: options.graphArtworkType,
                });
            }
        };

        // function generates the new data and any intermediate data needed for the transitions
        const setup = () => {
            // get the top countries
            const topCountryProperties = findTopCountryProperties();

            // format the new data
            const newData = topCountryProperties.map((d) => ({
                country: d.country,
                countryIndex: d.countryIndex,
                count: d.count,
                origin: {
                    yCount: countOriginBarY(d),
                    bottomCount: countOriginBarBottom(d),
                },
                dest: {
                    yCount: countDestBarY(d),
                    bottomCount: countDestBarBottom(d),
                },
            }));

            // compute intermediary data
            const remainingPrevData = [];
            const remainingNewData = [];
            graphBarsContainer.selectAll('g').each(function(d) {
                const newD = newData.find(newD => dataKeyExtractor(newD) === dataKeyExtractor(d));
                if (newD != null) {
                    const remainingIndex = remainingPrevData.length; // store index so can associate remaining prev and new (index shuffled)
                    remainingPrevData.push({ ...d, remainingIndex });
                    remainingNewData.push({ ...newD, remainingIndex });
                }
            });

            // return the computed data so they can be used in the transitions
            return {
                remainingPrevData,
                remainingNewData,
                newData,
            };
        }

        // function transitions out the countries and corresponding labels that are no longer relevant
        const fadeOutTopCountries = ({ remainingPrevData }) => {
            // fade old bars out to right
            const oldBars = graphBarsContainer.selectAll('g')
                .data(remainingPrevData, dataKeyExtractor) // set data to intermediary
                .exit() // remove old data
                .attr('opacity', 1) // explicitly set opacity to make work with fade out
                .transition(getFadeOutTopCountriesTransition())
                .attr('transform', `translate(${W}, 0)`) // move to right of SVG
                .attr('opacity', 0) // fade out
                .call(function(g) {
                    g.select('rect.origin-bar')     // make bar 0 height
                        .attr('y', GRAPH_ORIGIN_Y)  //
                        .attr('height', 0);         //
                    g.select('rect.dest-bar')       //
                        .attr('y', GRAPH_ORIGIN_Y)  //
                        .attr('height', 0);         //
                })
                .each(function(d) {
                    // find the label corresponding to this bar
                    const oldAxisXLabel = graphAxisBottom.selectAll('g.tick').filter(function(label) { return label === d.country; });
                    // fade old axis label out to right
                    oldAxisXLabel
                        .attr('opacity', 1) // explicitly set opacity to make work with fade out
                        .transition(getFadeOutTopCountriesTransition())
                        .attr('transform', `translate(${W}, 0)`) // move to right of SVG
                        .attr('opacity', 0) // fade out
                        .remove();
                })
                .remove();
            
            // wait until transition finishes
            return oldBars.end();
        }

        // function transitions the bars' heights from the old scale to the new scale
        const transitionBarHeights = async ({ remainingPrevData, remainingNewData, newData }) => {
            // calculate previous and new max value for y axis
            const prevAxisYMax = axisY.domain()[1];
            // max count is count of highest country in top countries, clamped to min y axis value
            const newAxisYMax = Math.max(newData[0]?.count ?? 0, MIN_AXIS_Y_MAX) * (1+GRAPH_AXIS_X_PADDING);
            // copy the previous axis
            const prevAxisY = axisY.copy();
            
            // update y axis scale
            axisY
                .domain([0, newAxisYMax])
                .exponent(options.axisYPowerScale);

            // update graph bars to next intermediary data
            const graphBars = graphBarsContainer.selectAll('g')
                .data(remainingNewData, dataKeyExtractor);

            // function updates the y axis
            const scaleAxisY = () => {
                // rerender the y axis with the new scale
                const axisLeft = graphAxisLeft
                    .transition(getScaleAxisYTransition())
                    .call(axisLeftGenerator)
                    .call(function(g) {
                        // style the axes
                        g.selectAll('line') // guidelines
                            .attr('x1', GRAPH_WIDTH)
                            .attr('stroke-width', GRAPH_GUIDELINE_STROKE_WIDTH)
                            .attr('opacity', GRAPH_GUIDELINE_OPACITY);
                        g.selectAll('text') // tick labels
                            .attr('font-size', GRAPH_AXIS_FONT_SIZE)
                            .attr('font-weight', 700);
                    });
                // wait until transitions finish
                return axisLeft.end();
            }

            // function updates the bars to the height specified by the getData data and the y axis scale
            const scaleBarHeights = (getTransition, scaleY, data) => {
                return graphBars
                    .transition(getTransition())
                    .call(function(g) {
                        g.select('rect.origin-bar')
                            .attrTween('y', function(d) {
                                return tweenBarY(
                                    scaleY(data[d.remainingIndex].origin.yCount),
                                    d3.select(this),
                                );
                            })
                            .attrTween('height', function(d) {
                                return tweenBarHeight(
                                    scaleY(data[d.remainingIndex].origin.yCount),
                                    scaleY(data[d.remainingIndex].origin.bottomCount),
                                    d3.select(this),
                                );
                            });
                        g.select('rect.dest-bar')
                            .attrTween('y', function(d) {
                                return tweenBarY(
                                    scaleY(data[d.remainingIndex].dest.yCount),
                                    d3.select(this),
                                );
                            })
                            .attrTween('height', function(d) {
                                return tweenBarHeight(
                                    scaleY(data[d.remainingIndex].dest.yCount),
                                    scaleY(data[d.remainingIndex].dest.bottomCount),
                                    d3.select(this),
                                );
                            });
                    })
                    .end()
            };

            // check if data and options have changed since previous render, so can skip animation if no change
            const dataUnchanged = remainingPrevData.every(prevD => {
                const newD = remainingNewData[prevD.remainingIndex];
                return prevD.origin.yCount === newD.origin.yCount
                    && prevD.origin.bottomCount === newD.origin.bottomCount
                    && prevD.dest.yCount === newD.dest.yCount
                    && prevD.dest.bottomCount === newD.dest.bottomCount;
            });
            const axisYPowerScaleUnchanged = options.axisYPowerScale === prevAxisY.exponent();
            
            // if all counts are identical and axis scaling not changed, no need to scale heights
            if (dataUnchanged && axisYPowerScaleUnchanged) {
                await scaleAxisY(); // update Y axis in case this is the startup case

            // if only axis y power scale is changed, transition axis and scale bar heights only
            } else if (dataUnchanged) {
                // update y axis
                const scaleAxisYPromise = scaleAxisY();
                // update bars to y axis scale, still using previous data
                const scaleBarHeightsPromise = scaleBarHeights(getScaleAxisYTransition, axisY, remainingNewData);
                // wait until transitions finish
                await Promise.all([scaleAxisYPromise, scaleBarHeightsPromise]);

            // if the previous and new axis are completely unchanged, transition the bar heights only
            } else if (prevAxisYMax === newAxisYMax && axisYPowerScaleUnchanged) {
                // update height of bars to the new data (bounce for emphasis)
                await scaleBarHeights(getBounceBarHeightsTransition, axisY, remainingNewData);

            // if the previous axis is smaller than the new axis, transition the axis first so no clipping occurs
            } else if (prevAxisYMax < newAxisYMax) {
                // update y axis
                const scaleAxisYPromise = scaleAxisY();
                // update bars to y axis scale, still using previous data
                const scaleBarHeightsPromise = scaleBarHeights(getScaleAxisYTransition, axisY, remainingPrevData);
                // wait until transitions finish
                await Promise.all([scaleAxisYPromise, scaleBarHeightsPromise]);

                // update height of bars to the new data (bounce for emphasis)
                await scaleBarHeights(getBounceBarHeightsTransition, axisY, remainingNewData);

            // if the previous axis is larger than the new axis, transition the bars first so no clipping occurs
            } else {
                // update height of bars to the new data (bounce for emphasis)
                await scaleBarHeights(getBounceBarHeightsTransition, prevAxisY, remainingNewData);
                
                // update y axis
                const scaleAxisYPromise = scaleAxisY();
                // update bars to new y axis scale
                const scaleBarHeightsPromise = scaleBarHeights(getBounceBarHeightsTransition, axisY, remainingNewData);
                // wait until transitions finish
                await Promise.all([scaleAxisYPromise, scaleBarHeightsPromise]);
            }
        }

        // function transitions in the countries and corresponding labels that are newly added to the graph
        const fadeInTopCountries = ({ newData }) => {
            // get the labels for the graph
            const axisXLabels = newData.map(d => d.country);
            for (let i = axisXLabels.length; i < options.countryCount; i++) { axisXLabels[i] = { }; } // pad remaining with object (since { } !== { })
            
            // update axis scale domain to new labels
            axisX.domain(axisXLabels);

            // for each new top country add 2 rects, 1 for origin and 1 for dest
            const newBars = graphBarsContainer.selectAll('g')
                .data(newData, dataKeyExtractor)
                .enter().append('g');
            newBars.append('rect')
                .classed('origin-bar', true)
                .attr('width', axisX.bandwidth())
                .attr('fill', TRAVEL_ORIGIN_COLOR)
                .attr('transform', `translate(${W}, 0)`) // start at right of SVG
                .attr('y', GRAPH_ORIGIN_Y) // start bar at 0 height
                .attr('height', 0)         //
                .attr('opacity', 0) // started faded out
                .style('pointer-events', 'auto'); // allow interaction
            newBars.append('rect')
                .classed('dest-bar', true)
                .attr('width', axisX.bandwidth())
                .attr('fill', TRAVEL_DEST_COLOR)
                .attr('transform', `translate(${W}, 0)`) // start at right of SVG
                .attr('y', GRAPH_ORIGIN_Y) // start bar at 0 height
                .attr('height', 0)         //
                .attr('opacity', 0) // started faded out
                .style('pointer-events', 'auto'); // allow interaction
            // add interaction
            newBars
                .on('mouseover', showCountryDetailsOnHoverBar)
                .on('mouseout', hideCountryDetailsOnBlurBar)
                .on('mousedown', focusCountryDetailsOnClickBar);
            
            // update stylings
            const graphBars = graphBarsContainer.selectAll('g')
                .transition(getFadeInTopCountriesTransition())
                .call(function(g) {
                    g.select('rect.origin-bar')
                        .attr('x', function(d) { return axisX(d.country); })
                        .attr('width', axisX.bandwidth())
                        .attrTween('y', function(d) {
                            return tweenBarY(axisY(d.origin.yCount), d3.select(this));
                        })
                        .attrTween('height', function(d) {
                            return tweenBarHeight(axisY(d.origin.yCount), axisY(d.origin.bottomCount), d3.select(this));
                        })
                        .attr('transform', `translate(0, 0)`) // transition to position
                        .attr('opacity', GRAPH_BAR_OPACITY); // fade in
                    g.select('rect.dest-bar')
                        .attr('x', function(d) { return axisX(d.country); })
                        .attr('width', axisX.bandwidth())
                        .attrTween('y', function(d) {
                            return tweenBarY(axisY(d.dest.yCount), d3.select(this));
                        })
                        .attrTween('height', function(d) {
                            return tweenBarHeight(axisY(d.dest.yCount), axisY(d.dest.bottomCount), d3.select(this));
                        })
                        .attr('transform', `translate(0, 0)`) // transition to position
                        .attr('opacity', GRAPH_BAR_OPACITY); // fade in
                });
            
            // update graph's axis X
            const axisBottom = graphAxisBottom
                .transition(getFadeInTopCountriesTransition())
                .call(axisBottomGenerator)
                .call(function(g) {
                    // bottom text is rotated so that long country names don't overlap (not affected by transition)
                    g.selectAll('text')
                        .attr('dy', '0') // ensure that transform origin at top
                        .attr('transform', `translate(0, ${GRAPH_AXIS_FONT_SIZE/2}) rotate(-45)`) // rotate + move down half font size so not intersect axis
                        .attr('text-anchor', 'end') // anchor to end so end of text lines up with center of bar
                        .attr('font-size', GRAPH_AXIS_FONT_SIZE)
                        .attr('font-weight', 700);
                });
            
            // find the corresponding label of each new bar and fade it in (not affected by transition)
            newBars.each(function(d) {
                const newAxisXLabel = graphAxisBottom.selectAll('g.tick').filter(function(label) { return label === d.country; });
                newAxisXLabel
                    .attr('transform', `translate(${W}, 0)`) // start at right of SVG
                    .attr('opacity', 0); // start faded out
            });

            // wait until transitions finish
            return Promise.all([graphBars.end(), axisBottom.end()]);
        }

        // if distortion and stacked bars used simultaneously, show warning, otherwise hide
        if (options.axisYPowerScale !== 1 && options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
            distortedStackedBarsWarning.classList.remove('d-none');
        } else {
            distortedStackedBarsWarning.classList.add('d-none');
        }

        try {
            runAnimations(
                animationState,
                UPDATE_TOP_COUNTRIES_GRAPH_ANIMATION_ID,
                setup,
                [
                    fadeOutTopCountries,
                    transitionBarHeights,
                    fadeInTopCountries,
                ]
            );
        } catch (e) {
            console.error(e);
        }
    }
    animationState.animations[UPDATE_TOP_COUNTRIES_GRAPH_ANIMATION_ID] = updateTopCountriesGraph; // add animation to state

    updateTopCountriesGraphFocus = () => {
        // function returns true if the given country is present in the graph
        const containsFocusedCountry = ({ countryIndex, artworkCountType }) => {
            // if graph option and focus type are incompatible, always return false
            if (options.graphArtworkType === ARTWORK_COUNT_ENUM_ORIGIN && artworkCountType === ARTWORK_COUNT_ENUM_DEST) return false;
            if (options.graphArtworkType === ARTWORK_COUNT_ENUM_DEST && artworkCountType === ARTWORK_COUNT_ENUM_ORIGIN) return false;
            
            // if bar for this country exists, return true
            return !graphBarsContainer.selectAll('g')
                .filter(function(d) { return d.countryIndex === countryIndex })
                .empty();
        };

        // function transitions the opacities of the bars and displays detail text for the focused country
        const transitionFocusCountry = (focusCountryIndex, customOtherOpacity) => {
            const properties = data.artworkRegionCountryCenterPointsGeoJSONFeatures[focusCountryIndex].properties;
            // add country label to display
            focusCountryDisplay.append('tspan')
                .attr('fill', GRAPH_FOCUS_DISPLAY_COLOR)
                .text(`${properties.country}:`);
            // if origin bars shown, show details about originating artworks
            if (options.graphArtworkType === ARTWORK_COUNT_ENUM_ORIGIN || options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
                const originDisplayText = `${properties.filteredOriginArtworks.length} originating artworks`;
                focusCountryDisplay.append('tspan')
                    .attr('fill', TRAVEL_ORIGIN_COLOR)
                    .attr('dx', GRAPH_FOCUS_DISPLAY_TEXT_SPACING)
                    .text(originDisplayText);
            }
            // if dest bars shown, show details about displayed artworks
            if (options.graphArtworkType === ARTWORK_COUNT_ENUM_DEST || options.graphArtworkType === ARTWORK_COUNT_ENUM_BOTH) {
                const destDisplayText = `${properties.filteredDestArtworks.length} displayed artworks`;
                focusCountryDisplay.append('tspan')
                    .attr('fill', TRAVEL_DEST_COLOR)
                    .attr('dx', GRAPH_FOCUS_DISPLAY_TEXT_SPACING)
                    .text(destDisplayText);
            }
            // make other bars more transparent to draw emphasis
            return graphBarsContainer.selectAll('g')
                .transition(getFocusCountryTransition())
                .call(function(g) {
                    g.select('rect.origin-bar')
                        .attr('opacity', function(d) {
                            if (d.countryIndex === focusCountryIndex) {
                                return 1;
                            } else {
                                return customOtherOpacity ?? GRAPH_BAR_OPACITY;
                            }
                        });
                    g.select('rect.dest-bar')
                        .attr('opacity', function(d) {
                            if (d.countryIndex === focusCountryIndex) {
                                return 1;
                            } else {
                                return customOtherOpacity ?? GRAPH_BAR_OPACITY;
                            }
                        });
                })
                .end() // return promise until transition ends
        }

        const update = () => {
            // clear existing text in display
            focusCountryDisplay.selectAll('tspan').remove();

            // if country focused, populate focus display and fade other bars out
            if (focus.data?.type === FOCUS_ENUM_COUNTRY) {
                if (containsFocusedCountry(focus.data)) { // only focus if graph contains country
                    return transitionFocusCountry(focus.data.countryIndex, FOCUS_OTHER_OPACITY);
                }
            }

            // if focused on country details, populate focus display and make subtly more opaque
            if (focus.detail?.type === FOCUS_ENUM_COUNTRY) {
                if (containsFocusedCountry(focus.detail)) { // only focus if graph contains country
                    return transitionFocusCountry(focus.detail.countryIndex);
                }
            }

            // otherwise, reset opacity and leave display empty
            return graphBarsContainer.selectAll('g') // return bars back to default opacity
                .transition(getFocusCountryTransition())
                .call(function(g) {
                    g.select('rect.origin-bar').attr('opacity', GRAPH_BAR_OPACITY);
                    g.select('rect.dest-bar').attr('opacity', GRAPH_BAR_OPACITY);
                })
                .end(); // return promise until transition ends
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
    animationState.animations[UPDATE_FOCUS_ANIMATION_ID] = updateTopCountriesGraphFocus; // add animation to state

    //#endregion
}