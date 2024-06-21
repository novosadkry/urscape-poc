import { GridData, parseData } from "./GridData";
import { Patch, PatchConstants, parseHeader } from "./Patch";

export interface GridPatch extends Patch {
  data: GridData;
}

export async function parseGrid(filename: string): Promise<GridPatch> {
  const base = window.location.origin + import.meta.env.BASE_URL;
  const url = new URL(PatchConstants.PATCH_PATH + filename, base);

  const response = await fetch(url.href);
  if (!response.ok) throw Error(response.statusText);

  const header = parseHeader(filename);
  if (!header) throw Error("Invalid filename format");

  const data = await parseData(await response.text());

  return { header, data };
}