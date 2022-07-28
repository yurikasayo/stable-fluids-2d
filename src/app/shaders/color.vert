#version 300 es

in vec3 position;
in vec2 uv2;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv2;

void main() {
    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vUv2 = uv2;
}