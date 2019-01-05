const fragmentStr = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;

// varyings for vetex and fragment shaders
varying vec4 fragcolor;
varying vec3 surfaceWorldPosition;
varying vec3 normal;
varying vec3 vSurfaceToView;
uniform int uShadingModeFrag;

// uniform vec3 uLights;
// ambient light
uniform vec3 uAmbientLightColor;
// directional light
uniform vec3 uDirectionalLight;
uniform vec3 uDirectionalLightColor;
// point light
varying vec3 vSurfaceToPointLight;
varying vec3 vPointLightColor;
varying float shininessVal;
varying vec3 vGouraudLight;

void main(void) {
    gl_FragColor = fragcolor;
    vec3 nNormal = normalize(normal);
    
    // Mode 0: flat shading
    if (uShadingModeFrag == 0) {
        vec3 U = dFdx(surfaceWorldPosition);                     
        vec3 V = dFdy(surfaceWorldPosition);                 
        vec3 N1 = normalize(cross(U, V));
        nNormal = N1;
    }

    vec3 surfaceToLightDirection = normalize(vSurfaceToPointLight);
    vec3 directionalLight = max(dot(nNormal, uDirectionalLight), 0.0) * uDirectionalLightColor;
    vec3 pointLight = max(dot(nNormal, surfaceToLightDirection), 0.0) * vPointLightColor;

    // Mode 2: phong shading
    if (uShadingModeFrag == 2) {
        float specular = 0.0;
        vec3 L = normalize(vSurfaceToPointLight);
        float lambertian = max(dot(nNormal, L), 0.0);
        if(lambertian > 0.0) {
            vec3 R = reflect(-L, nNormal);      // Reflected light vector
            vec3 V = normalize(vSurfaceToView); // Vector to viewer
            // Compute the specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, shininessVal);
        }
        pointLight = (0.8 * lambertian + specular) * vPointLightColor;
    }

    vec3 accumulateLight = uAmbientLightColor + directionalLight;
    if (uShadingModeFrag == 1)
        accumulateLight += vGouraudLight;
    else
        accumulateLight += pointLight;
    accumulateLight = min(accumulateLight, vec3(1.0, 1.0, 1.0));
    gl_FragColor = vec4(accumulateLight * fragcolor.rgb, fragcolor.a);
}
`;