import { mat4 } from 'gl-matrix';
import { GridData } from './GridData';
import { GridShader } from './GridShader';
import { CustomLayerInterface, MercatorCoordinate } from 'maplibre-gl';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export class GridLayer implements CustomLayerInterface {
  public readonly id: string;
  public readonly type = "custom";

  private grid: GridData;
  private shader: GridShader;

  constructor(id: string, grid: GridData) {
    this.id = id;
    this.grid = grid;
    this.shader = new GridShader();
  }

  public onAdd(_map: maplibregl.Map, gl: WebGLContext) {
    this.shader.init(gl);

    const west = this.grid.metadata["West"] as number;
    const north = this.grid.metadata["North"] as number;
    const east = this.grid.metadata["East"] as number;
    const south = this.grid.metadata["South"] as number;

    const p0 = MercatorCoordinate.fromLngLat({ lng: west, lat: south });
    const p1 = MercatorCoordinate.fromLngLat({ lng: east, lat: south });
    const p2 = MercatorCoordinate.fromLngLat({ lng: west, lat: north });
    const p3 = MercatorCoordinate.fromLngLat({ lng: east, lat: north });

    this.shader.setPositions(gl,
      [
        [p0.x, p0.y, 0.0],
        [p1.x, p1.y, 0.0],
        [p2.x, p2.y, 0.0],
        [p3.x, p3.y, 0.0],
      ],
    );

    this.shader.setUVs(gl,
      [
        [0.0, 0.0],
        [1.0, 0.0],
        [0.0, 1.0],
        [1.0, 1.0],
      ],
    );
  }

  public render(gl: WebGLContext, matrix: mat4) {
    // Bind shader
    this.shader.u_MVP = matrix;
    this.shader.bind(gl);

    // Additive color blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
