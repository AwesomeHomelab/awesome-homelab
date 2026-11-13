import { describe, expect, it } from "vite-plus/test";
import sources from "../registry/sources.json";
import { validateSources } from "../scripts/config.ts";
import type { Source } from "../scripts/config.ts";

function source(): Source {
  return structuredClone(sources.dashboards[0]!);
}

function withReleases(item: Source) {
  return { ...sources, dashboards: [item] };
}

describe("source configuration", () => {
  it("accepts a version increase while retaining older releases", () => {
    const item = source();
    item.releases.push({ commit: "b".repeat(40), version: "2.0.0", sha256: "b".repeat(64) });
    expect(validateSources(withReleases(item)).dashboards[0]!.releases).toHaveLength(2);
  });

  it("rejects changed bytes at the same version", () => {
    const item = source();
    item.releases.push({ ...item.releases[0]!, commit: "b".repeat(40), sha256: "b".repeat(64) });
    expect(() => validateSources(withReleases(item))).toThrow("Same version has different bytes");
  });

  it("allows an unchanged file at a newer commit", () => {
    const item = source();
    item.releases.push({ ...item.releases[0]!, commit: "b".repeat(40) });
    expect(() => validateSources(withReleases(item))).not.toThrow();
  });

  it.each(["2.0.0+build.4", "2.0.0-beta.1+build.4"])("accepts strict SemVer %s", (version) => {
    const item = source();
    item.releases.push({ commit: "b".repeat(40), version, sha256: "b".repeat(64) });
    expect(() => validateSources(withReleases(item))).not.toThrow();
  });

  it("requires a precedence increase when build metadata and bytes change", () => {
    const item = source();
    item.releases[0]!.version = "2.0.0+first";
    item.releases.push({ commit: "b".repeat(40), version: "2.0.0+second", sha256: "b".repeat(64) });
    expect(() => validateSources(withReleases(item))).toThrow("Same version has different bytes");
  });

  it.each(["v1.0.0", "1.0", "1.0.0 ", " 1.0.0", "01.0.0", "1.0.0+"])(
    "rejects non-strict SemVer %s in release history",
    (version) => {
      const item = source();
      item.releases.push({ ...item.releases[0]!, version });
      expect(() => validateSources(withReleases(item))).toThrow("Invalid SemVer");
    },
  );

  it("rejects a rollback, duplicate IDs, and unpinned refs", () => {
    const item = source();
    item.releases.push({ ...item.releases[0]!, version: "0.1.0" });
    expect(() => validateSources(withReleases(item))).toThrow("Version rollback");
    expect(() => validateSources({ ...sources, dashboards: [source(), source()] })).toThrow(
      "duplicate source id",
    );
    const unpinned = source();
    unpinned.releases[0]!.commit = "main";
    expect(() => validateSources(withReleases(unpinned))).toThrow("full commit");
  });

  it.each([
    { ...sources, tools: undefined },
    { ...sources, dashboards: [{ ...source(), releases: [] }] },
    { ...sources, dashboards: [{ ...source(), release: [] }] },
    { ...sources, registry: { ...sources.registry, origin: "http://example.com" } },
    { ...sources, registry: { ...sources.registry, origin: "https://example.com/path" } },
    {
      ...sources,
      tools: { ...sources.tools, builder: { ...sources.tools.builder, sha256: "invalid" } },
    },
  ])("rejects missing, misspelled, or invalid fields %#", (config) => {
    expect(() => validateSources(config)).toThrow();
  });

  it.each(["/a.bar", "../a.bar", "a/../b.bar", "a\\b.bar", "a.bar?x=1", "a.bar\n", "a//b.bar"])(
    "rejects unsafe source path %j",
    (path) => {
      expect(() => validateSources({ ...sources, dashboards: [{ ...source(), path }] })).toThrow(
        "Invalid source path",
      );
    },
  );
});
