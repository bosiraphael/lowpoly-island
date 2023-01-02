uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uAlpha;

uniform samplerCube cubeMap;
uniform sampler2D tReflection;
uniform sampler2D tRefraction;
uniform sampler2D tDisplacement;
uniform float fReflectionFactor;
uniform float fRefractionFactor;
uniform float fDisplacementFactor;

varying vec3 vReflect;
varying vec3 vRefract[3];

varying float vElevation;


void main (){
    float mixStrength = vElevation * uColorMultiplier + uColorOffset;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // vec4 reflectedColor = textureCube(cubeMap, vReflect);
    // vec4 refractedColor = mix(texture2D(tRefraction, vec2(gl_FragCoord.x / 512.0, gl_FragCoord.y / 512.0)), texture2D(tRefraction, vec2(gl_FragCoord.x / 512.0, gl_FragCoord.y / 512.0)), fRefractionFactor);
    // vec4 finalColor = mix(reflectedColor, refractedColor, fReflectionFactor);

    // vec4 displacementColor = texture2D(tDisplacement, vec2(gl_FragCoord.x / 512.0, gl_FragCoord.y / 512.0));
    // finalColor = mix(finalColor, color, 1.0);


    gl_FragColor = vec4(color, uAlpha);
}