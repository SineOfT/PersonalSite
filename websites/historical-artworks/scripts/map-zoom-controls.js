//////////////////////
//#region CONSTANTS //
//////////////////////

// zoom display
const ZOOM_DISPLAY_W = 100;
const ZOOM_DISPLAY_H = 100;

const ZOOM_DISPLAY_BG_COLOR = '#0002';
const ZOOM_DISPLAY_BG_BORDER_COLOR = '#FFF';
const ZOOM_DISPLAY_BG_BORDER_WIDTH = 1;

const ZOOM_DISPLAY_MAG_COLOR = '#FFF9';
const ZOOM_DISPLAY_MAG_BORDER_COLOR = '#000';
const ZOOM_DISPLAY_MAG_BORDER_WIDTH = 1;

// zoom controls
const ZOOM_STEP = 0.05;
// use a high power of zoom so that size grows polynomially, since want large size on large zoom
const ZOOM_TO_SVG_SIZE_SCALE = (zoom) => zoom*zoom*zoom*zoom*zoom * 1000;

//#endregion

document.addEventListener('DOMContentLoaded', function() {

    /////////////////////////
    //#region DOM ELEMENTS //
    /////////////////////////

    const mapScroll = document.getElementById('mapScroll');
    const mapSVG = document.getElementById('mapSVG');
    const mapZoomDisplay = document.getElementById('mapZoomDisplay');
    const mapZoomInBtn = document.getElementById('mapZoomInBtn');
    const mapZoomOutBtn = document.getElementById('mapZoomOutBtn');

    //#endregion

    //////////////////////
    //#region VARIABLES //
    //////////////////////

    let zoom = 1;

    //#endregion
    
    ///////////////////////
    //#region INITIATION //
    ///////////////////////

    // scale units of zoom display SVG
    const mapZoomDisplaySVG = d3.select(mapZoomDisplay)
        .attr('viewBox', `0 0 ${ZOOM_DISPLAY_W} ${ZOOM_DISPLAY_H}`);

    // add border to display
    mapZoomDisplay.style.borderStyle = 'solid';
    mapZoomDisplay.style.borderColor = ZOOM_DISPLAY_BG_BORDER_COLOR;
    mapZoomDisplay.style.borderWidth = ZOOM_DISPLAY_BG_BORDER_WIDTH;

    // add background to display
    mapZoomDisplaySVG.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', ZOOM_DISPLAY_W)
        .attr('height', ZOOM_DISPLAY_H)
        .attr('fill', ZOOM_DISPLAY_BG_COLOR)
        .attr('stroke', ZOOM_DISPLAY_MAG_BORDER_COLOR)
        .attr('stroke-width', ZOOM_DISPLAY_MAG_BORDER_WIDTH * 2);

    // create element for rect
    const mapZoomDisplayMag = mapZoomDisplaySVG.append('rect')
        .attr('fill', ZOOM_DISPLAY_MAG_COLOR)
        .attr('stroke', ZOOM_DISPLAY_MAG_BORDER_COLOR)
        .attr('stroke-width', ZOOM_DISPLAY_MAG_BORDER_WIDTH);

    //#endregion

    ////////////////////////
    //#region INTERACTION //
    ////////////////////////

    // function updates the zoom display based on the current zoom size and the scroll position
    function updateZoomDisplay() {
        // store width of map
        const mapWidth  = mapSVG.clientWidth;
        const mapHeight = mapSVG.clientHeight;
        // if map dimensions 0, avoid division by 0 by taking up entire screen
        if (mapWidth === 0 || mapHeight === 0) {
            mapZoomDisplayMag
                .attr('x', -ZOOM_DISPLAY_MAG_BORDER_WIDTH) // account for border width + double for safety
                .attr('y', -ZOOM_DISPLAY_MAG_BORDER_WIDTH)
                .attr('width', ZOOM_DISPLAY_W + ZOOM_DISPLAY_MAG_BORDER_WIDTH*2)
                .attr('height', ZOOM_DISPLAY_H + ZOOM_DISPLAY_MAG_BORDER_WIDTH*2);
            return;
        }
        // store width of visible area
        const visibleWidth = mapScroll.clientWidth;
        const visibleHeight = mapScroll.clientHeight;
        // scale positions to be in the same units as zoom display SVG
        const magWidth  = visibleWidth  / mapWidth  * ZOOM_DISPLAY_W;
        const magHeight = visibleHeight / mapHeight * ZOOM_DISPLAY_H;
        // determine position of scroll
        const magX = mapScroll.scrollLeft / mapWidth  * ZOOM_DISPLAY_W;
        const magY = mapScroll.scrollTop  / mapHeight * ZOOM_DISPLAY_H;
        // update zoom display mag
        mapZoomDisplayMag
            .attr('x', magX)
            .attr('y', magY)
            .attr('width', magWidth)
            .attr('height', magHeight);
    }

    // function takes a new zoom value and updates the map to reflect this, ensuring scrolling remains consistent
    function updateZoom(newZoom) {
        // store width of container to use in scroll calculations
        const containerWidth  = mapScroll.clientWidth;
        const containerHeight = mapScroll.clientHeight;

        // determine current scroll position and zoom
        const scrollTop = mapScroll.scrollTop;
        const scrollLeft = mapScroll.scrollLeft;
        const prevSize = ZOOM_TO_SVG_SIZE_SCALE(zoom);
        const prevScrollCenterX = (scrollLeft + containerWidth /2) / prevSize; // consider container size to center
        const prevScrollCenterY = (scrollTop  + containerHeight/2) / prevSize;

        // update zoom variable
        zoom = newZoom;

        // set SVG size to new size
        const newSize = ZOOM_TO_SVG_SIZE_SCALE(zoom);
        mapSVG.setAttribute('width', newSize);
        mapSVG.setAttribute('height', newSize);
        // calculate new scroll position
        const newScrollCenterX = prevScrollCenterX * newSize - containerWidth /2;
        const newScrollCenterY = prevScrollCenterY * newSize - containerHeight/2;
        mapScroll.scrollLeft = newScrollCenterX;
        mapScroll.scrollTop  = newScrollCenterY;

        // update zoom display to match new zoom scale
        updateZoomDisplay();
    }

    updateZoom(zoom); // update zoom on startup
    mapSVG.scrollIntoView({ // ensure that scroll starts at center (around Europe)
        block: 'center',
        inline: 'center',
    });

    // when map scroll position changes, update zoom display
    mapScroll.addEventListener('scroll', updateZoomDisplay);
    // when window size changes, update zoom display
    window.addEventListener('resize', updateZoomDisplay);

    // when resizer bar dragging to change display size of map, update zoom display
    let isResizing = false;
    for (const barResizer of document.getElementsByClassName('bar-resizer')) {
        barResizer.addEventListener('mousedown', function() { isResizing = true; });
    }
    window.addEventListener('mousemove', function() { if (isResizing) { updateZoomDisplay(); } });
    window.addEventListener('mouseup', function() { isResizing = false; });

    // when map zoom buttons clicked, update zoom value
    mapZoomInBtn.addEventListener('click', function() {
        updateZoom(zoom + ZOOM_STEP);
    });
    mapZoomOutBtn.addEventListener('click', function() {
        updateZoom(Math.max(zoom - ZOOM_STEP, 0)); // do not allow zoom less than 0
    });

    //#endregion

}, { once: true });