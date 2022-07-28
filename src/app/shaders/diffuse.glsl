uniform sampler2D map0;
uniform float viscosity;
uniform float dt;

vec4 calcColor(vec2 uv) {
    vec4 color = texture(map0, uv);

    vec2 cell = 1.0 / resolution;
    color += texture(map, uv + vec2(cell.x, 0.0)) * dt * viscosity / (cell.x * cell.x);
    color += texture(map, uv - vec2(cell.x, 0.0)) * dt * viscosity / (cell.x * cell.x);
    color += texture(map, uv + vec2(0.0, cell.y)) * dt * viscosity / (cell.y * cell.y);
    color += texture(map, uv - vec2(0.0, cell.y)) * dt * viscosity / (cell.y * cell.y);

    color /= 1.0 + dt * viscosity * 2.0 * (1.0 / (cell.x * cell.x) + 1.0 / (cell.y * cell.y));

    return color;
}