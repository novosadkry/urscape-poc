import { mat4, vec3 } from 'gl-matrix';
import { GridData } from './GridData';
import { CustomLayerInterface, MercatorCoordinate } from 'maplibre-gl';

// Import shader source code as raw string
import vertexSource from '../assets/shaders/grid.vertex.glsl?raw';
import fragmentSource from '../assets/shaders/grid.fragment.glsl?raw';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export class GridLayer implements CustomLayerInterface {
  public readonly id: string;
  public readonly type = "custom";

  private grid: GridData;
  private program: WebGLProgram;
  private vertexBuffer: WebGLBuffer;

  constructor(id: string, grid: GridData) {
    this.id = id;
    this.grid = grid;
    this.program = {};
    this.vertexBuffer = {};
  }

  public onAdd(_map: maplibregl.Map, gl: WebGLContext) {
    this.program = this.createProgram(gl);

    const west = this.grid.metadata["West"] as number;
    const north = this.grid.metadata["North"] as number;
    const east = this.grid.metadata["East"] as number;
    const south = this.grid.metadata["South"] as number;

    const p0 = MercatorCoordinate.fromLngLat({ lng: west, lat: south });
    const p1 = MercatorCoordinate.fromLngLat({ lng: east, lat: south });
    const p2 = MercatorCoordinate.fromLngLat({ lng: west, lat: north });
    const p3 = MercatorCoordinate.fromLngLat({ lng: east, lat: north });

    // Setup vertex buffer object
    this.vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        p0.x, p0.y, 0.0, 1.0,
        0.0, 0.0,
        p1.x, p1.y, 0.0, 1.0,
        1.0, 0.0,
        p2.x, p2.y, 0.0, 1.0,
        0.0, 1.0,
        p3.x, p3.y, 0.0, 1.0,
        1.0, 1.0
      ]),
      gl.STATIC_DRAW
    );
  }

  public render(gl: WebGLContext, matrix: mat4) {
    gl.useProgram(this.program);

    this.setupUniforms(gl, matrix);
    this.setupVertices(gl);

    // Additive color blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private createProgram(gl: WebGLContext): WebGLProgram {
    // Create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    // Create a fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    // Link the two shaders into a WebGL program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
  }

  private setupUniforms(gl: WebGLContext, matrix: mat4) {
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program!, 'u_MVP'),
      false,
      matrix
    );
    gl.uniform4fv(
      gl.getUniformLocation(this.program!, 'u_Tint'),
      [1.0, 0.0, 0.0, 0.5]
    );
  }

  private setupVertices(gl: WebGLContext) {
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    const aUV = gl.getAttribLocation(this.program, 'a_uv');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 4, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 24, 16);
  }
}
