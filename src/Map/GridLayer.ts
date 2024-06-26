import { MapLayer } from './MapLayer';
import { GridData } from '../DataLayers/GridData';
import { WebGLContext } from './Shaders/Shader';
import { GridShader } from './Shaders/GridShader';
import { MercatorCoordinate } from 'maplibre-gl';
import * as utils from './MapUtils';
import * as glm from 'gl-matrix';

export class GridLayer implements MapLayer {
  public readonly id: string;
  public readonly type = "custom";
  public readonly renderingMode = "2d";
  public active: boolean = true;

  private grid: GridData;
  private tint: glm.vec3;
  private shader: GridShader;
  private map?: maplibregl.Map;

  constructor(id: string, grid: GridData, tint: glm.vec3) {
    this.id = id;
    this.grid = grid;
    this.tint = tint;
    this.shader = new GridShader();
  }

  public onAdd(map: maplibregl.Map, gl: WebGLContext) {
    this.map = map;
    this.shader.init(gl);

    const { north, east, south, west } = this.grid.bounds;
    const p0 = MercatorCoordinate.fromLngLat({ lng: west, lat: south });
    const p1 = MercatorCoordinate.fromLngLat({ lng: east, lat: south });
    const p2 = MercatorCoordinate.fromLngLat({ lng: west, lat: north });
    const p3 = MercatorCoordinate.fromLngLat({ lng: east, lat: north });

    const min = utils.latToNormalizedMercator(south);
    const max = utils.latToNormalizedMercator(north);
    const invLatRange = (1.0 / (north - south));

    const lats: number[] = [];
    const countY = this.grid.countY + 1;
    const projLatInterval = (max - min) / (countY - 1);

    for (let i = 0; i < countY; i++) {
      const projLat = min + i * projLatInterval;
      const lat = (2 * Math.atan(Math.exp(projLat * Math.PI)) - Math.PI * 0.5) * utils.Rad2Deg;
      lats[i] = utils.clamp01(1.0 - (lat - south) * invLatRange);
    }

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

    this.shader.setValues(gl, this.grid);
    this.shader.setProjection(gl, lats);
  }

  public onRemove(_map: maplibregl.Map, gl: WebGLContext): void {
    this.shader.delete(gl);
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, mvp: glm.mat4) {
    if (!(gl instanceof WebGL2RenderingContext))
      throw Error("Unsupported WebGL version");

    const centerMercator = MercatorCoordinate.fromLngLat(this.map!.transform.center);
    const center: glm.vec3 = [centerMercator.x, centerMercator.y, centerMercator.z];

    const { lngLat, altitude } = this.map!.transform.getCameraPosition();
    const cameraMercator = MercatorCoordinate.fromLngLat(lngLat, altitude);

    const camera: glm.vec3 = [
      cameraMercator.x,
      cameraMercator.y,
      cameraMercator.z
    ];

    const zoom = this.map!.getZoom();

    // Set uniforms and bind shader program
    this.shader.mvp = mvp;
    this.shader.zoom = zoom;
    this.shader.center = center;
    this.shader.camera = camera;
    this.shader.tint = this.tint;
    this.shader.count = [
      this.grid.countX,
      this.grid.countY,
    ];
    this.shader.bind(gl);

    // Additive color blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
