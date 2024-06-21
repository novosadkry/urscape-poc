import { useState } from 'react';
import Map from './Map';
import Gui from './gui';
import { MapLayer } from './Map/MapLayer';
import { DataLayer } from './DataLayers/DataLayer';
import LayerController from './LayerController';

import './App.css';

function App() {
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([]);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([]);

  return (
    <>
      <Map mapLayers={mapLayers} />
      <LayerController
        dataLayers={dataLayers}
        setDataLayers={setDataLayers}
        setMapLayers={setMapLayers} />
      <Gui
        dataLayers={dataLayers}
        setDataLayers={setDataLayers} />
    </>
  )
}

export default App;
