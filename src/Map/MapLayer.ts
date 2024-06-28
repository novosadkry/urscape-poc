import { CustomLayerInterface } from "maplibre-gl";
import { DataLayer } from "../DataLayers/DataLayer";

export interface MapLayer extends CustomLayerInterface
{
  active: boolean
  getDataLayer(): DataLayer
}
