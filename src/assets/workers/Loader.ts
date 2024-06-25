import { parse } from "papaparse";
import { GridData } from "../../DataLayers/GridData";
import { GridPatch } from "../../DataLayers/GridPatch";
import { PatchHeader, PatchLevel } from "../../DataLayers/Patch";
import { PatchDataSection, PatchMetadata } from "../../DataLayers/PatchData";
import { getMinMax } from "../../DataLayers/DataUtils";

export type PatchRequest = {
  url: string
  filename: string
};

export async function parseGrid(request: PatchRequest): Promise<GridPatch> {
  const { url, filename } = request;

  const header = parseHeader(filename);
  if (!header) throw Error("Invalid filename format");

  const data = await parseCSV(url);

  return { header, data };
}

export function parseHeader(filename: string): PatchHeader | null {
  const regex = new RegExp("^(.*?)_(.*?)_(.*?)@(.*?)_(.*?)_(.*?)\\.csv$");
  const values = regex.exec(filename);

  if (!values) return null;

  const name = values[1];
  const level = values[2] as PatchLevel;
  const site = values[3];
  const patch = parseInt(values[4]);
  const date = new Date(); // TODO

  return {
    level,
    name,
    site,
    patch,
    filename,
    date,
  }
}

export async function parseCSV(url: string): Promise<GridData> {
  const metadata: PatchMetadata = {};
  const values: number[] = [];
  const mask: number[] = [];
  let section: PatchDataSection | null = null;

  function parseRow(row: [string, string]) {
    const [key, value] = row;

    if (key == "METADATA") {
      section = value == "TRUE"
        ? PatchDataSection.Metadata
        : section;
      return;
    }
    else if (key == "CATEGORIES") {
      section = value == "TRUE"
        ? PatchDataSection.Categories
        : section;
      return;
    }
    else if (key == "VALUE" && value == "MASK") {
      section = PatchDataSection.Values
      return;
    }

    switch (section) {
      case PatchDataSection.Metadata:
        if (!isNaN(Number(value))) {
          metadata[key] = Number(value);
        } else if (value.trim().toUpperCase() === "TRUE" || value.trim().toUpperCase() === "FALSE") {
          metadata[key] = value.trim().toUpperCase() === "TRUE";
        } else {
          metadata[key] = value;
        }
        break;
      case PatchDataSection.Categories:
        throw new Error("Not implemented");
      case PatchDataSection.Values:
        values.push(parseInt(key));
        mask.push(parseInt(value));
        break;
    }
  }

  return new Promise((resolve, reject) => {
    parse(url, {
      download: true,
      encoding: "utf16le",
      step: function(row) {
        parseRow(row.data as [string, string]);
      },
      complete: function() {
        const [min, max] = getMinMax(values);
        resolve({
          metadata,
          bounds: {
            north: metadata["North"] as number,
            east: metadata["East"] as number,
            south: metadata["South"] as number,
            west: metadata["West"] as number,
          },
          values, mask,
          countX: metadata["Count X"] as number,
          countY: metadata["Count Y"] as number,
          minValue: min,
          maxValue: max,
        });
      },
      error: function(error) {
        reject(error);
      }
    });
  })
}

self.onmessage = async (e: MessageEvent<PatchRequest>) => {
  const patch = await parseGrid(e.data);
  self.postMessage(patch);
};
