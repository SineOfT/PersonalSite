document.addEventListener('DOMContentLoaded', function() {

    /////////////////////////
    //#region DOM ELEMENTS //
    /////////////////////////

    // sidiebar on left that shows supplementary visualizations
    const visualizationsSidebarResizer = document.getElementById('visualizationsSidebarResizer');
    const visualizationsSidebar = document.getElementById('visualizationsSidebar');

    // sidebar on right that shows artworks in focused country
    const artworksFocusSidebarResizer = document.getElementById('artworksFocusSidebarResizer');
    const artworksFocusSidebar = document.getElementById('artworksFocusSidebar');

    // header on top that shows filters
    const filtersHeaderResizer = document.getElementById('filtersHeaderResizer');
    const filtersHeader = document.getElementById('filtersHeader');

    // footer on bottom that shows controls
    const controlsFooterResizer = document.getElementById('controlsFooterResizer');
    const controlsFooter = document.getElementById('controlsFooter');

    //#endregion

    ////////////////////////
    //#region INTERACTION //
    ////////////////////////

    // allow resizing on drag
    function resizeOnDrag(resizer, section, getSize) {
        let isDragging = false;
        resizer.addEventListener('mousedown', function() {
            isDragging = true;
        });
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const size = getSize(e);
                section.style.flexBasis = `${size}px`;
            }
        });
    }

    resizeOnDrag(visualizationsSidebarResizer, visualizationsSidebar,
        e => e.x);

    resizeOnDrag(artworksFocusSidebarResizer, artworksFocusSidebar,
        e => document.body.offsetWidth - e.x);

    resizeOnDrag(filtersHeaderResizer, filtersHeader,
        e => e.y);

    resizeOnDrag(controlsFooterResizer, controlsFooter,
        e => document.body.offsetHeight - e.y);

    //#endregion

}, { once: true });