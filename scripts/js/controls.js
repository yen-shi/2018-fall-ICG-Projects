function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

updateValue = (arr, idx) => (event, ui) => {
    arr[idx] = ui.value;
    drawScene();
};

function genOneSlider(objId, scales, valueArr, idx) {
    uiList.appendChild(createElementFromHTML(`<div id="${ objId }"></div>`));
    webglLessonsUI.setupSlider("#" + objId,
        { value: valueArr[idx],
            slide: updateValue(valueArr, idx),
            min: scales[0], max: scales[1],
            step: scales[2], precision: scales[3] });
}

let valueScales = {
    "Scale": [0.1, 30, 0.01, 2],
    "Rotation": [-180, 180, 1, 0],
    "Position": [-100, 100, 0.1, 2],
    "Color": [0, 1, 0.01, 2],
}

let uiList = document.getElementById("ui");

genOneSlider("ShadingMode", [0, 3, 1, 0], shadingMode, 0);
genOneSlider("RotationMode", [0, 3, 1, 0], rotationMode, 0);

["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("DirectionalLight" + type + axis, valueScales[type], dirLightPosition, idx);
});
["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("PointLight" + type + axis, valueScales[type], pointLightPosition, idx);
});
["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("PointOfView" + type + axis, valueScales[type], viewPosition, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("DirectionalLight" + type + axis, valueScales[type], dirLightColor, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("AmbientLight" + type + axis, valueScales[type], ambientLightColor, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("PointLight" + type + axis, valueScales[type], pointLightColor, idx);
});

filenames.concat(fileWithTextures).forEach((filename) => {
    ["Scale", "Rotation", "Position"].forEach((type, typeIdx) => {
        ["X", "Y", "Z"].forEach((axis, idx) => {
            genOneSlider(filename.slice(0, -5) + type + axis, valueScales[type], objTransform[filename][typeIdx], idx);
});});});
