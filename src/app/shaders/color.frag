#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 vUv2;

out vec4 outColor;

uniform sampler2D map;

void main() {
    outColor = texture(map, vUv2);
}