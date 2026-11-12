import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { authors, avatarPath } from "../src/authors.ts";
import { buildAvatars } from "../scripts/build-avatars.ts";

const directories: string[] = [];
async function temporary() {
  const root = await mkdtemp(join(tmpdir(), "metrix-avatars-"));
  directories.push(root);
  return { cache: join(root, "cache"), output: join(root, "output") };
}
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("author avatars", () => {
  it("uses GitHub usernames with Unavatar and rejects unknown authors", () => {
    expect(authors.find(({ name }) => name === "baranwang")?.url).toBe(
      "https://unavatar.webp.se/github/baranwang",
    );
    expect(avatarPath("baranwang")).toBe("/avatars/baranwang.webp");
    for (const author of ["unknown", "constructor", "__proto__", "https://example.com"])
      expect(avatarPath(author)).toBeUndefined();
  });

  it("publishes local WebP files, reuses warm downloads, and refreshes after a day", async () => {
    const { cache, output } = await temporary();
    const bytes = new Uint8Array([1, 2, 3]);
    const upstream = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () => new Response(bytes, { headers: { "Content-Type": "image/webp" } }),
      );
    await buildAvatars(cache, output, upstream);
    expect(upstream).toHaveBeenCalledTimes(authors.length);
    expect(upstream).toHaveBeenCalledWith(
      "https://unavatar.webp.se/github/baranwang",
      expect.objectContaining({ headers: { Accept: "image/webp" }, redirect: "error" }),
    );
    expect(new Uint8Array(await readFile(join(output, "baranwang.webp")))).toEqual(bytes);
    await buildAvatars(cache, output, upstream);
    expect(upstream).toHaveBeenCalledTimes(authors.length);
    await buildAvatars(cache, output, upstream, Date.now() + 86_401_000);
    expect(upstream).toHaveBeenCalledTimes(authors.length * 2);
  });

  it("keeps expired avatars when refreshing fails and retries on the next build", async () => {
    const { cache, output } = await temporary();
    const bytes = new Uint8Array([1, 2, 3]);
    const upstream = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () => new Response(bytes, { headers: { "Content-Type": "image/webp" } }),
      );
    await buildAvatars(cache, output, upstream);
    const later = Date.now() + 86_401_000;
    upstream.mockRejectedValue(new Error("service unavailable"));
    await buildAvatars(cache, output, upstream, later);
    expect(new Uint8Array(await readFile(join(output, "baranwang.webp")))).toEqual(bytes);
    const refreshed = new Uint8Array([4, 5, 6]);
    upstream.mockImplementation(
      async () => new Response(refreshed, { headers: { "Content-Type": "image/webp" } }),
    );
    await buildAvatars(cache, output, upstream, later);
    expect(upstream).toHaveBeenCalledTimes(authors.length * 3);
    expect(new Uint8Array(await readFile(join(output, "baranwang.webp")))).toEqual(refreshed);
  });

  it("rejects upstream errors and HTML instead of publishing them as avatars", async () => {
    const { cache, output } = await temporary();
    for (const response of [
      new Response("denied", { status: 403 }),
      new Response("html", { headers: { "Content-Type": "text/html" } }),
      new Response(null, { headers: { "Content-Type": "image/webp" } }),
    ]) {
      await expect(
        buildAvatars(cache, output, vi.fn<typeof fetch>().mockResolvedValue(response)),
      ).rejects.toThrow(/avatar/i);
    }
    await expect(readFile(join(output, "baranwang.webp"))).rejects.toThrow();
  });
});
