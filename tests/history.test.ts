import { describe, expect, it } from "vite-plus/test";
import sources from "../registry/sources.json";
import { validateSources } from "../scripts/config.ts";
import { verifyHistory } from "../scripts/verify-history.ts";

function baseline() {
  return validateSources({
    ...sources,
    dashboards: [
      {
        ...sources.dashboards[0]!,
        path: "legacy/dashboard.bar",
        releases: [
          {
            version: "1.0.0",
            commit: "a".repeat(40),
            sha256: "a".repeat(64),
            icon: {
              url: "https://example.com/icon.png",
              sha256: "c".repeat(64),
              contentType: "image/png",
            },
          },
          { version: "2.0.0", commit: "b".repeat(40), sha256: "b".repeat(64) },
        ],
      },
    ],
  });
}

describe("published dashboard history", () => {
  it("allows unchanged history, new dashboards and appended releases", () => {
    const previous = baseline();
    const current = baseline();
    expect(() => verifyHistory(previous, current)).not.toThrow();
    current.dashboards[0]!.releases.push({
      version: "3.0.0",
      commit: "c".repeat(40),
      sha256: "c".repeat(64),
    });
    current.dashboards.push({ ...baseline().dashboards[0]!, id: "new-dashboard" });
    expect(() => verifyHistory(previous, validateSources(current))).not.toThrow();
  });

  it("rejects removing a published dashboard", () => {
    const current = baseline();
    current.dashboards = [];
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(
      "Published dashboard removed",
    );
  });

  it("rejects removing an old release even when the latest is unchanged", () => {
    const current = baseline();
    current.dashboards[0]!.releases.shift();
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(
      "Published release changed or removed",
    );
  });

  it.each(["sha256", "commit"] as const)("rejects changing an old %s", (field) => {
    const current = baseline();
    current.dashboards[0]!.releases[0]![field] = "d".repeat(field === "sha256" ? 64 : 40);
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(
      "Published release changed or removed",
    );
  });

  it.each(["path", "repository"] as const)("rejects breaking old upstream %s", (field) => {
    const current = baseline();
    current.dashboards[0]![field] = field === "path" ? "new/dashboard.bar" : "new/repository";
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(
      "Published release changed or removed",
    );
  });

  it("allows path migrations that preserve effective historical paths", () => {
    const current = baseline();
    const source = current.dashboards[0]!;
    for (const release of source.releases) release.path = source.path;
    source.path = "new/dashboard.bar";
    source.releases.push({ version: "3.0.0", commit: "c".repeat(40), sha256: "c".repeat(64) });
    expect(() => verifyHistory(baseline(), validateSources(current))).not.toThrow();
  });

  it("rejects changing a pinned historical icon", () => {
    const current = baseline();
    current.dashboards[0]!.releases[0]!.icon!.sha256 = "d".repeat(64);
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(
      "Published release changed or removed",
    );
  });

  it("retains identical versions recorded at different commits", () => {
    const previous = baseline();
    const source = previous.dashboards[0]!;
    source.releases.splice(1, 0, { ...source.releases[0]!, commit: "d".repeat(40) });
    expect(() => verifyHistory(validateSources(previous), structuredClone(previous))).not.toThrow();
  });

  it.each(["id", "origin"] as const)("rejects changing the published registry %s", (field) => {
    const current = baseline();
    current.registry[field] = field === "id" ? "new-registry" : "https://new.example";
    expect(() => verifyHistory(baseline(), validateSources(current))).toThrow(/Published registry/);
  });
});
