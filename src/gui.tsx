import { DataLayer } from './DataLayers/DataLayer';
import { toggleLayer } from './MapSlice';
import { useAppDispatch, useAppSelector } from './ReduxHooks';

import './gui.css';

export default function Gui() {
  const layers = useAppSelector(state => state.map.layers);
  const dispatch = useAppDispatch();

  const locations: DataLayer[] = [];
  const onLayerClicked = (layer: DataLayer) => {
    dispatch(toggleLayer(layer));
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
            { Object.values(layers).map((layer) => addButton(layer)) }
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
