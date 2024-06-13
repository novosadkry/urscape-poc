type AttribParams = {
  name: string,
  index: number,
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number
};

export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export abstract class Shader {
  private vertexSource?: string;
  private fragmentSource?: string;

  protected program: WebGLProgram;
  protected attributes: { [index: string]: {
    buffer: WebGLBuffer,
    params: AttribParams
  } };

  constructor(vertexSource: string, fragmentSource: string) {
    this.program = {};
    this.attributes = {};
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
  }

  public init(gl: WebGLContext) {
    this.program = this.createProgram(gl);
  }

  public bind(gl: WebGLContext) {
    // Bind shader program
    gl.useProgram(this.program);

    // Bind all attributes and their buffers
    for (const name in this.attributes) {
      const buffer = this.attributes[name].buffer;
      const params = this.attributes[name].params;

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(params.index);
      gl.vertexAttribPointer(
        params.index,
        params.size,
        params.type,
        params.normalized,
        params.stride,
        params.offset
      );
    }
  }

  protected setAttributeData(gl: WebGLContext, values: number[], params: AttribParams) {
    const buffer = this.attributes[params.name] ?? gl.createBuffer();
    if (!buffer) throw new Error("An error occured while creating a buffer object");

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(values),
      gl.STATIC_DRAW
    );

    this.attributes[params.name] = { buffer, params };
  }

  private createProgram(gl: WebGLContext): WebGLProgram {
    if (!this.vertexSource || !this.fragmentSource) {
      throw new Error("Invalid shader source or createProgram called twice");
    }

    const vertexShader = this.createShader(gl, this.vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(gl, this.fragmentSource, gl.FRAGMENT_SHADER);

    // Link the two shaders into a WebGL program
    const program = gl.createProgram();
    if (!program) throw new Error("An error occured while creating the shader program");

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);

      throw new Error("An error occured during shader linking: " + error);
    }

    // Clean-up resources
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    delete this.vertexSource;
    delete this.fragmentSource;

    return program;
  }

  private createShader(gl: WebGLContext, source: string, type: number): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("An error occured while creating the shader object");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);

      throw new Error("An error occured during shader compile: " + error);
    }

    return shader;
  }
}