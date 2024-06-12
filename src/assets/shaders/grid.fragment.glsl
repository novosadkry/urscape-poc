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

uniform vec4 u_Tint;

in vec2 v_uv;
in vec4 v_worldPos;
in vec4 v_constants;

out vec4 fragColor;

float GetCellOpacity(vec2 coords, vec4 constants, float distCamToPixel) {
    float satDist = clamp((distCamToPixel - constants.y) * constants.z, 0.0, 1.0);
	float halfSize = mix(u_CellHalfSize, 0.5, clamp(constants.x + satDist, 0.0, 1.0));
	float feather = clamp(constants.w + satDist, 0.02, 1.0);

	float cellX = floor(coords.x * float(u_CountX)) - 0.5; // ???
	float cellY = floor(coords.y * float(u_CountY)) - 0.5; // ???

    // Square shape
    float cellMin = halfSize + feather + 0.0001;
	float cellMax = halfSize;
	return smoothstep(cellMin, cellMax, abs(cellX)) * smoothstep(cellMin, cellMax, abs(cellY));
}

void main() {
	int index = int(floor(v_uv.x * float(u_CountX))) + int(floor(v_uv.y * float(u_CountY))) * u_CountX;
    vec4 value = texture(u_Values, v_uv);

    vec4 color = u_Tint;
    color.a = value.r;

	// Get the pixel opacity for the current cell
	float distCamToPixel = distance(v_worldPos, vec4(u_CameraPos, 1.0));
	float cellOpacity = GetCellOpacity(v_uv, v_constants, distCamToPixel);

	color.a *= cellOpacity;
    fragColor = clamp(color, 0.0, 1.0);

	fragColor = u_Tint;
}