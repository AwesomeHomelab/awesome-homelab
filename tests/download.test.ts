import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cacheDir, download } from "../scripts/download.ts";
import { sha256 } from "../scripts/registry.ts";

const directory = join(cacheDir, "downloads");

function fixture() {
  const bytes = Buffer.from(randomUUID());
  const pin = { url: "https://example.com/pinned.bar", sha256: sha256(bytes) };
  return { bytes, pin, path: join(directory, `${pin.sha256}.bar`) };
}

afterEach(() => vi.unstubAllGlobals());

describe("pinned downloads", () => {
  it("reuses verified cached bytes without fetching", async () => {
    const { bytes, pin, path } = fixture();
    await mkdir(directory, { recursive: true });
    await writeFile(path, bytes);
    const fetch = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal("fetch", fetch);
    try {
      expect((await download(pin, "bar")).bytes).toEqual(bytes);
      expect(fetch).not.toHaveBeenCalled();
      await writeFile(path, "corrupted cache");
      await expect(download(pin, "bar")).rejects.toThrow("SHA-256 mismatch");
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await rm(path, { force: true });
    }
  });

  it("downloads and verifies bytes before making them reusable", async () => {
    const { bytes, pin, path } = fixture();
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(bytes));
    vi.stubGlobal("fetch", fetch);
    try {
      expect((await download(pin, "bar")).bytes).toEqual(bytes);
      expect((await download(pin, "bar")).bytes).toEqual(bytes);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      await rm(path, { force: true });
    }
  });

  it("rejects changed upstream bytes without caching them", async () => {
    const { pin, path } = fixture();
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response("changed")));
    try {
      await expect(download(pin, "bar")).rejects.toThrow("SHA-256 mismatch");
      expect(existsSync(path)).toBe(false);
    } finally {
      await rm(path, { force: true });
    }
  });
});
