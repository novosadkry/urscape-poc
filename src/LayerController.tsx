import { useEffect } from 'react';
import { useAppSelector } from './ReduxHooks';
import { Map } from 'maplibre-gl';
import { GridLayer } from './Map/GridLayer';
import { GridPatch } from './DataLayers/GridPatch';

type Props = {
  map: Map | null
};

export default function LayerController(props: Props) {
  const { map } = props;
  const layers = useAppSelector(state => state.map.layers);

  useEffect(() => {
    if (!map) return;

    const activeDataLayers = Object.values(layers)
      .filter(layer => layer.active);

    let offsetIndex = 0;
    const offsetCount = 1.0 / activeDataLayers.length;
    const offsetRadians = (2.0 * Math.PI) * offsetCount;
    const offsetDistance = 0.15 * (1.0 - offsetCount);

    for (const dataLayer of activeDataLayers) {
      const index = offsetIndex++; // copy for closure
      const patches = dataLayer.patches as GridPatch[];

      for (const patch of patches) {
        const { header, data } = patch;

        if (!data) {
          // TODO: Request patch data
          console.warn("Patch has no data");
          continue;
        }

        const id = header.name + header.patch;
        let layer = map.getLayer(id) as unknown as GridLayer;

        if (!layer) {
          layer = new GridLayer(id, dataLayer, data);
          map.addLayer(layer);
        }

        layer.offset = [
          offsetDistance * Math.cos(index * offsetRadians),
          offsetDistance * Math.sin(index * offsetRadians)
        ];
      }
    }
  }, [map, layers]);

  return (
    <>
    </>
  )
}
