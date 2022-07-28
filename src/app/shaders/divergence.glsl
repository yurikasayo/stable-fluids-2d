vec4 calcColor(vec2 uv) {
    vec2 cell = 1.0 / resolution;

    float x0 = texture(map, uv - vec2(cell.x, 0.0)).x / (2.0 * cell.x);
    float x1 = texture(map, uv + vec2(cell.x, 0.0)).x / (2.0 * cell.x);
    float y0 = texture(map, uv - vec2(0.0, cell.y)).y / (2.0 * cell.y);
    float y1 = texture(map, uv + vec2(0.0, cell.y)).y / (2.0 * cell.y);

    float div = x1 - x0 + y1 - y0;
    
    return vec4(div, 0.0, 0.0, 0.0);
}