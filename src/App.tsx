import { useState } from 'react';
import Map from './Map';
import Gui from './gui';
import { MapLayer } from './Map/MapLayer';
import LayerController from './LayerController';

import './App.css';

function App() {
  const [layers, setLayers] = useState<MapLayer[]>([]);

  return (
    <>
      <Map layers={layers} />
      <LayerController
        layers={layers}
        setLayers={setLayers} />
      <Gui
        layers={layers}
        setLayers={setLayers} />
    </>
  )
}

export default App;
