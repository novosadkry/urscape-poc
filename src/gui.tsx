import { Dispatch, SetStateAction } from 'react';

import './gui.css';
import { DataLayer } from './DataLayers/DataLayer';

type Props = {
  dataLayers: DataLayer[]
  setDataLayers: Dispatch<SetStateAction<DataLayer[]>>
};

export default function Gui(props: Props) {
  const { dataLayers: layers, setDataLayers: setLayers } = props;
  const locations: DataLayer[] = [];
  const onLayerClicked = (layer: DataLayer) => {

    // React compares references instead of full equality,
    // we need to copy values to a new array to cause rerender
    layer.active = !layer.active;
    setLayers([...layers]);
  }

  const addButton = (layer: DataLayer) => {
    return (
      <button className={"layer-button " + (layer.active ? "active" : "")} key={layer.name} onClick={() => onLayerClicked(layer)}>
        {layer.name.charAt(0).toUpperCase() + layer.name.slice(1)}
      </button>
    );
  };
  const drawGUI = () => {
    return (
      <div className="left-panel">
        <div className="left-layers">
          <div className="header"> {"DataLayers"} </div>
          <div className="container">
            { layers.map((layer) => addButton(layer)) }
          </div>
          <div className="left-locations">
            <div className="header"> {"Locations"} </div>
            <div className="container">
              { locations.map((location) => addButton(location)) }
            </div>
          </div>
        </div>


      </div>
    );
  };

  return (
    <div>
      { drawGUI() }
    </div>
  );
}
