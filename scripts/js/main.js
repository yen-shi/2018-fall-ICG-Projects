var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var dirLightPosition = [-5, 8, 8];
var pointLightPosition = [60, 60, 60];
var viewPosition = [60, 60, 60];

var ambientLightColor = [0.2, 0.2, 0.2];
var dirLightColor = [0.2, 0.2, 0.2];
var pointLightColor = [0.6, 0.6, 0.6];
var textureMode = [0], shadingMode = [0], rotationMode = [0];

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniform3fv(shaderProgram.directionalLight, m4.normalize(dirLightPosition));
    gl.uniform3fv(shaderProgram.directionalLightColor, dirLightColor);
    gl.uniform3fv(shaderProgram.pointLight, pointLightPosition);
    gl.uniform3fv(shaderProgram.pointLightColor, pointLightColor);
    gl.uniform3fv(shaderProgram.ambientLightColor, ambientLightColor);
    gl.uniform3fv(shaderProgram.viewPosition, viewPosition);
    gl.uniform1i(shaderProgram.textureMode, textureMode[0]);
    gl.uniform1i(shaderProgram.shadingMode, shadingMode[0]);
    gl.uniform1i(shaderProgram.shadingModeFrag, shadingMode[0]);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

class Model3D {
    constructor(hasTexture = false) {
        this.hasTexture = hasTexture;
        this.vertexPositionBuffer = gl.createBuffer();
        this.vertexNormalBuffer = gl.createBuffer();
        if (this.hasTexture) {
            this.vertexTextureCoordBuffer = gl.createBuffer();
            this.vertexIndexBuffer = gl.createBuffer();
        }
        else {
            this.vertexFrontColorBuffer = gl.createBuffer();
            this.vertexBackColorBuffer = gl.createBuffer();
        }
    }
}

var filenames = ["Csie.json", "Teapot.json", "Plant.json"];
var fileWithTextures = ["Teapot_Origin.json"];
var objects = {}
var objTransform = {
    // Scale, Rotation, Position
    "Csie.json": [
        [20, 20, 20],
        [-90, 0, 0],
        [-1.6, -0.35, -0.30]
    ],
    "Teapot.json": [
        [30, 30, 30],
        [-90, 0, 0],
        [0.81, 0.2, -1.04]
    ],
    "Plant.json": [
        [20, 20, 20],
        [-90, 0, 0],
        [1.5, -0.5, -0.35]
    ],
    "Teapot_Origin.json": [
        [1, 1, 1],
        [0, -90, 0],
        [0, 0, 0]
    ],
}

function setPositions() {
    filenames.concat(fileWithTextures).forEach((filename) => {
        if (filename in objects) {
            let curMatrix = objects[filename].matrix;
            mat4.identity(curMatrix);
            mat4.scale(curMatrix, objTransform[filename][0]);
            mat4.rotateX(curMatrix, degToRad(objTransform[filename][1][0]));
            mat4.rotateY(curMatrix, degToRad(objTransform[filename][1][1]));
            mat4.rotateZ(curMatrix, degToRad(objTransform[filename][1][2]));
            mat4.translate(curMatrix, objTransform[filename][2]);
        }
    });
}

function handleLoadedObject(data, hasTexture) {
    let object = new Model3D(hasTexture);
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexNormals), gl.STATIC_DRAW);
    object.vertexNormalBuffer.itemSize = 3;
    object.vertexNormalBuffer.numItems = data.vertexNormals.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexPositions), gl.STATIC_DRAW);
    object.vertexPositionBuffer.itemSize = 3;
    object.vertexPositionBuffer.numItems = data.vertexPositions.length / 3;

    if (hasTexture) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexTextureCoords), gl.STATIC_DRAW);
        object.vertexTextureCoordBuffer.itemSize = 2;
        object.vertexTextureCoordBuffer.numItems = data.vertexTextureCoords.length / 2;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);
        object.vertexIndexBuffer.itemSize = 1;
        object.vertexIndexBuffer.numItems = data.indices.length;
    }
    else {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexFrontColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexFrontcolors), gl.STATIC_DRAW);
        object.vertexFrontColorBuffer.itemSize = 3;
        object.vertexFrontColorBuffer.numItems = data.vertexFrontcolors.length / 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBackColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexBackcolors), gl.STATIC_DRAW);
        object.vertexBackColorBuffer.itemSize = 3;
        object.vertexBackColorBuffer.numItems = data.vertexBackcolors.length / 3;
    }
    return object;
}

// Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob)
//     console.log("Great success! All the File APIs are supported.");
// else
//     alert("the file apis are not fully supported in this browser.");

// let reader = new FileReader();
// reader.onload = (function(theFile) {
//     return function(e) {
//         console.log("Read file ", escape(theFile.name), " done");
//         var lines = e.target.result.split(
//             /[\r\n]+/g);  // tolerate both Windows and Unix linebreaks
//         console.log("READ", lines[0]);
//     };
// })(filename);

// reader.readAsText(filename);

function loadObject(filename, hasTexture) {
    var request = new XMLHttpRequest();
    request.open("GET", filename);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            let obj = handleLoadedObject(JSON.parse(request.responseText), hasTexture);
            obj.matrix = mat4.create();
            objects[filename] = obj
        }
    }
    request.overrideMimeType("application/json");
    request.send();
}

function loadObjects() {
    let tmpMatrix = mat4.create();
    filenames.forEach((filename) => { loadObject(filename); });
    fileWithTextures.forEach((filename) => { loadObject(filename, true); });
}

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexTextureCoordBuffer;
var teapotVertexIndexBuffer;

function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var galvanizedTexture;

function initTextures() {
    galvanizedTexture = gl.createTexture();
    galvanizedTexture.image = new Image();
    galvanizedTexture.image.onload = function () {
        handleLoadedTexture(galvanizedTexture)
    }
    galvanizedTexture.image.src = "galvanizedTexture.jpg";
    galvanizedTexture.image.src = "red.jpg";
}

// Compute a matrix for the camera
var cameraMatrix = mat4.create();
var teapotAngle = 0;

function bindVertexAndNormal(obj) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

function drawScene() {
    resizeCanvas();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    mat4.perspective(45, aspect, 0.1, 100.0, pMatrix);

    mat4.identity(cameraMatrix);
    if (rotationMode[0] == 1)
        mat4.rotateY(cameraMatrix, degToRad(teapotAngle));
    if (rotationMode[0] == 2)
        mat4.rotateX(cameraMatrix, degToRad(teapotAngle));
    if (rotationMode[0] == 3)
        mat4.rotateZ(cameraMatrix, degToRad(teapotAngle));
    mat4.translate(cameraMatrix, [0, 0, 50]);
    mat4.inverse(cameraMatrix, cameraMatrix);
    mat4.multiply(pMatrix, cameraMatrix, pMatrix);

    setPositions();
    textureMode[0] = 0;
    gl.enableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);
    filenames.forEach((filename) => {
        if (filename in objects) {
            let obj = objects[filename];
            mat4.set(obj.matrix, mvMatrix);
            setMatrixUniforms();
            bindVertexAndNormal(obj);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexFrontColorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute, obj.vertexFrontColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertexPositionBuffer.numItems);
        }
    });
    gl.disableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);

    textureMode[0] = 1;
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    fileWithTextures.forEach((filename) => {
        if (filename in objects) {
            let obj = objects[filename];
            mat4.set(obj.matrix, mvMatrix);
            setMatrixUniforms();
            bindVertexAndNormal(obj);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
            gl.uniform1i(shaderProgram.samplerUniform, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexTextureCoordBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vertexIndexBuffer);
            gl.drawElements(gl.TRIANGLES, obj.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    });
    gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
}

var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        teapotAngle += 0.03 * elapsed;
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    let canvas = document.getElementById("ICG-canvas");
    initGL(canvas);
    initShaders();
    initTextures();
    loadObjects();

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}