import { mat4 } from 'gl-matrix';
import { CustomLayerInterface, MercatorCoordinate } from 'maplibre-gl';

import vertexSource from './assets/shaders/grid.vertex.glsl?raw';
import fragmentSource from './assets/shaders/grid.fragment.glsl?raw';

export class GridLayer implements CustomLayerInterface {
  id: string;
  type: "custom";

  program: WebGLProgram;
  vertexBuffer: WebGLBuffer;
  attributes: { aPos: number, aUV: number };

  constructor() {
    this.id = "dataGrid"
    this.type = "custom"
    this.program = {};
    this.vertexBuffer = {};
    this.attributes = { aPos: 0, aUV: 0 };
  }

  onAdd(_map: maplibregl.Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    // create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    // create a fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    // link the two shaders into a WebGL program
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    this.attributes.aPos = gl.getAttribLocation(this.program, 'a_pos');
    this.attributes.aUV = gl.getAttribLocation(this.program, 'a_uv');

    // define vertices of the triangle to be rendered in the custom style layer
    const p0 = MercatorCoordinate.fromLngLat({ lng: 103.7, lat: 1.18 });
    const p1 = MercatorCoordinate.fromLngLat({ lng: 103.9, lat: 1.18 });
    const p2 = MercatorCoordinate.fromLngLat({ lng: 103.7, lat: 1.33 });
    const p3 = MercatorCoordinate.fromLngLat({ lng: 103.9, lat: 1.33 });

    // create and initialize a WebGLBuffer to store vertex and color data
    this.vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        p0.x,
        p0.y,
        0.0, 0.0,
        p1.x,
        p1.y,
        1.0, 0.0,
        p2.x,
        p2.y,
        0.0, 1.0,
        p3.x,
        p3.y,
        1.0, 1.0
      ]),
      gl.STATIC_DRAW
    );
  }

  render(gl: WebGLRenderingContext | WebGL2RenderingContext, matrix: mat4) {
    // var relativeToEyeMatrix = [
    //   matrix[0], matrix[1], matrix[2], matrix[3],
    //   matrix[4], matrix[5], matrix[6], matrix[7],
    //   matrix[8], matrix[9], matrix[10], matrix[11],
    //   0, 0, 0, matrix[15]
    // ];

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program!, 'u_matrix'),
      false,
      matrix
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.attributes.aPos);
    gl.vertexAttribPointer(this.attributes.aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.attributes.aUV);
    gl.vertexAttribPointer(this.attributes.aUV, 2, gl.FLOAT, false, 16, 8);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
