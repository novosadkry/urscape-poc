#version 300 es
precision highp float;

uniform vec3 u_color;

in vec2 v_uv;

out vec4 fragColor;

void main() {
    vec2 uv = v_uv * 10.0;
    vec2 grid = fract(uv);

    float dist = distance(grid, vec2(0.5, 0.5));
    float opacity = 1.0 - step(0.2, dist);

    fragColor = vec4(u_color, opacity);
}