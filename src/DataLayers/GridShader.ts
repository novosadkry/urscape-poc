import { Shader, WebGLContext } from './Shader';
import { mat4, vec3, vec2 } from 'gl-matrix';

// Import shader source code as raw string
import vertexSource from '../assets/shaders/grid.vertex.glsl?raw';
import fragmentSource from '../assets/shaders/grid.fragment.glsl?raw';

export class GridShader extends Shader {
  public u_MVP: mat4;

  constructor() {
    super(vertexSource, fragmentSource)
    this.u_MVP = mat4.create();
  }

  public bind(gl: WebGLContext) {
    super.bind(gl);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, 'u_MVP'),
      false,
      this.u_MVP
    );

    gl.uniform4fv(
      gl.getUniformLocation(this.program, 'u_Tint'),
      [1.0, 0.0, 0.0, 0.5]
    );
  }

  public setPositions(gl: WebGLContext, values: vec3[]) {
    const index = gl.getAttribLocation(this.program, "a_Pos");
    const array = values.flat() as number[];

    this.setAttributeData(
      gl,
      array,
      {
        index,
        name: "a_pos",
        type: gl.FLOAT,
        normalized: false,
        size: 3,
        stride: 0,
        offset: 0,
      },
    );
  }

  public setUVs(gl: WebGLContext, values: vec2[]) {
    const index = gl.getAttribLocation(this.program, "a_UV");
    const array = values.flat() as number[];

    this.setAttributeData(
      gl,
      array,
      {
        index,
        name: "a_uv",
        type: gl.FLOAT,
        normalized: false,
        size: 2,
        stride: 0,
        offset: 0,
      },
    );
  }
}