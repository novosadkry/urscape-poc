import { useEffect, useState, useCallback } from 'react';
import { addLayer, addPatch } from './MapSlice';
import { DataLayer } from './DataLayers/DataLayer';
import { GridPatch } from './DataLayers/GridPatch';
import { patchRequest } from './DataLayers/PatchRequest';
import { useAppDispatch } from './ReduxHooks';

import GridParser from './assets/workers/GridParser.ts?worker';

export default function DataLoader() {
  const dispatch = useAppDispatch();

  const [parser, setParser] = useState<Worker | null>(null);
  const pushResult = useCallback((patch: GridPatch) => {
    dispatch(addPatch(patch));
  }, [dispatch]);

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

    const density: DataLayer = { id: "Density", name: "Density", tint: [1.0, 0.0, 0.0, 1.0], active: false, patches: [] };
    const cropland: DataLayer = { id: "Cropland", name: "Cropland", tint: [0.0, 1.0, 0.0, 1.0], active: false, patches: [] };

    for (let i = 0; i < 32; i++) {
      parser.postMessage(patchRequest(`global/Density_B_global@${i}_YYYYMMDD_grid.csv`));
      parser.postMessage(patchRequest(`global/Cropland_B_global@${i}_YYYYMMDD_grid.csv`));
    }

    dispatch(addLayer(density));
    dispatch(addLayer(cropland));
  }, [dispatch, parser]);

  return (
    <>
    </>
  )
}