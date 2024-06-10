#version 300 es
precision highp float;

in vec2 v_uv;

out vec4 fragColor;

void main() {
    vec2 uv = v_uv * 100.0;
    vec2 grid = fract(uv);

    float dist = distance(grid, vec2(0.5, 0.5));
    float opacity = 1.0 - smoothstep(0.0, 0.2, dist);

    fragColor = vec4(1.0, 1.0, 1.0, opacity);
}