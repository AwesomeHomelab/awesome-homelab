import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Pin } from "./config.ts";
import { sha256 } from "./registry.ts";
import { writeAtomic } from "./files.ts";

export const cacheDir = resolve(import.meta.dirname, "../.cache");

export async function download(
  pin: Pin,
  extension: string,
): Promise<{ bytes: Buffer; path: string }> {
  const directory = join(cacheDir, "downloads");
  const path = join(directory, `${pin.sha256}.${extension}`);
  const cached = existsSync(path);
  let bytes: Buffer;
  if (cached) {
    bytes = await readFile(path);
  } else {
    const response = await fetch(pin.url, {
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 200)
      throw new Error(`Download failed (${response.status}): ${pin.url}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (sha256(bytes) !== pin.sha256) throw new Error(`SHA-256 mismatch: ${pin.url}`);
  if (!cached) await writeAtomic(path, bytes);
  return { bytes, path };
}
