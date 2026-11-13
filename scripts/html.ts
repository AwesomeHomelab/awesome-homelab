import assert from "node:assert/strict";
import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { HeadDescriptor } from "void";
import { installLink } from "../src/metrix.ts";
import type { Dashboard } from "../src/registry.ts";

export function parsePage(
  html: string,
  head: HeadDescriptor,
  url: string,
  development = false,
): CheerioAPI {
  const $ = load(html);
  assert.equal(
    $("html").attr("lang"),
    head.htmlAttrs?.lang ?? "en",
    `${url}: missing page language`,
  );
  assert.equal($("meta[charset]").attr("charset")?.toLowerCase(), "utf-8");
  assert.equal($("meta[name=viewport]").attr("content"), "width=device-width, initial-scale=1");
  assert.equal($("title").text(), head.title, `${url}: unexpected title`);
  const canonical = $('link[rel="canonical"]');
  assert.equal(canonical.length, 1, `${url}: expected one canonical URL`);
  assert.equal(canonical.attr("href"), url, `${url}: unexpected canonical URL`);
  const alternates = $('link[rel="alternate"][hreflang]');
  const expectedAlternates = head.link?.filter((link) => link.rel === "alternate") ?? [];
  assert.equal(
    alternates.length,
    expectedAlternates.length,
    `${url}: unexpected alternate languages`,
  );
  for (const link of expectedAlternates) {
    const alternate = alternates.filter(`[hreflang="${link.hreflang}"]`);
    assert.equal(alternate.length, 1, `${url}: expected one ${link.hreflang} alternate`);
    assert.equal(alternate.attr("href"), link.href, `${url}: wrong ${link.hreflang} alternate`);
  }
  for (const meta of head.meta ?? []) {
    const attribute = meta.name ? "name" : "property";
    const name = meta.name ?? meta.property;
    if (!name) continue;
    const element = $(`meta[${attribute}="${name}"]`);
    assert.equal(element.length, 1, `${url}: expected one ${name} tag`);
    assert.equal(element.attr("content"), meta.content, `${url}: unexpected ${name}`);
  }
  const structured = $('script[type="application/ld+json"]');
  assert.equal(structured.length, 1, `${url}: expected one JSON-LD block`);
  assert.deepEqual(JSON.parse(structured.text()), JSON.parse(head.script![0]!.innerHTML!));
  for (const node of $("script").toArray()) {
    const script = $(node);
    const type = script.attr("type");
    const devTool =
      development &&
      type === "module" &&
      (script.attr("src") === "/@vite/client" ||
        script.text().trim().startsWith('import RefreshRuntime from "/@react-refresh"'));
    assert(
      type === "application/ld+json" || type === "application/json" || devTool,
      `${url}: unexpected browser JavaScript`,
    );
  }
  return $;
}

export function verifyDashboard(page: CheerioAPI, dashboard: Dashboard, registryURL: string): void {
  const main = page("main");
  assert.equal(main.length, 1, `${dashboard.id}: missing main content`);
  assert.equal(main.find("h1").length, 1, `${dashboard.id}: expected one heading`);
  assert.equal(main.find("h1").text(), dashboard.name, `${dashboard.id}: wrong dashboard name`);
  for (const content of [dashboard.description, dashboard.docs]) {
    if (content)
      assert(
        main.text().includes(content.replaceAll("\r\n", "\n")),
        `${dashboard.id}: missing dashboard content`,
      );
  }
  const install = main.find(`a[href="${installLink(dashboard.id, registryURL)}"]`);
  assert(install.text().trim(), `${dashboard.id}: missing install action label`);
  const download = main.find("a[download]");
  assert.equal(download.length, 1, `${dashboard.id}: expected one download`);
  assert.equal(download.attr("href"), new URL(dashboard.file, registryURL).pathname);
  assert(download.text().trim(), `${dashboard.id}: missing download action label`);
}
