#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 vUv2;

out vec4 outColor;

uniform sampler2D map;

void main() {
    // outColor = vec4(texture(map, vUv2).rgb, 1.0);
    outColor = vec4(vec3(length(texture(map, vUv2).xy)), 1.0);
}