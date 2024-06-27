import { useRef, useEffect, useState } from 'react';
import maplibre, { StyleSpecification } from 'maplibre-gl';
import { MapLayer } from './Map/MapLayer';

import './Map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import mapStyle from './assets/style.json';

type Props = {
  mapLayers: MapLayer[]
};

export default function Map(props: Props) {
  const { mapLayers } = props;
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibre.Map | null>(null)

  // Setup Maplibre
  useEffect(() => {
    const newMap = new maplibre.Map({
      container: mapRef.current as HTMLElement,
      // projection: 'globe',
      style: mapStyle as StyleSpecification,
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

  // Add map layers
  useEffect(() => {
    if (!map) return;

    const oldIds = new Set(map.getLayersOrder());
    const newIds = new Set(mapLayers.map(layer => layer.id));

    const layers = map.getLayersOrder()
      .map(id => map.getLayer(id)!)
      .filter(layer => layer.type == "custom");

    // Remove layers which are no longer in mapLayers state
    for (const layer of layers) {
      if (!newIds.has(layer.id)) {
        map.removeLayer(layer.id);
      }
    }

    // Add layers which were added to mapLayers state
    for (const mapLayer of mapLayers) {
      if (!oldIds.has(mapLayer.id)) {
        map.addLayer(mapLayer);
      }
    }
  }, [map, mapLayers]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
