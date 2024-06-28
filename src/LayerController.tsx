import { useEffect, Dispatch, SetStateAction } from 'react';
import { MapLayer } from './Map/MapLayer';
import { GridLayer } from './Map/GridLayer';
import { GridPatch } from './DataLayers/GridPatch';
import { DataLayer } from './DataLayers/DataLayer';

type Props = {
  dataLayers: DataLayer[]
  setMapLayers: Dispatch<SetStateAction<MapLayer[]>>
};

export default function LayerController(props: Props) {
  const {
    dataLayers,
    setMapLayers
  } = props;

  useEffect(() => {
    // Remove inactive map layers
    setMapLayers(prev => {
      return prev.filter((mapLayer) => {
        const dataLayer = mapLayer.getDataLayer();
        return dataLayer.active;
      })
    });

    const activeDataLayers = dataLayers
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

        setMapLayers((prev) => {
          const layers = [...prev];
          const id = header.name + header.patch;
          let layer = layers.find(x => x.id == id) as GridLayer;

          if (!layer) {
            layer = new GridLayer(id, dataLayer, data);
            layers.push(layer);
          }

          layer.offset = [
            offsetDistance * Math.cos(index * offsetRadians),
            offsetDistance * Math.sin(index * offsetRadians)
          ];

          return layers;
        });
      }
    }
  }, [dataLayers, setMapLayers]);

  return (
    <>
    </>
  )
}
