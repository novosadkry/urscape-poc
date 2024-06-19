import { Dispatch, SetStateAction } from 'react';

import './gui.css';
import { Layer } from './DataLayers/Layer';

type Props = {
  layers: Layer[]
  setLayers: Dispatch<SetStateAction<Layer[]>>
};

export default function Gui(props: Props) {
  const { layers, setLayers } = props;

  const buttonArray: string[] = [];
  layers.forEach(layer => {
    buttonArray.push(" layer " + layer.id);
  });

  const onLayerClicked = (layer: string) => {
    alert("TODO - toggle " + layer);

    // React compares references instead of full equality,
    // we need to copy values to a new array to cause rerender
    layers[0].active = false;
    setLayers([...layers]);

    // TODO:
    // 1. Get which layer was clicked from layers
    // 2. Switch the layer.active property
    // 3. Save layers with setLayers function
  }

  const addButton = (layer: string, i: number) => {
    return (
      <button className="layer-button" key={layer} onClick={() => onLayerClicked(layer)} style={{ top: 30 * i }}>
        {layer}
      </button>
    );
  };

  return (
    <div>
      {buttonArray.map((layer, i) => addButton(layer, i))}
    </div>
  );
}
