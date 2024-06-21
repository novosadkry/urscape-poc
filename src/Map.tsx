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
    if (!map) return;

    const layers = map.getLayersOrder()
      .map(id => map.getLayer(id)!)
      .filter(layer => layer.type == 'custom');

    // Remove layers which are no longer in mapLayers state
    for (const layer of layers) {
      const match = mapLayers.find(x => x.id == layer.id);
      if (match) continue;

      map.removeLayer(layer.id);
    }

    // Add layers which were added to mapLayers state
    for (const mapLayer of mapLayers) {
      const match = map.getLayer(mapLayer.id);
      if (match) continue;

      map.addLayer(mapLayer);
    }
  }, [map, mapLayers]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
