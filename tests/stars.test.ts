import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { buildStars } from "../scripts/build-stars.ts";

const directories: string[] = [];
const now = 1_800_000_000_000;
async function temporary() {
  const path = await mkdtemp(join(tmpdir(), "metrix-stars-"));
  directories.push(path);
  return path;
}
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("project stars", () => {
  it("fetches each repository once, authenticates, and refreshes after 24 hours", async () => {
    vi.stubEnv("GH_TOKEN", "test-token");
    const cache = await temporary();
    const upstream = vi.fn<typeof fetch>().mockImplementation(async (url) =>
      Response.json({
        stargazers_count: url === "https://api.github.com/repos/owner/shared" ? 1234 : 0,
      }),
    );
    const repositories = ["owner/shared", "owner/shared", "owner/zero"];
    const result = await buildStars(repositories, cache, upstream, now);
    expect(result).toEqual({ "owner/shared": 1234, "owner/zero": 0 });
    expect(upstream).toHaveBeenCalledTimes(2);
    expect(upstream).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/shared",
      expect.objectContaining({
        headers: { Accept: "application/vnd.github+json", Authorization: "Bearer test-token" },
        redirect: "error",
      }),
    );
    expect(await buildStars(repositories, cache, upstream, now + 86_399_999)).toEqual(result);
    expect(upstream).toHaveBeenCalledTimes(2);
    upstream.mockImplementation(async () => Response.json({ stargazers_count: 42 }));
    expect(await buildStars(repositories, cache, upstream, now + 86_400_000)).toEqual({
      "owner/shared": 42,
      "owner/zero": 42,
    });
    expect(upstream).toHaveBeenCalledTimes(4);
  });

  it("keeps stale zero counts, marks cold failures unknown, and retries on the next build", async () => {
    vi.stubEnv("GH_TOKEN", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const cache = await temporary();
    const upstream = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ stargazers_count: 0 }));
    await buildStars(["owner/zero"], cache, upstream, now);
    const repositories = ["owner/zero", "owner/unknown"];
    const later = now + 86_400_000;
    upstream.mockImplementation(async () => new Response("rate limited", { status: 403 }));
    expect(await buildStars(repositories, cache, upstream, later)).toEqual({
      "owner/zero": 0,
      "owner/unknown": null,
    });
    upstream.mockImplementation(async () => Response.json({ stargazers_count: 8 }));
    expect(await buildStars(repositories, cache, upstream, later)).toEqual({
      "owner/zero": 8,
      "owner/unknown": 8,
    });
    expect(upstream).toHaveBeenCalledTimes(5);
    expect(upstream.mock.calls[0]![1]!.headers).not.toHaveProperty("Authorization");
  });

  it.each([-1, 1.5, "42", undefined])("rejects invalid star counts: %s", async (stars) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const cache = await temporary();
    const upstream = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ stargazers_count: stars }));
    expect(await buildStars(["owner/repo"], cache, upstream, now)).toEqual({ "owner/repo": null });
  });

  it("uses fresh stars even when the local cache cannot be written", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const cache = await temporary();
    await writeFile(join(cache, "owner"), "blocks the cache directory");
    const upstream = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ stargazers_count: 42 }));
    expect(await buildStars(["owner/repo"], cache, upstream, now)).toEqual({ "owner/repo": 42 });
  });

  it.each(["not json", '{"stars":-1,"fetchedAt":1800000000000}'])(
    "replaces invalid cache data: %s",
    async (content) => {
      const cache = await temporary();
      await mkdir(join(cache, "owner"));
      const path = join(cache, "owner/repo.json");
      await writeFile(path, content);
      const upstream = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ stargazers_count: 42 }));
      expect(await buildStars(["owner/repo"], cache, upstream, now)).toEqual({ "owner/repo": 42 });
      expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ stars: 42, fetchedAt: now });
    },
  );

  it("does not block a build when GitHub is unreachable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const upstream = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    expect(await buildStars(["owner/repo"], await temporary(), upstream, now)).toEqual({
      "owner/repo": null,
    });
  });
});
