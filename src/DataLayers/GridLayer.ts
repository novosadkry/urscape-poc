import { mat4, vec3 } from 'gl-matrix';
import { GridData } from './GridData';
import { CustomLayerInterface, MercatorCoordinate } from 'maplibre-gl';

// Import shader source code as raw string
import vertexSource from '../assets/shaders/grid.vertex.glsl?raw';
import fragmentSource from '../assets/shaders/grid.fragment.glsl?raw';

export class GridLayer implements CustomLayerInterface {
  public readonly id: string;
  public readonly type = "custom";

  private grid: GridData;
  private color: vec3;
  private offset: vec3;

  private program: WebGLProgram;
  private vertexBuffer: WebGLBuffer;
  private attributes: { aPos: number, aUV: number };

  constructor(id: string, grid: GridData, color: vec3, offset: vec3) {
    this.id = id;

    this.grid = grid;
    this.color = color;
    this.offset = offset;

    this.program = {};
    this.vertexBuffer = {};
    this.attributes = { aPos: 0, aUV: 0 };
  }

  public onAdd(_map: maplibregl.Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    // Create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    // Create a fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    // Link the two shaders into a WebGL program
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    this.attributes.aPos = gl.getAttribLocation(this.program, 'a_pos');
    this.attributes.aUV = gl.getAttribLocation(this.program, 'a_uv');

    // Define quad using Mercator coordinates
    const west = this.grid.metadata["West"] as number;
    const north = this.grid.metadata["North"] as number;
    const east = this.grid.metadata["East"] as number;
    const south = this.grid.metadata["South"] as number;

    // Define vertices of the triangle to be rendered
    const p0 = MercatorCoordinate.fromLngLat({ lng: west + this.offset[0], lat: south + this.offset[1] });
    const p1 = MercatorCoordinate.fromLngLat({ lng: east + this.offset[0], lat: south + this.offset[1] });
    const p2 = MercatorCoordinate.fromLngLat({ lng: west + this.offset[0], lat: north + this.offset[1] });
    const p3 = MercatorCoordinate.fromLngLat({ lng: east + this.offset[0], lat: north + this.offset[1] });

    // Create and initialize a buffer to store vertex data
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

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, matrix: mat4) {
    // var relativeToEyeMatrix = [
    //   matrix[0], matrix[1], matrix[2], matrix[3],
    //   matrix[4], matrix[5], matrix[6], matrix[7],
    //   matrix[8], matrix[9], matrix[10], matrix[11],
    //   0, 0, 0, matrix[15]
    // ];

    // Setup shader program
    gl.useProgram(this.program);

    // Setup uniforms
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program!, 'u_matrix'),
      false,
      matrix
    );
    gl.uniform3fv(
      gl.getUniformLocation(this.program!, 'u_color'),
      this.color
    );

    // Setup VAO and VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.attributes.aPos);
    gl.vertexAttribPointer(this.attributes.aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.attributes.aUV);
    gl.vertexAttribPointer(this.attributes.aUV, 2, gl.FLOAT, false, 16, 8);

    // Additional blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Draw call
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
