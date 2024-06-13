
import './gui.css';

const onLayerClicked = (layer: string) => {
   alert("TODO - toggle " + layer);
  }

export default function Gui() {

  const buttonArray: string[] = [];
  for (let i = 1; i < 4; i++) {
    buttonArray.push(" layer " + i.toString());
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
