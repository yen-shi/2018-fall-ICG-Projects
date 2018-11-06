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
// directional light
uniform vec3 uDirectionalLight;
// point light
varying vec3 vSurfaceToPointLight;
varying vec3 N, L;
varying float lambertian, specular, shininessVal;

void main(void) {
    gl_FragColor = fragcolor;
    vec3 nNormal = normalize(normal);

    vec3 U = dFdx(surfaceWorldPosition);                     
    vec3 V = dFdy(surfaceWorldPosition);                 
    vec3 N1 = normalize(cross(U, V));
    
    // Mode 0: flat shading
    if (uShadingModeFrag == 0)
        nNormal = N1;

    vec3 surfaceToLightDirection = normalize(vSurfaceToPointLight);
    float directionalLight = dot(nNormal, uDirectionalLight);
    float pointLight = dot(nNormal, surfaceToLightDirection);
    float accumulateLight = min(directionalLight + pointLight, 1.0);

    // Mode 1: only light
    if (uShadingModeFrag == 0 || uShadingModeFrag == 3)
        gl_FragColor.rgb *= pointLight;

    float localSpecular = 0.0;
    if(lambertian > 0.0) {
        vec3 R = reflect(-L, nNormal);      // Reflected light vector
        vec3 V = normalize(vSurfaceToView); // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        localSpecular = pow(specAngle, shininessVal);
    }
    if (uShadingModeFrag == 2)
        gl_FragColor = vec4((0.8 * lambertian + localSpecular) * fragcolor.rgb, 1.0);        
}
`;