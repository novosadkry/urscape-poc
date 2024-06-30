import { useState } from 'react';
import { store } from './ReduxStore';
import { Provider } from 'react-redux';
import { Map } from 'maplibre-gl';

import Gui from './gui';
import MapView from './MapView';
import DataLoader from './DataLoader';
import LayerController from './LayerController';

import './App.css';

function App() {
  const [map, setMap] = useState<Map | null>(null);

  return (
    <Provider store={store}>
      <MapView
        setMap={setMap} />
      <DataLoader />
      <LayerController
        map={map} />
      <Gui />
    </Provider>
  )
}

export default App;
