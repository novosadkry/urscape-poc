import {
  useRef, useEffect,
  SetStateAction, Dispatch
} from 'react';

import { Map, StyleSpecification } from 'maplibre-gl';

import './Map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import mapStyle from './assets/style.json';

type Props = {
  setMap: Dispatch<SetStateAction<Map | null>>
};

export default function MapView(props: Props) {
  const { setMap } = props;
  const mapDiv = useRef<HTMLDivElement>(null);

  // Setup Maplibre
  useEffect(() => {
    const newMap = new Map({
      container: mapDiv.current as HTMLElement,
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
  }, [setMap]);

  return (
    <div className="map-wrap">
      <div className="map" ref={mapDiv} />
    </div>
  );
}
