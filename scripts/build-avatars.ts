import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { authors } from "../src/authors.ts";
import { writeAtomic } from "./files.ts";

const root = resolve(import.meta.dirname, "..");
const maxAge = 86_400_000;

async function fetchAvatar(url: string, fetchUpstream: typeof fetch): Promise<Uint8Array> {
  const response = await fetchUpstream(url, {
    headers: { Accept: "image/webp" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (
    response.status !== 200 ||
    response.headers.get("Content-Type")?.split(";")[0] !== "image/webp"
  ) {
    throw new Error(
      `Expected a WebP avatar, received ${response.status} ${response.headers.get("Content-Type")}`,
    );
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error("Empty avatar");
  return bytes;
}

export async function buildAvatars(
  cache = join(root, ".cache/avatars"),
  output = join(root, "public/avatars"),
  fetchUpstream: typeof fetch = fetch,
  now = Date.now(),
): Promise<void> {
  for (const author of authors) {
    const path = join(cache, author.file);
    const cached = existsSync(path) ? await readFile(path) : undefined;
    let bytes: Uint8Array;
    if (cached && now - (await stat(path)).mtimeMs < maxAge) {
      bytes = cached;
    } else {
      try {
        bytes = await fetchAvatar(author.url, fetchUpstream);
      } catch (error) {
        if (!cached) throw error;
        console.warn(`Avatar refresh failed; using cached ${author.name}.`, error);
        bytes = cached;
      }
    }
    if (bytes !== cached) await writeAtomic(path, bytes);
    await writeAtomic(join(output, author.file), bytes);
  }
}

if (import.meta.main) {
  await buildAvatars();
  console.log(`Prepared ${authors.length} author avatars from WebP.se.`);
}
