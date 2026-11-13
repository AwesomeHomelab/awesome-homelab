import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vite-plus/test";
import sources from "../registry/sources.json";
import generated from "../.generated/manifest.json";
import { completeEntry, sha256, validateRegistry } from "../scripts/registry.ts";
import { download } from "../scripts/download.ts";
import { buildRegistry } from "../scripts/build-registry.ts";
import { parseBar } from "../scripts/parse-bar.ts";
import type { Source } from "../scripts/config.ts";
import type { Manifest, Registry } from "../src/registry.ts";

vi.mock("../scripts/build-stars.ts", () => ({
  buildStars: async (repositories: string[]) =>
    Object.fromEntries(repositories.map((repository) => [repository, 120])),
}));

const manifest: Manifest = generated;

const [builder, schemaFile] = await Promise.all([
  download(sources.tools.builder, "mjs"),
  download(sources.tools.schema, "json"),
]);
const schema = JSON.parse(schemaFile.bytes.toString()) as object;

describe("registry generation", () => {
  it("uses file metadata, preserves raw bytes, and supplements a missing license", async () => {
    const raw = Buffer.from(
      '<bar protocol-version="0" id="sample" title="Sample" version="1.2.3">\r\n<docs>Line one\nLine two</docs>\n<script><![CDATA[throw new Error("must not execute");]]></script>\n</bar>\r\n',
    );
    const parsed = await parseBar(builder.path, raw, "sample.bar", "sample");
    const item: Source = {
      id: "sample",
      repository: "author/sample",
      path: "sample.bar",
      author: "author",
      license: "Apache-2.0",
      releases: [],
    };
    const release = { commit: "a".repeat(40), version: "1.2.3", sha256: sha256(raw) };
    const entry = completeEntry(parsed, item, release);
    expect(entry.version).toBe("1.2.3");
    expect(entry.docs).toBe("Line one\nLine two");
    expect(entry.license).toBe("Apache-2.0");
    expect(entry.sha256).toBe(sha256(raw));
    expect(entry.source).toContain(release.commit);
    expect(() => completeEntry(parsed, item, { ...release, version: "0.0.0" })).toThrow("metadata");
    expect(() => completeEntry({ ...parsed, protocol_version: "1" }, item, release)).toThrow(
      "Unsupported dashboard protocol",
    );
    expect(completeEntry({ ...parsed, license: "MIT" }, item, release).license).toBe("MIT");
  });

  it("retains historical routes and publishes atomically during concurrent builds", async () => {
    const output = await mkdtemp(join(tmpdir(), "metrix-registry-history-"));
    const icon = {
      url: "https://example.com/icon.svg",
      sha256: sha256("<svg/>"),
      contentType: "image/svg+xml",
    };
    await writeFile(`.cache/downloads/${icon.sha256}.icon`, "<svg/>");
    const releases = [];
    for (const [index, version] of ["1.0.0", "1.1.0"].entries()) {
      const raw = Buffer.from(
        `<bar protocol-version="0" id="sample-history" title="History" version="${version}" icon="${icon.url}"><script>export default {};</script></bar>`,
      );
      const hash = sha256(raw);
      await writeFile(`.cache/downloads/${hash}.bar`, raw);
      releases.push({ commit: (index ? "b" : "a").repeat(40), version, sha256: hash, icon });
    }
    const item: Source = {
      id: "sample-history",
      repository: "author/history",
      path: "history.bar",
      author: "author",
      license: "MIT",
      releases,
    };
    try {
      const [result] = await Promise.all([
        buildRegistry({ ...sources, dashboards: [item] }, output),
        buildRegistry({ ...sources, dashboards: [item] }, output),
      ]);
      expect(JSON.parse(await readFile(join(output, "manifest.json"), "utf8"))).toEqual(result);
      expect(result.registry.dashboards).toHaveLength(1);
      expect(result.dashboardRepositories).toEqual({ "sample-history": "author/history" });
      expect(result.projectStars).toEqual({ "author/history": 120 });
      expect(result.registry).not.toHaveProperty("projectStars");
      expect(result.registry.dashboards[0]!.version).toBe("1.1.0");
      expect(Object.keys(result.assets)).toHaveLength(3);
      expect(result.registry.dashboards[0]!.icon).toBe(
        `${sources.registry.origin}/dashboards/icons/${icon.sha256}`,
      );
      expect(result.assets[`/dashboards/icons/${icon.sha256}`]).toEqual(icon);
      const published = await readFile(join(output, "manifest.json"), "utf8");
      await expect(
        buildRegistry(
          {
            ...sources,
            dashboards: [{ ...item, releases: [{ ...releases[0], icon: undefined }] }],
          },
          output,
        ),
      ).rejects.toThrow("Remote icon needs a pinned release.icon");
      expect(await readFile(join(output, "manifest.json"), "utf8")).toBe(published);
      for (const release of releases) {
        const path = `/dashboards/files/${release.sha256}/history.bar`;
        expect(result.assets[path]!.url).toContain(release.commit);
        expect(result.assets[path]!.sha256).toBe(release.sha256);
      }
    } finally {
      await rm(output, { recursive: true, force: true });
    }
  });

  it("publishes each configured latest release with same-origin immutable paths", () => {
    expect(() => validateRegistry(manifest.registry, schema)).not.toThrow();
    expect(manifest.registry.dashboards).toHaveLength(sources.dashboards.length);
    for (const item of sources.dashboards) {
      const entry = manifest.registry.dashboards.find(({ id }) => id === item.id)!;
      const release = item.releases.at(-1)!;
      expect(entry.version).toBe(release.version);
      expect(entry.sha256).toBe(release.sha256);
      const url = new URL(entry.file, `${sources.registry.origin}/dashboards/index.json`);
      expect(url.origin).toBe(sources.registry.origin);
      const assets = manifest.assets;
      expect(assets[url.pathname]!.sha256).toBe(entry.sha256);
      expect(assets[url.pathname]!.url).toContain(release.commit);
      if (entry.icon?.startsWith("https:")) {
        const icon = new URL(entry.icon);
        expect(icon.origin).toBe(sources.registry.origin);
        expect(assets[icon.pathname]).toBeDefined();
      }
    }
    const index = `${JSON.stringify(manifest.registry, null, 2)}\n`;
    expect(manifest.indexETag).toBe(`"${sha256(index)}"`);
  });

  it("rejects duplicate entries and unsafe file paths", () => {
    const registry: Registry = structuredClone(manifest.registry);
    registry.dashboards.push(registry.dashboards[0]!);
    expect(() => validateRegistry(registry, schema)).toThrow("Duplicate dashboard id");
    for (const file of [
      "https://evil.example/a.bar",
      "/a.bar",
      "files/../a.bar",
      "files/%2e%2e/a.bar",
      "files/a.bar?x=1",
    ]) {
      const invalid = structuredClone(manifest.registry);
      invalid.dashboards[0] = { ...invalid.dashboards[0]!, file };
      expect(() => validateRegistry(invalid, schema)).toThrow();
    }
  });
});
