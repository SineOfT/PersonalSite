const menuDisplayToggleBtn = document.querySelector(".menu-display-toggle-btn");
const oceanShadersDemoWasm = document.getElementById("ocean-shaders-demo-canvas");
const oceanShadersDemoRecording = document.getElementById("ocean-shaders-demo-recording");

function toggleDisplay() {
    if (menuDisplayToggleBtn.dataset.toggle === "wasm") {
        setToVideo()
    } else {
        setToWasm()
    }
}

function setToWasm() {
    menuDisplayToggleBtn.dataset.toggle = "wasm";
    oceanShadersDemoWasm.dataset.hidden = "false";
    oceanShadersDemoRecording.dataset.hidden = "true";
}

function setToVideo() {
    menuDisplayToggleBtn.dataset.toggle = "recording";
    oceanShadersDemoWasm.dataset.hidden = "true";
    oceanShadersDemoRecording.dataset.hidden = "false";
}

menuDisplayToggleBtn.addEventListener("click", toggleDisplay);