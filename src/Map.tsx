import { useRef, useEffect, useState } from 'react';
import maplibre from 'maplibre-gl';
import { GridLayer } from './DataLayers/GridLayer';
import { parseCSV } from './DataLayers/GridData';
import mapStyle from './MapStyle';

import './Map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import topologyCSV from './assets/data/topology.csv?raw';
import densityCSV from './assets/data/density.csv?raw';
import soilCSV from './assets/data/soil_D_0.csv?raw';

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibre.Map | null>(null)

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

  // Add map layers
  useEffect(() => {
    async function parseGrid() {
      return [
        await parseCSV(topologyCSV),
        await parseCSV(densityCSV),
        await parseCSV(soilCSV),
      ];
    }

    async function mapLayers() {
      const gridData = await parseGrid();

      const layer0 = new GridLayer("topology", gridData[0], [1.0, 0.0, 0.0]);
      const layer1 = new GridLayer("density", gridData[1], [0.0, 1.0, 0.0]);
      const layer2 = new GridLayer("soil", gridData[2], [0.0, 0.0, 1.0]);

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
    }

    mapLayers();
  }, [map]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
