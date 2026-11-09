import registry from "../src/registry-handler.ts";
import { describe, expect, it, vi } from "vite-plus/test";
import { createHandler } from "../src/handler.ts";
import type { Manifest } from "../src/registry.ts";

const bytes = new TextEncoder().encode('\uFEFF<bar title="中文">\r\n</bar>\r\n');
const hash = "a65bab29f5ad8b7926d4aa0278112a41fce712f4b510555fbf9826603f4ba66c";
const path = `/dashboards/files/${hash}/sample.bar`;
const manifest: Manifest = {
  registryURL: "https://awesome.metrix.bar/dashboards/index.json",
  registry: {
    $schema: "https://metrix.bar/dashboards/schema.json",
    schema_version: 1,
    id: "awesome",
    name: "Awesome",
    dashboards: [],
  },
  indexETag: '"index-digest"',
  assets: {
    [path]: {
      url: `https://raw.githubusercontent.com/author/repo/${"a".repeat(40)}/sample.bar`,
      sha256: hash,
      contentType: "application/octet-stream",
    },
    [`/dashboards/icons/${hash}`]: {
      url: "https://example.com/icon.svg",
      sha256: hash,
      contentType: "image/svg+xml",
    },
  },
};

function request(resource: string, init?: RequestInit): Request {
  return new Request(`https://awesome.metrix.bar${resource}`, init);
}

describe("registry HTTP behavior in Workers", () => {
  it("serves the generated registry through the registry handler", async () => {
    const response = await registry.fetch(
      new Request("https://awesome.metrix.bar/dashboards/index.json"),
    );
    expect(response.status).toBe(200);
    const index = await response.json<{ id: string; dashboards: unknown[] }>();
    expect(index.id).toBe("awesome");
    expect(index.dashboards.length).toBeGreaterThanOrEqual(8);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60, s-maxage=300");
    expect(response.headers.get("ETag")).toMatch(/^"[a-f0-9]{64}"$/);
  });

  it("returns exact upstream bytes with immutable caching and a pinned URL", async () => {
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response(bytes));
    const response = await createHandler(manifest, upstream)(request(path));
    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("Location")).toBeNull();
    expect(upstream).toHaveBeenCalledWith(
      manifest.assets[path]!.url,
      expect.objectContaining({ redirect: "manual" }),
    );
  });

  it("serves mapped icons from the same origin", async () => {
    const iconPath = Object.keys(manifest.assets).find((key) => key.includes("/icons/"))!;
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response(bytes));
    const response = await createHandler(manifest, upstream)(request(iconPath));
    expect(response.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });

  it("answers HEAD and conditional requests without downloading again", async () => {
    const upstream = vi.fn<typeof fetch>();
    const handler = createHandler(manifest, upstream);
    const head = await handler(request(path, { method: "HEAD" }));
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
    const response = await handler(
      request(path, { headers: { "If-None-Match": `W/${head.headers.get("ETag")}` } }),
    );
    expect(response.status).toBe(304);
    expect(await response.text()).toBe("");
    expect(upstream).not.toHaveBeenCalled();
    const index = await handler(
      request("/dashboards/index.json", { headers: { "If-None-Match": manifest.indexETag } }),
    );
    expect(index.status).toBe(304);
    const indexHead = await handler(request("/dashboards/index.json", { method: "HEAD" }));
    expect(await indexHead.text()).toBe("");
  });

  it("rejects unknown files and arbitrary proxy targets without fetching", async () => {
    const upstream = vi.fn<typeof fetch>();
    const handler = createHandler(manifest, upstream);
    for (const resource of [
      "/dashboards/missing.bar",
      "/proxy?url=https://example.com/a.bar",
      "/dashboards/files/%2fetc/passwd.bar",
      "/constructor",
      "/__proto__",
    ]) {
      const response = await handler(request(resource));
      expect(response.status).toBe(404);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    }
    const post = await handler(request(path, { method: "POST" }));
    expect(post.status).toBe(405);
    expect(post.headers.get("Allow")).toBe("GET, HEAD");
    expect(upstream).not.toHaveBeenCalled();
  });

  it.each([404, 500, 302, 206])(
    "does not cache unsuccessful upstream status %s",
    async (status) => {
      const upstream = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("upstream error", { status }));
      const response = await createHandler(manifest, upstream)(request(path));
      expect(response.status).toBe(502);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    },
  );

  it.each([path, `/dashboards/icons/${hash}`])(
    "rejects changed bytes and network errors for %s",
    async (resource) => {
      const upstream = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response("changed bytes"))
        .mockRejectedValueOnce(new Error("network failure"));
      const handler = createHandler(manifest, upstream);
      const changed = await handler(request(resource));
      expect(changed.status).toBe(502);
      expect(await changed.text()).toBe("Upstream unavailable");
      expect(changed.headers.get("Cache-Control")).toBe("no-store");
      const failed = await handler(request(resource));
      expect(failed.status).toBe(502);
      expect(failed.headers.get("Cache-Control")).toBe("no-store");
    },
  );
});
