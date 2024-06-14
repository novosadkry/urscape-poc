#version 300 es

precision highp int;
precision highp float;
precision highp sampler2D;

uniform ivec2 u_Count;
uniform vec2 u_Offset;
uniform float u_Thickness;
uniform float u_CellHalfSize;

uniform mat4 u_Model;
uniform mat4 u_MVP;

uniform vec3 u_CameraHigh;
uniform vec3 u_CameraLow;

uniform sampler2D u_Values;
uniform sampler2D u_Mask;

in vec3 a_Pos;
in vec2 a_UV;

out vec2 v_UV;
out vec4 v_WorldPos;
out vec4 v_Constants;

void main() {
    // Translates position to be relative to camera
    vec4 pos = vec4(a_Pos - u_CameraHigh - u_CameraLow, 1.0);

    pos.x += u_Offset.x / float(u_Count.x);
    pos.y += u_Offset.y / float(u_Count.y);

    // float cellHalfSize = u_Model[0][0] / float(u_Count.x + 1);
    // float fresnel = clamp(1.9 * (0.97 - normalize(u_CameraPos).y), 0.0, 1.0) / cellHalfSize * 0.003;
    // float feather = clamp(pow(0.004 / cellHalfSize, 2.0), 0.0, 1.0);

    v_UV = a_UV;
    v_WorldPos = u_Model * pos;
    // v_Constants = vec4(clamp(1.0 - cellHalfSize * 50.0, 0.0, 1.0), length(u_CameraPos), fresnel, feather);

    gl_Position = u_MVP * pos;
}