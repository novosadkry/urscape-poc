import { PatchConstants } from "./Patch";

export type PatchRequest = {
  url: string;
  filename: string;
}

export function patchRequest(path: string): PatchRequest {
  const base = window.location.origin + import.meta.env.BASE_URL;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  const url = new URL(PatchConstants.PATCH_PATH + path, base).href;

  return { url, filename };
}
