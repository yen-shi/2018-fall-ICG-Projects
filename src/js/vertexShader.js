const vertexStr = `
// object attributes
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aFrontColor;
attribute vec3 aNormal;

// shading mode
uniform int uShadingMode;

// environment attributes
uniform int uTextureMode;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform sampler2D uSampler;

// varyings for vetex and fragment shaders
varying vec4 fragcolor;
varying vec3 surfaceWorldPosition;
varying vec3 normal;
varying vec3 vSurfaceToView;

// view point
uniform vec3 uViewPosition;

// point light
uniform vec3 uPointLightPosition;
uniform vec3 uPointLightColor;
varying vec3 vSurfaceToPointLight;
varying vec3 vPointLightColor;
varying vec3 vGouraudLight;
varying float shininessVal;

void main(void) {
    surfaceWorldPosition = mat3(uMVMatrix) * aVertexPosition;
    vSurfaceToView = uViewPosition - surfaceWorldPosition;
    vSurfaceToPointLight = uPointLightPosition - surfaceWorldPosition;
    normal = mat3(uMVMatrix) * aNormal;
    shininessVal = 40.0;
    vPointLightColor = uPointLightColor;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    // has texture or not
    if (uTextureMode != 1)
        fragcolor = vec4(aFrontColor.rgb, 1.0);
    else {
        vec4 fragmentColor;
        fragcolor = texture2D(uSampler, vec2(aTextureCoord.s, aTextureCoord.t));
    }

    // Mode 2: gouraud shading
    if (uShadingMode == 1) {
        vec3 halfVector = normalize(vSurfaceToPointLight + vSurfaceToView);
        // float dist = length(vSurfaceToPointLight);
        // float att = (1.0 / (1.0 + (0.00005 * dist * dist)));

        vec3 N = normalize(normal);
        vec3 L = normalize(vSurfaceToPointLight);

        float lambertian = max(dot(N, L), 0.0);
        float specular = 0.0;
        if(lambertian > 0.0) {
            specular = max(dot(N, halfVector), 0.0);
            specular = pow(specular, shininessVal);
        }
        vGouraudLight = (0.8 * lambertian + specular) * vPointLightColor;
    }
}
`;