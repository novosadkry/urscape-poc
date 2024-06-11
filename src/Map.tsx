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

  useEffect(() => {
    const newMap = new maplibre.Map({
      container: mapRef.current as HTMLElement,
      // projection: 'globe',
      style: mapStyle,
      center: [0, 0],
      zoom: 0,
      antialias: true
    });

    setMap(newMap);

    // Clean-up function
    return () => {
      newMap?.remove();
    }
  }, []);

  useEffect(() => {
    async function parseGrid() {
      // Initialize custom layer
      setGridData(await parseData(gridCSV));
    }

    parseGrid()
  }, [])

  useEffect(() => {
    if (!gridData) return;
    const gridLayer = new GridLayer(gridData);

    // Add custom layer to the map
    if (map?.loaded) {
      map.addLayer(gridLayer);
    } else {
      map?.on('load', () => {
        map.addLayer(gridLayer);
      });
    }
  }, [map, gridData]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
