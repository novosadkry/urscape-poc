import { Patch } from "./Patch";
import { Color } from "../Map/Color";

export interface DataLayer {
  id: string;
  name: string;
  active: boolean;
  patches: Patch[];
  tint: Color;
}

export function getMinMaxValue(layer: DataLayer): [number, number] {
  let min = +Infinity;
  let max = -Infinity;

  for (const patch of layer.patches) {
    if (!patch.data) continue;
    min = patch.data.minValue < min ? patch.data.minValue : min;
    max = patch.data.maxValue > max ? patch.data.maxValue : max;
  }

  return [min, max];
}
