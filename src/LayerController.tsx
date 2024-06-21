import { useEffect, Dispatch, SetStateAction } from 'react';
import { Layer } from './DataLayers/Layer';
import { GridLayer } from './DataLayers/GridLayer';
import { parseGrid } from './DataLayers/GridPatch';

type Props = {
  layers: Layer[]
  setLayers: Dispatch<SetStateAction<Layer[]>>
};

export default function LayerController(props: Props) {
  const { setLayers } = props;

  useEffect(() => {
    async function loadLayers() {
      const patches = [
        await parseGrid("Topography_D_Insert Location@0_YYYYMMDD_grid.csv"),
        await parseGrid("density_D_Insert Location@0_YYYYMMDD_grid.csv"),
        await parseGrid("soil_C_Insert Location@0_YYYYMMDD_grid.csv"),
      ];

      const layers = [];
      layers.push(new GridLayer(patches[0].header.name, patches[0].data, [1.0, 0.0, 0.0]));
      layers.push(new GridLayer(patches[1].header.name, patches[1].data, [0.0, 1.0, 0.0]));
      layers.push(new GridLayer(patches[2].header.name, patches[2].data, [0.0, 0.0, 1.0]));

      setLayers(layers);
    }

    loadLayers()
  }, [setLayers]);

  return (
    <>
    </>
  )
}
