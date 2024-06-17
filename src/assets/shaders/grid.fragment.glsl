#version 300 es

precision highp int;
precision highp float;
precision highp sampler2D;

uniform ivec2 u_Count;
uniform float u_Thickness;
uniform float u_CellHalfSize;

uniform vec3 u_Camera;

uniform sampler2D u_Values;
uniform sampler2D u_Mask;

uniform vec4 u_Tint;

in vec2 v_UV;
in vec4 v_WorldPos;
in vec4 v_Constants;

out vec4 fragColor;

float GetCellOpacity(vec2 coords, vec4 constants, float distCamToPixel) {
    // float satDist = clamp((distCamToPixel - constants.y) * constants.z, 0.0, 1.0);
    // float halfSize = mix(u_CellHalfSize, 0.5, clamp(constants.x + satDist, 0.0, 1.0));
    // float feather = clamp(constants.w + satDist, 0.02, 1.0);

    float halfSize = 0.25;
    float feather = 0.1;

    float cellX = fract(coords.x * float(u_Count.x)) - 0.5;
    float cellY = fract(coords.y * float(u_Count.y)) - 0.5;

	float cellMin = pow(halfSize + feather, 2.0) + 0.0001;
	float cellMax = halfSize * halfSize;

	return smoothstep(cellMin, cellMax, cellX*cellX + cellY*cellY);
}

void main() {
    int index = int(floor(v_UV.x * float(u_Count.x))) + int(floor(v_UV.y * float(u_Count.y))) * u_Count.x;
    vec4 value = texture(u_Values, v_UV);

    vec4 color = u_Tint;
    color.a = value.r;

    // Get the pixel opacity for the current cell
    float distCamToPixel = distance(v_WorldPos, vec4(u_Camera, 1.0));
    float cellOpacity = GetCellOpacity(v_UV, v_Constants, distCamToPixel);

    color.a *= cellOpacity;
    fragColor = clamp(color, 0.0, 1.0);
}
