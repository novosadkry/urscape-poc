type AttributeParams = {
  name: string,
  index: number,
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number,
};

type TextureParams = {
  name: string,
  index: WebGLUniformLocation,
  format: number,
  width: number,
  height: number,
};

export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export abstract class Shader {
  private vertexSource?: string;
  private fragmentSource?: string;

  protected program: WebGLProgram;

  protected attributes: {
    [index: string]: {
      buffer: WebGLBuffer,
      params: AttributeParams,
    }
  };

  protected textures: {
    [index: string]: {
      texture: WebGLTexture,
      params: TextureParams,
    }
  };

  constructor(vertexSource: string, fragmentSource: string) {
    this.program = {};
    this.attributes = {};
    this.textures = {};
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
  }

  public init(gl: WebGLContext) {
    this.program = this.createProgram(gl);
  }

  /**
   * Binds this shader program to a given WebGL context
   * with all uniforms, textures and vertex attribute data.
   *
   * This method should be called before every draw call.
   *
   * @param gl - The WebGL context.
   */
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

    // Bind all textures
    Object.values(this.textures).forEach((value, i) => {
      const texture = value.texture;
      const params = value.params;

      gl.uniform1i(params.index, i);
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    });
  }

  /**
   * Sets or creates vertex attribute data for this shader program.
   *
   * @param gl - The WebGL context.
   * @param values - An array of values representing the attribute data.
   * @param params - An object containing attribute parameters.
   * @throws Throws an error if the buffer object cannot be created.
   */
  protected setAttributeData(gl: WebGLContext, values: number[], params: AttributeParams) {
    // Retrieve the buffer from the map or create a new one if it doesn't exist.
    const buffer = this.attributes[params.name] ?? gl.createBuffer();
    if (!buffer) throw new Error("An error occured while creating a buffer object");

    // Upload the data to a vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(values),
      gl.STATIC_DRAW
    );

    // Store the buffer and its parameters
    this.attributes[params.name] = { buffer, params };
  }

  /**
   * Sets or creates texture data for this shader program.
   *
   * @param gl - The WebGL context.
   * @param values - An array of pixel values for the texture. Values must be in the unsigned byte range (0-255).
   * @param params - An object containing texture parameters.
   * @throws Throws an error if the texture object cannot be created.
   */
  protected setTextureData(gl: WebGLRenderingContext, values: number[], params: TextureParams) {
    // Retrieve the texture from the map or create a new one if it doesn't exist
    const texture = this.textures[params.name] ?? gl.createTexture();
    if (!texture) throw new Error("An error occurred while creating a texture object");

    // Upload the data to a texture image
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,                      // Mipmap level
      params.format,          // Internal format
      params.width,           // Width of the texture
      params.height,          // Height of the texture
      0,                      // Border width (always zero)
      params.format,          // Format of the pixel data (same as internal)
      gl.UNSIGNED_BYTE,       // Type of the pixel data
      new Uint8Array(values)  // Pixel data
    );

    // Set texture parameters for filtering and wrapping
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Store the texture and its parameters
    this.textures[params.name] = { texture, params };
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
