import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { describe, expect, it } from "vite-plus/test";
import generated from "../.generated/manifest.json";
import { sortedDashboards } from "../src/catalog.ts";
import type { Manifest } from "../src/registry.ts";
import { homeHead } from "../src/seo.ts";
import { Home } from "../src/views/home.tsx";

function catalog(): Manifest {
  const entries: [string, string, number | null][] = [
    ["unknown", "owner/unknown", null],
    ["zero", "owner/zero", 0],
    ["fraction-a-en", "owner/lower", 7],
    ["fraction-a", "owner/lower", 7],
    ["fraction-z-third", "owner/higher", 11],
    ["fraction-z-en", "owner/higher", 11],
    ["fraction-z", "owner/higher", 11],
    ["z-tie", "owner/single", 5],
    ["codex-resets-en", "owner/languages", 10],
    ["codex-resets", "owner/languages", 10],
  ];
  return {
    ...generated,
    registry: {
      ...generated.registry,
      dashboards: entries.map(([id]) => ({ ...generated.registry.dashboards[0]!, id, name: id })),
    },
    dashboardRepositories: Object.fromEntries(entries.map(([id, repository]) => [id, repository])),
    projectStars: Object.fromEntries(entries.map(([, repository, stars]) => [repository, stars])),
  };
}

const expected = [
  "codex-resets",
  "codex-resets-en",
  "z-tie",
  "fraction-z",
  "fraction-z-en",
  "fraction-z-third",
  "fraction-a",
  "fraction-a-en",
  "zero",
  "unknown",
];

describe("catalog ranking", () => {
  it("shares project stars across distinct dashboards, preserves fractions, and breaks ties by ID", () => {
    const manifest = catalog();
    const original = manifest.registry.dashboards.map(({ id }) => id);
    expect(sortedDashboards(manifest).map(({ id }) => id)).toEqual(expected);
    expect(manifest.registry.dashboards.map(({ id }) => id)).toEqual(original);
    manifest.registry.dashboards.reverse();
    expect(sortedDashboards(manifest).map(({ id }) => id)).toEqual(expected);
  });

  it("uses the same order for static cards and JSON-LD positions", () => {
    const manifest = catalog();
    const page = load(renderToStaticMarkup(createElement(Home, { manifest })));
    expect(
      page(".dashboard-card h3 a")
        .toArray()
        .map((node) => page(node).attr("href")),
    ).toEqual(expected.map((id) => `/dashboards/${id}`));
    const data = JSON.parse(homeHead(manifest).script![0]!.innerHTML!);
    expect(data["@graph"][1].mainEntity.itemListElement).toEqual(
      expected.map((id, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: id,
        url: `https://awesome.metrix.bar/dashboards/${id}`,
      })),
    );
    expect(page("script")).toHaveLength(0);
  });
});
