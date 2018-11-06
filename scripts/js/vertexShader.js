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
varying vec3 N, L;
varying float lambertian, specular, shininessVal;

void main(void) {
    surfaceWorldPosition = mat3(uMVMatrix) * aVertexPosition;
    vSurfaceToView = uViewPosition - surfaceWorldPosition;
    vSurfaceToPointLight = uPointLightPosition - surfaceWorldPosition;
    vec3 halfVector = normalize(vSurfaceToPointLight + vSurfaceToView);

    float dist = length(vSurfaceToPointLight);
    float att = (1.0 / (1.0 + (0.00005 * dist * dist)));

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    normal = mat3(uMVMatrix) * aNormal;

    N = normalize(normal);
    L = normalize(vSurfaceToPointLight);

    lambertian = max(dot(N, L), 0.0);
    shininessVal = 40.0;

    specular = 0.0;
    if(lambertian > 0.0) {
        specular = dot(N, halfVector);
        specular = pow(specular, shininessVal);
    }

    if (uTextureMode != 1) {
        fragcolor = vec4(aFrontColor.rgb, 1.0);
    }
    else {
        vec4 fragmentColor;
        fragmentColor = texture2D(uSampler, vec2(aTextureCoord.s, aTextureCoord.t));
        fragcolor = vec4(fragmentColor.rgb, fragmentColor.a);;
    }

    if (uShadingMode == 1)
        fragcolor = vec4((0.8 * lambertian + specular) * fragcolor.rgb, 1.0);
}
`;