import assert from "node:assert/strict";
import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { HeadDescriptor } from "void";

export function parsePage(html: string, head: HeadDescriptor, url: string): CheerioAPI {
  const $ = load(html);
  assert.equal($("html").attr("lang"), "en", `${url}: missing page language`);
  assert.equal($("meta[charset]").attr("charset")?.toLowerCase(), "utf-8");
  assert.equal($("meta[name=viewport]").attr("content"), "width=device-width, initial-scale=1");
  assert.equal($("title").text(), head.title, `${url}: unexpected title`);
  const canonical = $('link[rel="canonical"]');
  assert.equal(canonical.length, 1, `${url}: expected one canonical URL`);
  assert.equal(canonical.attr("href"), url, `${url}: unexpected canonical URL`);
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
      script.attr("src") === "/@vite/client" ||
      (type === "module" && script.text().includes('from "/@react-refresh"'));
    assert(
      type === "application/ld+json" || type === "application/json" || devTool,
      `${url}: unexpected browser JavaScript`,
    );
  }
  return $;
}
