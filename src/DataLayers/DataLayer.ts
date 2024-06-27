import { Patch } from "./Patch";

export class DataLayer {
  public name: string;
  public active: boolean;
  public patches: Patch[];

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

  constructor(name: string) {
    this.name = name;
    this.active = false;
    this.patches = [];
  }
}
