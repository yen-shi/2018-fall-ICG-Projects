var gl, shaderProgram;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
    if (!gl.getExtension('OES_standard_derivatives')) {
        throw 'extension not support';
    }
}

function resizeCanvas() {
    let realToCSSPixels = window.devicePixelRatio || 1;
    let displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    let displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {

        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
    }
}

function getShader(str, type) {
    let shader;
    if (type == "fragment")
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function initShaders() {
    var fragmentShader = getShader(fragmentStr, "fragment");
    var vertexShader = getShader(vertexStr, "vertex");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexFrontColorAttribute = gl.getAttribLocation(shaderProgram, "aFrontColor");
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.directionalLight = gl.getUniformLocation(shaderProgram, "uDirectionalLight");
    shaderProgram.pointLight = gl.getUniformLocation(shaderProgram, "uPointLightPosition");
    shaderProgram.pointLightColor = gl.getUniformLocation(shaderProgram, "uPointLightColor");
    shaderProgram.viewPosition = gl.getUniformLocation(shaderProgram, "uViewPosition");

    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.textureMode = gl.getUniformLocation(shaderProgram, "uTextureMode");
    shaderProgram.shadingMode = gl.getUniformLocation(shaderProgram, "uShadingMode");
    shaderProgram.shadingModeFrag = gl.getUniformLocation(shaderProgram, "uShadingModeFrag");
}