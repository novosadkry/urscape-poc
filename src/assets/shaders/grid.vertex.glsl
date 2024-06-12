#version 300 es

precision highp int;
precision highp float;

uniform int u_CountX;
uniform int u_CountY;
uniform float u_OffsetX;
uniform float u_OffsetY;
uniform float u_Thickness;
uniform float u_CellHalfSize;

uniform mat4 u_Model;
uniform mat4 u_MVP;
uniform vec3 u_CameraPos;

uniform sampler2D u_Values;
uniform sampler2D u_Mask;

in vec4 a_pos;
in vec2 a_uv;

out vec2 v_uv;
out vec4 v_worldPos;
out vec4 v_constants;

void main() {
    float cellHalfSize = u_Model[0][0] / float(u_CountX + 1);
    float fresnel = clamp(1.9 * (0.97 - normalize(u_CameraPos).y), 0.0, 1.0) / cellHalfSize * 0.003;
    float feather = clamp(pow(0.004 / cellHalfSize, 2.0), 0.0, 1.0);

    vec4 pos = a_pos;
    pos.x += u_OffsetX / float(u_CountX);
    pos.y += u_OffsetY / float(u_CountY);

    v_uv = a_uv;
    v_worldPos = u_Model * pos;
    v_constants = vec4(clamp(1.0 - cellHalfSize * 50.0, 0.0, 1.0), length(u_CameraPos), fresnel, feather);

    gl_Position = u_MVP * pos;
}