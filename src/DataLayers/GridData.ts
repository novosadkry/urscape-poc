import { parse } from 'csv-parse';
import { getMinMax } from './DataUtils';
import { PatchData, PatchDataSection, PatchMetadata } from './PatchData';

export interface GridData extends PatchData {
  values: number[];
  mask: number[];
  countX: number,
  countY: number,
  minValue: number;
  maxValue: number;
}

export function parseData(input: string): Promise<GridData> {
  return new Promise((resolve, reject) => {
    parse(input, {
      delimiter: ',',
      columns: false,
      skip_empty_lines: true,
      trim: true
    }, (err: unknown, records: string[][]) => {
      if (err) {
        return reject(err);
      }

      const metadata: PatchMetadata = {};
      const values: number[] = [];
      const mask: number[] = [];
      let section: PatchDataSection | null = null;

      for (const record of records) {
        const [key, value] = record;

        if (key == 'METADATA') {
          section = value == 'TRUE'
            ? PatchDataSection.Metadata
            : section;

          continue;
        }
        else if (key == 'CATEGORIES') {
          section = value == 'TRUE'
            ? PatchDataSection.Categories
            : section;

          continue;
        }
        else if (key == 'VALUE' && value == 'MASK') {
          section = PatchDataSection.Values
          continue;
        }

        switch (section) {
          case PatchDataSection.Metadata:
            if (!isNaN(Number(value))) {
              metadata[key] = Number(value);
            } else if (value.trim().toUpperCase() === 'TRUE' || value.trim().toUpperCase() === 'FALSE') {
              metadata[key] = value.trim().toUpperCase() === 'TRUE';
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
    });
  });
}