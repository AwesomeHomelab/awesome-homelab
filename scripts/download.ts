import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Pin } from "./config.ts";
import { sha256 } from "./registry.ts";
import { writeAtomic } from "./files.ts";

export const cacheDir = resolve(import.meta.dirname, "../.cache");

export async function download(
  { url, sha256: expected }: Pick<Pin, "url"> & Partial<Pin>,
  extension: string,
): Promise<{ bytes: Buffer; path: string }> {
  const directory = join(cacheDir, "downloads");
  const cachedPath =
    expected === undefined ? undefined : join(directory, `${expected}.${extension}`);
  const cached = cachedPath !== undefined && existsSync(cachedPath);
  let bytes: Buffer;
  if (cached) {
    bytes = await readFile(cachedPath);
  } else {
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 200) throw new Error(`Download failed (${response.status}): ${url}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const hash = sha256(bytes);
  if (expected !== undefined && hash !== expected) throw new Error(`SHA-256 mismatch: ${url}`);
  const path = join(directory, `${hash}.${extension}`);
  if (!cached) await writeAtomic(path, bytes);
  return { bytes, path };
}
