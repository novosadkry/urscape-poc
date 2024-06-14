import { Shader, WebGLContext } from './Shader';
import * as glm from 'gl-matrix';

// Import shader source code as raw string
import vertexSource from '../assets/shaders/grid.vertex.glsl?raw';
import fragmentSource from '../assets/shaders/grid.fragment.glsl?raw';

// TODO: Move to Shader Utils?
function encodeFloatToDouble(value: number) {
  const result = new Float32Array(2);
  result[0] = value;

  const delta = value - result[0];
  result[1] = delta;

  return result;
}

export class GridShader extends Shader {
  public mvp: glm.ReadonlyMat4;
  public camera: glm.ReadonlyVec3;

  constructor() {
    super(vertexSource, fragmentSource)
    this.mvp = glm.mat4.create();
    this.camera = glm.vec3.create();
  }

  public bind(gl: WebGLContext) {

    // ------------------------------
    // This shader prevents jitter caused by a loss of precision
    // by emulating double-precision and Camera-relative rendering.
    //
    // On the GPU side we subtract center (stored as two floats in uniforms)
    // from all vertex positions (this makes all vertices relative to center).
    //
    // After applying projection we translate the vertices to their original
    // position by now adding the center (which we substracted earlier).
    //
    // The translation operation is included in the MVP matrix below.
    // ------------------------------

    super.bind(gl);

    glm.glMatrix.setMatrixArrayType(Array);
    const mvp = glm.mat4.clone(this.mvp);
    glm.mat4.translate(mvp, mvp, this.camera);

    const camera = [
      encodeFloatToDouble(this.camera[0]),
      encodeFloatToDouble(this.camera[1]),
      encodeFloatToDouble(this.camera[2]),
    ];

    const cameraHigh = [camera[0][0], camera[1][0], camera[2][0]];
    const cameraLow = [camera[0][1], camera[1][1], camera[2][1]];

    // ------------------------------
    // Set uniform values

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, 'u_MVP'),
      false,
      mvp
    );

    gl.uniform3fv(
      gl.getUniformLocation(this.program, 'u_CameraHigh'),
      cameraHigh
    );

    gl.uniform3fv(
      gl.getUniformLocation(this.program, 'u_CameraLow'),
      cameraLow
    );

    gl.uniform4fv(
      gl.getUniformLocation(this.program, 'u_Tint'),
      [1.0, 0.0, 0.0, 0.5]
    );

    gl.uniform2fv(
      gl.getUniformLocation(this.program, 'u_Offset'),
      [0.0, 0.0]
    );

    gl.uniform2iv(
      gl.getUniformLocation(this.program, 'u_Count'),
      [100, 100]
    );
  }

  public setPositions(gl: WebGLContext, values: glm.vec3[]) {
    const name = "a_Pos";
    const index = gl.getAttribLocation(this.program, name);
    const array = values.flat() as number[];

    this.setAttributeData(
      gl,
      array,
      {
        index: index,
        name: name,
        type: gl.FLOAT,
        normalized: false,
        size: 3,
        stride: 0,
        offset: 0,
      },
    );
  }

  public setUVs(gl: WebGLContext, values: glm.vec2[]) {
    const name = "a_UV";
    const index = gl.getAttribLocation(this.program, name);
    const array = values.flat() as number[];

    this.setAttributeData(
      gl,
      array,
      {
        index: index,
        name: name,
        type: gl.FLOAT,
        normalized: false,
        size: 2,
        stride: 0,
        offset: 0,
      },
    );
  }

  public setValues(gl: WebGLContext, values: glm.vec4[]) {
    const name = "u_Values";
    const index = gl.getUniformLocation(this.program, name)!;
    const array = values.flat() as number[];

    this.setTextureData(
      gl,
      array,
      {
        index: index,
        name: name,
        width: values.length,
        height: 1,
        format: gl.RGBA,
      },
    );
  }
}