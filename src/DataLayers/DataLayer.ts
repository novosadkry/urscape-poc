import { Patch } from "./Patch";

export class DataLayer {
  public name: string;
  public active: boolean;
  public patches: Patch[];

  constructor(name: string) {
    this.name = name;
    this.active = false;
    this.patches = [];
  }
}
