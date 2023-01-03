uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uAlpha;

varying float vElevation;

void main (){
    float mixStrength = vElevation * uColorMultiplier + uColorOffset;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    gl_FragColor = vec4(color, uAlpha);
}