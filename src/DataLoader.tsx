import {
  useEffect, useState, useCallback,
  Dispatch, SetStateAction,
} from 'react';

import { Site } from './DataLayers/Site';
import { DataLayer } from './DataLayers/DataLayer';
import { GridPatch } from './DataLayers/GridPatch';
import { patchRequest } from './DataLayers/PatchRequest';

import GridParser from './assets/workers/GridParser.ts?worker';

type Props = {
  setSites: Dispatch<SetStateAction<Site[]>>
  setDataLayers: Dispatch<SetStateAction<DataLayer[]>>
};

export default function DataLoader(props: Props) {
  const {
    setSites,
    setDataLayers,
  } = props;

  const [parser, setParser] = useState<Worker | null>(null);
  const pushResult = useCallback((patch: GridPatch) => {
    setDataLayers(prevLayers => {
      const layers = prevLayers.map(layer => {
        if (layer.name === patch.header.name) {
          return {
            ...layer,
            patches: [...layer.patches, patch],
          };
        }
        return layer;
      });
      return layers;
    });
  }, [setDataLayers]);

  // Initialize GridParser web worker
  useEffect(() => {
    const parser = new GridParser();
    parser.onmessage = (e: MessageEvent<GridPatch>) => pushResult(e.data);
    parser.onerror = (event) => console.error("GridParser Error: " + event.message);

    setParser(parser);

    return () => {
      parser.terminate();
    }
  }, [pushResult, setParser])

  // Enqueue requests for global data on first render
  useEffect(() => {
    if (!parser) return;

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