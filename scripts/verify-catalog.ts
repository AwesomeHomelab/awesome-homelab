import assert from "node:assert/strict";
import type { CheerioAPI } from "cheerio";
import { avatarPath } from "../src/authors.ts";
import { sortedDashboards } from "../src/catalog.ts";
import { dashboardPath, locales, localePath, type Locale } from "../src/i18n.ts";
import { installLink, registryLink } from "../src/metrix.ts";
import * as m from "../src/paraglide/messages.js";
import type { Manifest } from "../src/registry.ts";
import { dashboardHead, homeHead } from "../src/seo.ts";
import { verifyDashboard } from "./html.ts";
import type { createPageVerifier } from "./verify-page.ts";

function verifyLanguages(page: CheerioAPI, path: string, locale: Locale): void {
  const links = page("header a[hreflang]");
  assert.equal(links.length, locales.length, `${path}: missing language links`);
  for (const language of locales) {
    const link = links.filter(`[hreflang="${language}"]`);
    assert.equal(link.length, 1, `${path}: duplicate or missing ${language} link`);
    assert.equal(link.attr("href"), localePath(path, language));
    assert.equal(link.attr("lang"), language);
    assert(link.text().trim(), `${path}: unnamed language link`);
    assert.equal(link.attr("aria-current"), language === locale ? "page" : undefined);
  }
}

export async function verifyCatalog(
  manifest: Manifest,
  locale: Locale,
  verifyPage: ReturnType<typeof createPageVerifier>,
): Promise<void> {
  const home = await verifyPage(localePath("/", locale), homeHead(manifest, locale));
  assert.equal(home("h1").text(), m.hero_heading({}, { locale }));
  assert.equal(home("#dashboards").text(), m.catalog_heading({}, { locale }));
  verifyLanguages(home, "/", locale);
  assert(
    home(`a[href="${registryLink(manifest.registryURL)}"]`)
      .text()
      .trim(),
    "Missing add-registry action",
  );
  const cards = home(".dashboard-card");
  assert.deepEqual(
    cards.toArray().map((card) => home(card).find("h3 a").attr("href")),
    sortedDashboards(manifest).map(({ id }) => dashboardPath(id, locale)),
    "Catalog cards must follow weighted project stars",
  );
  for (const dashboard of manifest.registry.dashboards) {
    const path = dashboardPath(dashboard.id, locale);
    const install = `a[href="${installLink(dashboard.id, manifest.registryURL)}"]`;
    const card = cards.filter((_, element) => home(element).find("h3 a").attr("href") === path);
    assert.equal(card.find("h3 a").text(), dashboard.name, `${dashboard.id}: wrong catalog name`);
    assert.equal(card.find(install).text(), m.install({}, { locale }));
    if (dashboard.description)
      assert(
        card.text().includes(dashboard.description),
        `${dashboard.id}: missing catalog description`,
      );
    const repository = manifest.dashboardRepositories[dashboard.id];
    const badge = card.find(".project-stars");
    assert.equal(
      badge.attr("href"),
      `https://github.com/${repository}`,
      `${dashboard.id}: wrong star repository`,
    );
    assert.equal(
      badge.find("text").text(),
      manifest.projectStars[repository]?.toLocaleString(locale) ?? "—",
      `${dashboard.id}: wrong project star count`,
    );
    assert.equal(badge.find("svg").length, 1, `${dashboard.id}: missing SVG badge`);
    const page = await verifyPage(path, dashboardHead(dashboard, manifest, locale));
    verifyDashboard(page, dashboard, manifest.registryURL);
    verifyLanguages(page, dashboardPath(dashboard.id), locale);
    assert.equal(page("main").find(install).text(), m.install_in_app({}, { locale }));
    assert.equal(page("a[download]").text(), m.download_bar({}, { locale }));
    const avatar = dashboard.author && avatarPath(dashboard.author);
    if (avatar)
      assert(
        card.find(`img[src="${avatar}"]`).length && page(`img[src="${avatar}"]`).length,
        `${dashboard.id}: missing author avatar`,
      );
  }
}
