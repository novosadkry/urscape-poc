import { Patch } from "./Patch";
import { Color } from "../Map/Color";

export class DataLayer {
  public name: string;
  public active: boolean;
  public patches: Patch[];
  public tint: Color;

  constructor(name: string, tint: Color) {
    this.name = name;
    this.active = false;
    this.patches = [];
    this.tint = tint;
  }

  public getMinMaxValue(): [number, number] {
    let min = +Infinity;
    let max = -Infinity;

    for (const patch of this.patches) {
      if (!patch.data) continue;
      min = patch.data.minValue < min ? patch.data.minValue : min;
      max = patch.data.maxValue > max ? patch.data.maxValue : max;
    }

    return [min, max];
  }
}
