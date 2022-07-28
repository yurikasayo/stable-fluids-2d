uniform sampler2D divergence;
uniform float rho;
uniform float dt;

vec4 calcColor(vec2 uv) {
    float p = -texture(divergence, uv).x * rho / dt;
    
    vec2 cell = 1.0 / resolution;
    p += texture(map, uv + vec2(cell.x, 0.0)).x / (cell.x * cell.x);
    p += texture(map, uv - vec2(cell.x, 0.0)).x / (cell.x * cell.x);
    p += texture(map, uv + vec2(0.0, cell.y)).x / (cell.y * cell.y);
    p += texture(map, uv - vec2(0.0, cell.y)).x / (cell.y * cell.y);

    p /= 2.0 * (1.0 / (cell.x * cell.x) + 1.0 / (cell.y * cell.y));

    vec4 color = vec4(p, 0.0, 0.0, 0.0);

    return color;
}