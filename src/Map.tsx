import { useRef, useEffect, useState } from 'react';
import maplibre from 'maplibre-gl';
import { GridLayer } from './DataLayers/GridLayer';
import { GridData, parseData } from './DataLayers/GridData';
import mapStyle from './MapStyle';

import './Map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import gridCSV from './assets/data/grid.csv?raw';

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibre.Map | null>(null)
  const [gridData, setGridData] = useState<GridData | null>(null);

  // Setup Maplibre
  useEffect(() => {
    const newMap = new maplibre.Map({
      container: mapRef.current as HTMLElement,
      // projection: 'globe',
      style: mapStyle,
      center: [107.641, -6.866],
      zoom: 13,
      antialias: true
    });

    setMap(newMap);

    // Clean-up function
    return () => {
      newMap?.remove();
    }
  }, []);

  // Load grid data
  useEffect(() => {
    async function parseGrid() {
      // Initialize custom layer
      setGridData(await parseData(gridCSV));
    }

    parseGrid()
  }, [])

  // Add map layers
  useEffect(() => {
    if (!gridData) return;

    const layer0 = new GridLayer("grid_0", gridData, [1.0, 0.0, 0.0], [0.0, 0.0, 0.0]);
    const layer1 = new GridLayer("grid_1", gridData, [0.0, 1.0, 0.0], [0.005, 0.0, 0.0]);
    const layer2 = new GridLayer("grid_2", gridData, [0.0, 0.0, 1.0], [0.0025, 0.0025, 0.0]);

    const addLayers = () => {
      map?.addLayer(layer0);
      map?.addLayer(layer1);
      map?.addLayer(layer2);
    };

    // Add custom layer to the map
    if (map?.loaded) {
      addLayers();
    } else {
      map?.on('load', addLayers);
    }
  }, [map, gridData]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
