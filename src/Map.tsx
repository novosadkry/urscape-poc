import { useRef, useEffect } from 'react';
import maplibre from 'maplibre-gl';
import { GridLayer } from './GridLayer';
import mapStyle from './MapStyle';

import './Map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = new maplibre.Map({
      container: mapRef.current as HTMLElement,
      // projection: 'globe',
      style: mapStyle,
      center: [0, 0],
      zoom: 0,
      antialias: true
    });

    // Add custom layer to the map
    const gridLayer = new GridLayer();
    map.on('load', () => {
      map.addLayer(gridLayer);
    });

    // Clean-up function
    return () => {
      map.remove();
    }
  }, []);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapRef} />
    </div>
  );
}
