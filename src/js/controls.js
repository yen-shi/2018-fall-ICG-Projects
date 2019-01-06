function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function setDisplayNone(dom) {
    dom.style.display = "none";
}

function setDisplayBlock(dom) {
    dom.style.display = "block";
}

updateValue = (arr, idx) => (event, ui) => {
    arr[idx] = ui.value;
    drawScene();
};

let lastShownList = [];
function getObj(classname) {
    let doms = document.getElementsByClassName(classname);
    for(let i = 0; i < lastShownList.length; i += 1) { setDisplayNone(lastShownList[i]); }
    lastShownList = [];
    for(let i = 0; i < doms.length; i += 1) { setDisplayBlock(doms[i]); lastShownList.push(doms[i]); }
}

function genOneSlider(objName, objId, scales, valueArr, idx) {
    let newDom = createElementFromHTML(`<div id="${ objId }" class="${ objName }"></div>`);
    setDisplayNone(newDom);
    uiList.appendChild(newDom);
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
    "Shear": [45, 135, 0.1, 2],
    "Color": [0, 1, 0.01, 2],
}

let uiList = document.getElementById("ui");

genOneSlider("ShadingMode", "ShadingMode", [0, 3, 1, 0], shadingMode, 0);
genOneSlider("RotationMode", "RotationMode", [0, 3, 1, 0], rotationMode, 0);

["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("DirectionalLight", "DirectionalLight" + type + axis, valueScales[type], dirLightPosition, idx);
});
["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("PointLight", "PointLight" + type + axis, valueScales[type], pointLightPosition, idx);
});
["X", "Y", "Z"].forEach((axis, idx) => {
    let type = "Position";
    genOneSlider("PointOfView", "PointOfView" + type + axis, valueScales[type], viewPosition, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("DirectionalLight", "DirectionalLight" + type + axis, valueScales[type], dirLightColor, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("AmbientLight", "AmbientLight" + type + axis, valueScales[type], ambientLightColor, idx);
});

["R", "G", "B"].forEach((axis, idx) => {
    let type = "Color";
    genOneSlider("PointLight", "PointLight" + type + axis, valueScales[type], pointLightColor, idx);
});

let createObjTags = () => {
    objects.forEach((obj) => {
        if (!obj.hasCreatedTag) {
            let objsList = document.getElementsByClassName('objs-list')[0];
            let objString = `
                <li>
                    <div class="obj-tag">
                        <div class="cross" onclick="removeObj('${ obj.objName }')"></div>
                        <a href="#" class="obj-button" onclick="getObj('${ obj.objName }')"> ${ obj.objName } </a>
                    </div>
                </li>`;
            let objDom = createElementFromHTML(objString);
            objsList.insertBefore(objDom, objsList.firstChild);

            ["Scale", "Rotation", "Position", "Shear"].forEach((type, typeIdx) => {
                ["X", "Y", "Z"].forEach((axis, idx) => {
                    genOneSlider(obj.objName, obj.objName + '-' + type + axis,
                                 valueScales[type], obj.transform[typeIdx], idx);
            });});
            obj.hasCreatedTag = true;
        }
    });
};

setInterval(createObjTags, 500);