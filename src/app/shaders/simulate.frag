#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 vUv2;

out vec4 outColor;

uniform sampler2D map;
uniform vec2 resolution;

vec4 calcColor(vec2 uv);

void main() {
    outColor = calcColor(vUv2);
}