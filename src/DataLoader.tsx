import { useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { Site } from './DataLayers/Site';
import { DataLayer } from './DataLayers/DataLayer';
import { GridPatch } from './DataLayers/GridPatch';
import { PatchConstants } from './DataLayers/Patch';

import Loader from './assets/workers/Loader.ts?worker';
import { PatchRequest } from './assets/workers/Loader';

type Props = {
  dataLayers: DataLayer[]
  setSites: Dispatch<SetStateAction<Site[]>>
  setDataLayers: Dispatch<SetStateAction<DataLayer[]>>
};

function patchRequest(path: string): PatchRequest {
  const base = window.location.origin + import.meta.env.BASE_URL;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  const url = new URL(PatchConstants.PATCH_PATH + path, base).href;

  return { url, filename };
}

export default function DataLoader(props: Props) {
  const {
    dataLayers,
    setSites,
    setDataLayers,
  } = props;

  const loader = useMemo(() => new Loader(), []);
  loader.onmessage = (e: MessageEvent<GridPatch>) => {
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
      loader.postMessage(patchRequest(`global/Cropland_B_global@${i}_YYYYMMDD_grid.csv`));
      loader.postMessage(patchRequest(`global/Density_B_global@${i}_YYYYMMDD_grid.csv`));
    }

    global.layers = [cropland, density];

    setSites([global]);
    setDataLayers(global.layers);
  }, [loader, setSites, setDataLayers]);

  return (
    <>
    </>
  )
}