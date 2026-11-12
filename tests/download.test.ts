import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

describe("downloads", () => {
  it("refreshes official tools and retains earlier snapshots", async () => {
    const tool = { url: `https://example.com/${randomUUID()}.mjs` };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("first"))
        .mockResolvedValueOnce(new Response("updated")),
    );
    const first = await download(tool, "mjs");
    const second = await download(tool, "mjs");
    try {
      expect(first.bytes.toString()).toBe("first");
      expect(second.bytes.toString()).toBe("updated");
      expect(await readFile(first.path, "utf8")).toBe("first");
      expect(await readFile(second.path, "utf8")).toBe("updated");
    } finally {
      await Promise.all([first, second].map(({ path }) => rm(path, { force: true })));
    }
  });

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
