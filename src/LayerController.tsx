import { useEffect, Dispatch, SetStateAction } from 'react';
import { MapLayer } from './Map/MapLayer';
import { GridLayer } from './Map/GridLayer';
import { GridPatch, parseGrid } from './DataLayers/GridPatch';
import { DataLayer } from './DataLayers/DataLayer';

type Props = {
  dataLayers: DataLayer[]
  setDataLayers: Dispatch<SetStateAction<DataLayer[]>>
  setMapLayers: Dispatch<SetStateAction<MapLayer[]>>
};

export default function LayerController(props: Props) {
  const {
    dataLayers,
    setDataLayers,
    setMapLayers
  } = props;

  useEffect(() => {
    async function loadLayers() {
      const topography = new DataLayer("Topography");
      topography.patches.push(await parseGrid("Topography_D_Insert Location@0_YYYYMMDD_grid.csv"))

      const density = new DataLayer("Density");
      density.patches.push(await parseGrid("density_D_Insert Location@0_YYYYMMDD_grid.csv"))

      const soil = new DataLayer("Soil");
      soil.patches.push(await parseGrid("soil_C_Insert Location@0_YYYYMMDD_grid.csv"))

      const dataLayers = [];
      dataLayers.push(topography);
      dataLayers.push(density);
      dataLayers.push(soil);

      setDataLayers(dataLayers);
    }

    loadLayers()
  }, [setDataLayers]);


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

        mapLayers.push(new GridLayer(header.name, data, [1.0, 0.0, 0.0]));
      }
    }

    setMapLayers(mapLayers);
  }, [dataLayers, setMapLayers]);

  return (
    <>
    </>
  )
}
