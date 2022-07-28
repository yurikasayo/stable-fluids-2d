uniform sampler2D velocity;
uniform float dt;

vec4 calcColor(vec2 uv) {
    vec2 p = uv - dt * texture(velocity, uv).xy;

    vec4 color = texture(map, p);

    return color;
}