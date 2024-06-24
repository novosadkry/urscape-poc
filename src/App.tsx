import { useState } from 'react';
import { Site } from './DataLayers/Site';
import { MapLayer } from './Map/MapLayer';
import { DataLayer } from './DataLayers/DataLayer';

import Map from './Map';
import Gui from './gui';
import DataLoader from './DataLoader';
import LayerController from './LayerController';

import './App.css';

function App() {
  const [sites, setSites] = useState<Site[]>([]);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([]);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);

  return (
    <>
      <Map mapLayers={mapLayers} />
      <DataLoader
        dataLayers={dataLayers}
        setSites={setSites}
        setDataLayers={setDataLayers} />
      <LayerController
        dataLayers={dataLayers}
        setMapLayers={setMapLayers} />
      <Gui
        sites={sites}
        setSites={setSites}
        dataLayers={dataLayers}
        setDataLayers={setDataLayers} />
    </>
  )
}

export default App;
