import { describe, expect, it } from "vite-plus/test";
import { sortedDashboards } from "../src/catalog.ts";
import manifest from "../.generated/manifest.json";
import { dashboardPath } from "../src/i18n.ts";
import { dashboardHead, homeHead, siteURL } from "../src/seo.ts";

function structured(head: ReturnType<typeof homeHead>) {
  return JSON.parse(head.script![0]!.innerHTML!);
}

describe("search metadata", () => {
  it("lists all canonical detail URLs in collection structured data", () => {
    const head = homeHead(manifest);
    expect(head.link?.filter(({ rel }) => rel === "canonical")).toEqual([
      { rel: "canonical", href: "https://awesome.metrix.bar/" },
    ]);
    const collection = structured(head)["@graph"][1];
    expect(collection.mainEntity.numberOfItems).toBe(manifest.registry.dashboards.length);
    expect(collection.mainEntity.itemListElement.map((item: { url: string }) => item.url)).toEqual(
      sortedDashboards(manifest).map(({ id }) => siteURL(manifest, dashboardPath(id))),
    );
  });

  it("gives each dashboard a unique title, canonical, social metadata and truthful release data", () => {
    const titles = new Set<string>();
    for (const dashboard of manifest.registry.dashboards) {
      const head = dashboardHead(dashboard, manifest);
      titles.add(head.title!);
      const url = siteURL(manifest, dashboardPath(dashboard.id));
      expect(head.link?.filter(({ rel }) => rel === "canonical")).toEqual([
        { rel: "canonical", href: url },
      ]);
      expect(head.meta).toContainEqual({ property: "og:url", content: url });
      const app = structured(head)["@graph"][0];
      expect(app.softwareVersion).toBe(dashboard.version);
      expect(app.downloadUrl).toBe(new URL(dashboard.file, manifest.registryURL).href);
      expect(app).not.toHaveProperty("aggregateRating");
      expect(app).not.toHaveProperty("offers");
    }
    expect(titles.size).toBe(manifest.registry.dashboards.length);
  });

  it("escapes script-closing text while preserving valid JSON-LD", () => {
    const dashboard = {
      ...manifest.registry.dashboards[0]!,
      description: '</script><script>alert("x")</script>',
    };
    const head = dashboardHead(dashboard, manifest);
    expect(head.script![0]!.innerHTML).not.toContain("<");
    expect(structured(head)["@graph"][0].description).toBe(dashboard.description);
  });
});
