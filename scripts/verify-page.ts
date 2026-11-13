import assert from "node:assert/strict";
import type { HeadDescriptor } from "void";
import type { Manifest } from "../src/registry.ts";
import { PAGE_CACHE } from "../src/registry.ts";
import { siteURL } from "../src/seo.ts";
import { get, verifyCache } from "./http.ts";
import { parsePage } from "./html.ts";
import { sha256 } from "./registry.ts";

export function createPageVerifier(
  manifest: Manifest,
  origin: string,
  edgeCache = false,
  development = false,
) {
  const styles = new Set<string>();
  return async (path: string, head: HeadDescriptor) => {
    const url = new URL(path, origin);
    const response = await get(url);
    assert.equal(response.status, 200, `${path}: page request failed`);
    assert.match(response.headers.get("Content-Type") ?? "", /^text\/html/);
    assert.equal(response.headers.get("Cache-Control"), PAGE_CACHE);
    const html = await response.text();
    const page = parsePage(html, head, siteURL(manifest, path), development);
    const links = page('link[rel="stylesheet"]');
    if (!development) assert(links.length, `${path}: missing stylesheet`);
    for (const link of links.toArray()) {
      const href = page(link).attr("href");
      assert(href, `${path}: missing stylesheet URL`);
      const stylesheet = new URL(href, url);
      assert.equal(stylesheet.origin, url.origin, `${path}: cross-origin stylesheet`);
      if (styles.has(stylesheet.href)) continue;
      const css = await get(stylesheet);
      assert.equal(css.status, 200, `${stylesheet.pathname}: stylesheet request failed`);
      assert.match(css.headers.get("Content-Type") ?? "", /^text\/css(?:;|$)/i);
      assert((await css.arrayBuffer()).byteLength, `${stylesheet.pathname}: empty stylesheet`);
      styles.add(stylesheet.href);
    }
    const responseHead = await get(url, { method: "HEAD" });
    assert.equal(responseHead.status, 200, `${path}: HEAD failed`);
    assert.equal((await responseHead.arrayBuffer()).byteLength, 0, `${path}: HEAD returned a body`);
    if (edgeCache) await verifyCache(url, sha256(html));
    return page;
  };
}
