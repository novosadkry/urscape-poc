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
    const mapLayers = [];

    for (const dataLayer of dataLayers) {
      if (!dataLayer.active) continue;
      const patches = dataLayer.patches as GridPatch[];

      for (const patch of patches) {
        const { header, data } = patch;

        if (!data) {
          // TODO: Request patch data
          console.warn("Patch has no data");
          continue;
        }

        const id = header.name + header.patch;
        mapLayers.push(new GridLayer(id, data, [1.0, 0.0, 0.0]));
      }
    }

    setMapLayers(mapLayers);
  }, [dataLayers, setMapLayers]);

  return (
    <>
    </>
  )
}
