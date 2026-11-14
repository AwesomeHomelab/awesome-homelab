import { describe, expect, it } from "vite-plus/test";
import { sortedDashboards } from "../src/catalog.ts";
import manifest from "../.generated/manifest.json";
import { dashboardPath, locales, localePath } from "../src/i18n.ts";
import type { Dashboard } from "../src/registry.ts";
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
    expect(head.title).toBe("Metrix.Bar dashboards | Awesome.Metrix.Bar");
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
      const [app, breadcrumb, page, website] = structured(head)["@graph"];
      expect(app.softwareVersion).toBe(dashboard.version);
      expect(app.downloadUrl).toBe(new URL(dashboard.file, manifest.registryURL).href);
      expect(app.isBasedOn).toBe(dashboard.source);
      if (dashboard.author)
        expect(app.author).toEqual({
          "@type": "Person",
          name: dashboard.author,
          url: `https://github.com/${encodeURIComponent(dashboard.author)}`,
        });
      if (dashboard.license && dashboard.license !== "UNLICENSED")
        expect(app.license).toBe(
          `https://spdx.org/licenses/${encodeURIComponent(dashboard.license)}.html`,
        );
      else expect(app).not.toHaveProperty("license");
      expect(page).toMatchObject({
        "@type": "WebPage",
        "@id": url,
        mainEntity: { "@id": app["@id"] },
        breadcrumb: { "@id": breadcrumb["@id"] },
        isPartOf: { "@id": website["@id"] },
      });
      expect(app["@id"]).not.toBe(page["@id"]);
      expect(app.mainEntityOfPage).toEqual({ "@id": page["@id"] });
      expect(app).not.toHaveProperty("aggregateRating");
      expect(app).not.toHaveProperty("offers");
    }
    expect(titles.size).toBe(manifest.registry.dashboards.length);
  });

  it.each(locales)(
    "connects %s pages to the same dashboard with localized social metadata",
    (locale) => {
      const dashboard = manifest.registry.dashboards[0]!;
      const home = homeHead(manifest, locale);
      const detail = dashboardHead(dashboard, manifest, locale);
      const [app, , page] = structured(detail)["@graph"];
      expect(app["@id"]).toBe(structured(dashboardHead(dashboard, manifest))["@graph"][0]["@id"]);
      expect(page.inLanguage).toBe(locale);
      expect(page.url).toBe(siteURL(manifest, dashboardPath(dashboard.id, locale)));
      for (const head of [home, detail]) {
        const current = head.meta!.filter(({ property }) => property === "og:locale");
        expect(current).toHaveLength(1);
        expect(current[0]!.content).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
        expect(current[0]!.content!.split("_")[0]).toBe(locale.split("-")[0]);
        if (locale.startsWith("zh-")) expect(current[0]!.content).toBe(locale.replace("-", "_"));
        expect(head.link).toContainEqual({
          rel: "alternate",
          hreflang: locale,
          href: siteURL(
            manifest,
            localePath(head === home ? "/" : dashboardPath(dashboard.id), locale),
          ),
        });
      }
    },
  );

  it("omits missing authors, source links and license declarations", () => {
    const dashboard: Dashboard = { ...manifest.registry.dashboards[0]! };
    delete dashboard.author;
    delete dashboard.source;
    delete dashboard.license;
    const app = structured(dashboardHead(dashboard, manifest))["@graph"][0];
    for (const property of ["author", "isBasedOn", "license"])
      expect(app).not.toHaveProperty(property);
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
