import { parse } from "csv-parse";
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

  const response = await fetch(url);
  if (!response.ok) throw Error(response.statusText);

  const header = parseHeader(filename);
  if (!header) throw Error("Invalid filename format");

  const blob = await response.text();
  const data = await parseCSV(blob);

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

export async function parseCSV(input: string): Promise<GridData> {
  const parser = parse({
    encoding: "utf16le",
    delimiter: ",",
    trim: true,
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true
  });

  // Get rid of UTF-16 BOM bytes
  parser.write(input.slice(2));
  parser.end();

  const metadata: PatchMetadata = {};
  const values: number[] = [];
  const mask: number[] = [];
  let section: PatchDataSection | null = null;

  for await (const record of parser) {
    const [key, value] = record;

    if (key == "METADATA") {
      section = value == "TRUE"
        ? PatchDataSection.Metadata
        : section;

      continue;
    }
    else if (key == "CATEGORIES") {
      section = value == "TRUE"
        ? PatchDataSection.Categories
        : section;

      continue;
    }
    else if (key == "VALUE" && value == "MASK") {
      section = PatchDataSection.Values
      continue;
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

  const [min, max] = getMinMax(values);

  return {
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
  };
}

self.onmessage = async (e: MessageEvent<PatchRequest>) => {
  const patch = await parseGrid(e.data);
  self.postMessage(patch);
};
