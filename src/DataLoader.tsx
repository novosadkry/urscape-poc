import { useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { Site } from './DataLayers/Site';
import { DataLayer } from './DataLayers/DataLayer';
import { GridPatch } from './DataLayers/GridPatch';
import { patchRequest } from './DataLayers/PatchRequest';

import GridParser from './assets/workers/GridParser.ts?worker';

type Props = {
  dataLayers: DataLayer[]
  setSites: Dispatch<SetStateAction<Site[]>>
  setDataLayers: Dispatch<SetStateAction<DataLayer[]>>
};

export default function DataLoader(props: Props) {
  const {
    dataLayers,
    setSites,
    setDataLayers,
  } = props;

  const parser = useMemo(() => new GridParser(), []);

  parser.onmessage = (e: MessageEvent<GridPatch>) => {
    const layers = dataLayers.slice();
    const patch = e.data;

    const layer = layers.find(x => x.name == patch.header.name);
    layer?.patches.push(patch);

    setDataLayers(layers)
  }

  useEffect(() => {
    const global = new Site();

    const cropland = new DataLayer("Cropland");
    const density = new DataLayer("Density");

    for (let i = 0; i < 32; i++) {
      parser.postMessage(patchRequest(`global/Cropland_B_global@${i}_YYYYMMDD_grid.csv`));
      parser.postMessage(patchRequest(`global/Density_B_global@${i}_YYYYMMDD_grid.csv`));
    }

    global.layers = [cropland, density];

    setSites([global]);
    setDataLayers(global.layers);
  }, [parser, setSites, setDataLayers]);

  return (
    <>
    </>
  )
}