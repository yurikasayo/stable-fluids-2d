uniform vec2 center;
uniform vec4 source;
uniform float dt;
uniform float mouseScale;

vec4 calcColor(vec2 uv) {
    vec2 d = uv - center;
    d.x *= resolution.x / resolution.y;
    float intencity = exp(-dot(d, d) / mouseScale);

    vec4 color = texture(map, uv);
    color += dt * source * intencity;

    return color;
}