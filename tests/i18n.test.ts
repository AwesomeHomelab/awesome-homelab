import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { describe, expect, it } from "vite-plus/test";
import manifest from "../.generated/manifest.json";
import { baseLocale, dashboardPath, languageNames, locales, localePath } from "../src/i18n.ts";
import * as m from "../src/paraglide/messages.js";
import { dashboardHead, homeHead, siteURL } from "../src/seo.ts";
import { DashboardDetail } from "../src/views/detail.tsx";
import { Home } from "../src/views/home.tsx";
import { ProjectStars } from "../src/views/project-stars.tsx";

const expectedHeadings = {
  en: "A registry of dashboards for Metrix.Bar.",
  "zh-CN": "Metrix.Bar 看板注册表。",
  "zh-TW": "Metrix.Bar 看板註冊表。",
  ja: "Metrix.Bar のダッシュボードレジストリ。",
  ko: "Metrix.Bar 대시보드 레지스트리.",
  fr: "Un registre de tableaux de bord pour Metrix.Bar.",
  es: "Un registro de paneles para Metrix.Bar.",
  de: "Eine Registry für Metrix.Bar-Dashboards.",
  pt: "Um registro de painéis para o Metrix.Bar.",
};

describe("localized pages", () => {
  it("keeps English paths stable and preserves deep links when changing languages", () => {
    expect(baseLocale).toBe("en");
    expect(localePath("/")).toBe("/");
    expect(dashboardPath("codex-resets")).toBe("/dashboards/codex-resets");
    expect(localePath("/", "zh-CN")).toBe("/zh-CN");
    expect(localePath("/fr/dashboards/komari?source=catalog#setup", "ja")).toBe(
      "/ja/dashboards/komari?source=catalog#setup",
    );
    expect(localePath("/de/dashboards/komari", "en")).toBe("/dashboards/komari");
  });

  it("includes every message in every translation catalog", async () => {
    const catalogs = await Promise.all(
      locales.map(
        async (locale) =>
          JSON.parse(
            await readFile(resolve(import.meta.dirname, `../messages/${locale}.json`), "utf8"),
          ) as Record<string, unknown>,
      ),
    );
    for (const catalog of catalogs) {
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(catalogs[0]!).sort());
      expect(
        Object.values(catalog).every((value) =>
          typeof value === "string"
            ? value.trim().length > 0
            : Array.isArray(value) && value.length > 0,
        ),
      ).toBe(true);
    }
    expect(m.dashboard_count({ count: 1 }, { locale: "en" })).toBe("1 dashboard");
    expect(m.dashboard_count({ count: 2 }, { locale: "en" })).toBe("2 dashboards");
    expect(m.dashboard_count({ count: 2 }, { locale: "fr" })).toBe("2 tableaux de bord");
    expect(m.dashboard_count({ count: 2 }, { locale: "ja" })).toBe("2 件のダッシュボード");
  });

  it.each([
    ["en", "GitHub star", "GitHub stars"],
    ["fr", "étoile GitHub", "étoiles GitHub"],
    ["es", "estrella de GitHub", "estrellas de GitHub"],
    ["de", "GitHub-Stern", "GitHub-Sterne"],
    ["pt", "estrela do GitHub", "estrelas do GitHub"],
  ] as const)("uses %s plural rules in star badge labels", (locale, one, other) => {
    for (const [stars, text] of [
      [1, one],
      [2, other],
    ] as const) {
      const page = load(
        renderToStaticMarkup(
          createElement(ProjectStars, { repository: "owner/project", stars, locale }),
        ),
      );
      expect(page("a").attr("aria-label")).toContain(`${stars} ${text}`);
      expect(page("svg text").text()).toBe(stars.toLocaleString(locale));
    }
  });

  it.each(locales)(
    "renders complete %s pages with native language navigation and unchanged upstream content",
    (locale) => {
      const home = load(renderToStaticMarkup(createElement(Home, { manifest, locale })));
      expect(home("h1").text()).toBe(expectedHeadings[locale]);
      const dashboard = manifest.registry.dashboards.find(({ id }) => id === "komari")!;
      const page = load(
        renderToStaticMarkup(createElement(DashboardDetail, { dashboard, manifest, locale })),
      );
      expect(page("main h1").text()).toBe(dashboard.name);
      expect(page("main").text()).toContain(dashboard.description);
      expect(page("main").text()).toContain(dashboard.docs);
      expect(page("a[download]").attr("href")).toBe(
        new URL(dashboard.file, manifest.registryURL).pathname,
      );
      expect(page("script")).toHaveLength(0);
      const languages = page("header a[hreflang]");
      expect(languages).toHaveLength(locales.length);
      expect(languages.filter("[aria-current=page]").attr("lang")).toBe(locale);
      for (const language of locales) {
        const link = languages.filter(`[hreflang="${language}"]`);
        expect(link.attr("href")).toBe(dashboardPath(dashboard.id, language));
        expect(link.attr("lang")).toBe(language);
        expect(link.text()).toBe(languageNames[language]);
      }
      expect(languages.closest("details").find("summary")).toHaveLength(1);
      const input = home('input[name="registry-url"]');
      expect(home(`label[for="${input.attr("id")}"]`).text()).toBe(
        m.registry_url_label({}, { locale }),
      );
    },
  );

  it.each(locales)(
    "publishes %s language metadata, matching alternates and localized catalog URLs",
    (locale) => {
      const home = homeHead(manifest, locale);
      expect(home.htmlAttrs).toEqual({ lang: locale, dir: "ltr" });
      expect(home.link).toContainEqual({
        rel: "canonical",
        href: siteURL(manifest, localePath("/", locale)),
      });
      const collection = JSON.parse(home.script![0]!.innerHTML!)["@graph"][1];
      expect(collection.inLanguage).toBe(locale);
      expect(collection.mainEntity.itemListElement[0].url).toContain(
        locale === "en" ? "/dashboards/" : `/${locale}/dashboards/`,
      );
      const dashboard = manifest.registry.dashboards[0]!;
      const detail = dashboardHead(dashboard, manifest, locale);
      expect(detail.htmlAttrs?.lang).toBe(locale);
      expect(detail.link?.filter(({ rel }) => rel === "alternate")).toHaveLength(
        locales.length + 1,
      );
      for (const language of locales)
        expect(detail.link).toContainEqual({
          rel: "alternate",
          hreflang: language,
          href: siteURL(manifest, dashboardPath(dashboard.id, language)),
        });
      expect(detail.link).toContainEqual({
        rel: "alternate",
        hreflang: "x-default",
        href: siteURL(manifest, dashboardPath(dashboard.id)),
      });
      expect(JSON.parse(detail.script![0]!.innerHTML!)["@graph"][0].downloadUrl).toBe(
        new URL(dashboard.file, manifest.registryURL).href,
      );
    },
  );

  it("keeps interleaved render calls independent of the previous page language", () => {
    for (const locale of ["ja", "fr", "zh-CN", "en", "ja"] as const) {
      const page = load(renderToStaticMarkup(createElement(Home, { manifest, locale })));
      expect(page("h1").text()).toBe(expectedHeadings[locale]);
    }
  });
});
