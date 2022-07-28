uniform sampler2D pressure;
uniform float rho;
uniform float dt;

vec4 calcColor(vec2 uv) {
    vec4 color = texture(map, uv);

    vec2 cell = 1.0 / resolution;
    float x0 = texture(pressure, uv - vec2(cell.x, 0.0)).x / (2.0 * cell.x);
    float x1 = texture(pressure, uv + vec2(cell.x, 0.0)).x / (2.0 * cell.x);
    float y0 = texture(pressure, uv - vec2(0.0, cell.y)).x / (2.0 * cell.y);
    float y1 = texture(pressure, uv + vec2(0.0, cell.y)).x / (2.0 * cell.y);
    
    color.xy -= dt / rho * vec2(x1 - x0, y1 - y0);

    return color;
}