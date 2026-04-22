import { throttleAction } from './utils.js';
import { updateOptions } from './map.js';
import { APPEND_TYPE_ENUM_ADDITIVE, APPEND_TYPE_ENUM_REPLACE, APPEND_TYPE_ENUM_SUBTRACTIVE } from './enums.js';

//////////////////////
//#region CONSTANTS //
//////////////////////

const MOUSE_FOCUS_FISHEYE_RADIUS_SCALE = d3.scaleLinear()
    .domain([0, 100])
    .range([50, 200]);
const MOUSE_FOCUS_FISHEYE_DISTORTION_SCALE = d3.scaleLinear()
    .domain([0, 100])
    .range([1, 30]);

const MOUSE_FOCUS_FISHEYE_RANGE_THROTTLE_MS = 100;

//#endregion

document.addEventListener('DOMContentLoaded', function() {

    /////////////////////////
    //#region DOM ELEMENTS //
    /////////////////////////

    const geoProjectionSwitch = document.getElementById('geoProjectionSwitch');
    const hightlightOnHoverSwitch = document.getElementById('highlightOnHoverSwitch');
    const fisheyeEnableSwitch = document.getElementById('fisheyeEnableSwitch');
    const fisheyeRadiusRange = document.getElementById('fisheyeRadiusRange');
    const fisheyeDistortionRange = document.getElementById('fisheyeDistortionRange');
    const lassoEnableSwitch = document.getElementById('lassoEnableSwitch');
    const lassoAppendTypesRadio = [...document.querySelectorAll('[name="lassoAppendType"]')];
    const lassoAppendTypeDescription = document.getElementById('lassoAppendTypeDescription');

    // function converts the lasso append type radio selection to an append type enum value
    const getSelectedLassoAppendType = () => {
        const selectedLassoAppendTypeRadio = lassoAppendTypesRadio.find(radio => radio.checked);
        const selectedLassoAppendTypeValue = selectedLassoAppendTypeRadio?.value;
        if (selectedLassoAppendTypeValue === 'replace') return APPEND_TYPE_ENUM_REPLACE;
        if (selectedLassoAppendTypeValue === 'additive') return APPEND_TYPE_ENUM_ADDITIVE;
        if (selectedLassoAppendTypeValue === 'subtractive') return APPEND_TYPE_ENUM_SUBTRACTIVE;
        return APPEND_TYPE_ENUM_REPLACE; // fallback to default if none selected
    }
    // function gets the description for the given append type
    const getAppendTypeDescription = (appendType) => {
        if (appendType === APPEND_TYPE_ENUM_REPLACE) {
            return 'Replace any current selections with the new lasso selection';
        }
        if (appendType === APPEND_TYPE_ENUM_ADDITIVE) {
            return 'Add the new lasso selection to any existing selections';
        }
        if (appendType === APPEND_TYPE_ENUM_SUBTRACTIVE) {
            return 'Remove the new lasso selection from any existing selections';
        }
    }

    //#endregion

    ///////////////////////////
    //#region INITIALIZATION //
    ///////////////////////////

    updateOptions({
        isMapProjectionAzimuthal: geoProjectionSwitch.checked,
        isHighlightOnHover: hightlightOnHoverSwitch.checked,
        isMouseFocusFisheyeEnabled: fisheyeEnableSwitch.checked,
        mouseFocusFisheyeRadius: MOUSE_FOCUS_FISHEYE_RADIUS_SCALE(fisheyeRadiusRange.value),
        mouseFocusFisheyeDistortion: MOUSE_FOCUS_FISHEYE_DISTORTION_SCALE(fisheyeDistortionRange.value),
        lassoAppendType: getSelectedLassoAppendType(),
    }, false); // on startup, so do not update map projection

    // initialize tooltips
    for (const tooltip of document.querySelectorAll('.info-tooltip')) {
        new bootstrap.Tooltip(tooltip);
    }

    //#endregion

    ////////////////////////
    //#region INTERACTION //
    ////////////////////////

    // geo projection type switch event
    geoProjectionSwitch.addEventListener('click', function() {
        // update projection type based on switch state
        updateOptions({
            isMapProjectionAzimuthal: this.checked,
        });
    });

    // highlight the travel lines when hovering on the map
    hightlightOnHoverSwitch.addEventListener('click', function() {
        // update whether will highlight on hover based on switch state
        updateOptions({
            isHighlightOnHover: this.checked,
        }, false); // does not need to rerender, since no projection change
    })

    // fisheye enable/disable input event
    fisheyeEnableSwitch.addEventListener('click', function() {
        // update projection based on fisheye enabled or disabled
        updateOptions({
            isMouseFocusFisheyeEnabled: this.checked,
        });
    });

    // fisheye radius input event
    fisheyeRadiusRange.addEventListener('input', throttleAction((e) => {
        updateOptions({
            mouseFocusFisheyeRadius: MOUSE_FOCUS_FISHEYE_RADIUS_SCALE(e.target.value),
        });
    }, MOUSE_FOCUS_FISHEYE_RANGE_THROTTLE_MS));

    // fisheye distortion input event
    fisheyeDistortionRange.addEventListener('input', throttleAction((e) => {
        updateOptions({
            mouseFocusFisheyeDistortion: MOUSE_FOCUS_FISHEYE_DISTORTION_SCALE(e.target.value),
        });
    }, MOUSE_FOCUS_FISHEYE_RANGE_THROTTLE_MS));

    // lasso enable/disable input event
    lassoEnableSwitch.addEventListener('click', function() {
        // update projection based on lasso enabled or disabled
        updateOptions({
            lassoAppendType: this.checked ? getSelectedLassoAppendType() : null,
        }, false); // does not need to rerender, since no projection change
    });

    // lasso append type change event
    lassoAppendTypesRadio.forEach((radio, i) => {
        radio.addEventListener('change', function() {
            const lassoAppendType = getSelectedLassoAppendType();
            updateOptions({ lassoAppendType }, false); // does not need to rerender, since no projection change
            lassoAppendTypeDescription.textContent = getAppendTypeDescription(lassoAppendType); // update description
        });
    });
    
    // update description on startup
    lassoAppendTypeDescription.textContent = getAppendTypeDescription(getSelectedLassoAppendType());

    //#endregion

}, { once: true });