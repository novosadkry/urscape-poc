import { PatchData } from "./PatchData";

export const PatchConstants = {
  PATCH_PATH: "./data/"
}

export type PatchLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type PatchHeader = {
  level: PatchLevel;
  name: string;
  filename: string;
  date: Date;
}

export interface Patch {
  header: PatchHeader;
  data?: PatchData;
}

export function parseHeader(filename: string): PatchHeader | null {
  const regex = new RegExp("^(.*?)_(.*?)_(.*?)@(.*?)_(.*?)_(.*?)\\.csv$");
  const values = regex.exec(filename);

  if (!values) return null;

  const name = values[1];
  const level = values[2] as PatchLevel;
  const date = new Date(); // TODO

  return {
    level,
    name,
    filename,
    date,
  }
}
