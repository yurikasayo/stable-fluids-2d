#version 300 es

precision highp float;
precision highp sampler2D;

#define TWO_PI 6.28318530718

in vec2 vUv2;

out vec4 outColor;

uniform sampler2D map;
uniform int colorMode;

//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

void main() {
    vec4 c = texture(map, vUv2);
    float angle;
    switch(colorMode) {
        case 0:
            c = vec4(vec3(length(c)), 1.0);
            break;
        case 1:
            c = vec4(vec3(1.0 - length(c)), 1.0);
            break;
        case 2:
            angle = atan(c.y, c.x);
            c = vec4(hsb2rgb(vec3(angle/TWO_PI, 1.0, length(c))), 1.0);
            break;
        case 3:
            angle = atan(c.y, c.x);
            c = vec4(hsb2rgb(vec3(angle/TWO_PI, length(c), 1.0)), 1.0);
            break;
        default:
            break;
    }
    outColor = c;
}