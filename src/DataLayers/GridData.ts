import { parse } from 'csv-parse';

enum GridDataSection {
  Metadata,
  Categories,
  Values
}

export type GridMetadata = {
  [key: string]: string | number | boolean;
};

export type GridValue = {
  value: number;
  mask: number;
};

export type GridData = {
  metadata: GridMetadata;
  values: GridValue[];
};

export function parseCSV(input: string): Promise<GridData> {
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

      const metadata: GridMetadata = {};
      const values: GridValue[] = [];
      let section: GridDataSection | null = null;

      for (const record of records) {
        const [key, value] = record;

        if (key == 'METADATA') {
          section = value == 'TRUE'
            ? GridDataSection.Metadata
            : section;

          continue;
        }
        else if (key == 'CATEGORIES') {
          section = value == 'TRUE'
            ? GridDataSection.Categories
            : section;

          continue;
        }
        else if (key == 'VALUE' && value == 'MASK') {
          section = GridDataSection.Values
          continue;
        }

        switch (section) {
          case GridDataSection.Metadata:
            if (!isNaN(Number(value))) {
              metadata[key] = Number(value);
            } else if (value.trim().toUpperCase() === 'TRUE' || value.trim().toUpperCase() === 'FALSE') {
              metadata[key] = value.trim().toUpperCase() === 'TRUE';
            } else {
              metadata[key] = value;
            }
            break;
          case GridDataSection.Categories:
            throw new Error("Not implemented");
          case GridDataSection.Values:
            values.push({ value: parseInt(key), mask: parseInt(value) });
            break;
        }
      }

      resolve({ metadata, values });
    });
  });
}