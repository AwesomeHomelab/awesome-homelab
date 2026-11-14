import assert from "node:assert/strict";
import { load } from "cheerio";
import { avatarPath } from "../src/authors.ts";
import { dashboardPath, locales, localePath } from "../src/i18n.ts";
import type { Manifest } from "../src/registry.ts";
import { siteURL } from "../src/seo.ts";
import { get, verifyCache } from "./http.ts";
import { verifyCatalog } from "./verify-catalog.ts";
import { createPageVerifier } from "./verify-page.ts";
import { sha256 } from "./registry.ts";

export async function verifyPages(
  manifest: Manifest,
  origin: string,
  edgeCache: boolean,
  development = false,
): Promise<void> {
  const verifyPage = createPageVerifier(manifest, origin, edgeCache, development);
  for (const locale of locales) await verifyCatalog(manifest, locale, verifyPage);
  const sitemap = await get(new URL("/sitemap.xml", origin));
  assert.equal(sitemap.status, 200, "Sitemap failed");
  assert.match(sitemap.headers.get("Content-Type") ?? "", /^application\/xml/);
  const xml = load(await sitemap.text(), { xml: true });
  assert.equal(xml("urlset").attr("xmlns:xhtml"), "http://www.w3.org/1999/xhtml");
  const paths = ["/", ...manifest.registry.dashboards.map(({ id }) => dashboardPath(id))];
  const pages = locales.flatMap((locale) =>
    paths.map((path) => ({ path, url: siteURL(manifest, localePath(path, locale)) })),
  );
  const locations = xml("loc")
    .toArray()
    .map((node) => xml(node).text());
  assert.deepEqual(
    locations,
    pages.map(({ url }) => url),
    "Sitemap must contain exactly the public pages",
  );
  for (const [index, node] of xml("url").toArray().entries()) {
    const { path, url } = pages[index]!;
    const alternates = xml(node)
      .children("xhtml\\:link")
      .toArray()
      .map((link) => ({
        rel: xml(link).attr("rel"),
        hreflang: xml(link).attr("hreflang"),
        href: xml(link).attr("href"),
      }));
    assert.deepEqual(
      alternates,
      [
        ...locales.map((locale) => ({
          rel: "alternate",
          hreflang: locale,
          href: siteURL(manifest, localePath(path, locale)),
        })),
        { rel: "alternate", hreflang: "x-default", href: siteURL(manifest, path) },
      ],
      `${url}: sitemap must link every language variant, including itself and x-default`,
    );
  }
  const robots = await get(new URL("/robots.txt", origin));
  assert.equal(robots.status, 200, "robots.txt failed");
  assert(
    (await robots.text()).includes(`Sitemap: ${siteURL(manifest, "/sitemap.xml")}`),
    "Missing sitemap declaration",
  );
  for (const author of new Set(
    manifest.registry.dashboards.map(({ author }) => author).filter((name) => name !== undefined),
  )) {
    const path = avatarPath(author);
    if (!path) continue;
    const url = new URL(path, origin);
    const response = await get(url);
    assert.equal(response.status, 200, `${author}: avatar unavailable`);
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=3600, s-maxage=86400");
    const bytes = Buffer.from(await response.arrayBuffer());
    assert(bytes.byteLength, `${author}: empty avatar`);
    if (edgeCache) await verifyCache(url, sha256(bytes));
  }
  for (const path of [
    "/dashboards/unknown-dashboard",
    "/avatars/unknown",
    "/assets/missing.css",
    "/unknown-page",
    "/it",
    "/en",
    "/zh-CN/dashboards/unknown-dashboard",
    "/zh-CN/dashboards/index.json",
  ]) {
    const response = await get(new URL(path, origin));
    assert.equal(response.status, 404, `${path}: unknown route must be 404`);
    assert.equal(
      response.headers.get("Cache-Control"),
      "no-store",
      `${path}: errors must not be cached`,
    );
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
  }
  for (const path of ["/", dashboardPath(manifest.registry.dashboards[0]!.id), "/zh-CN"]) {
    const response = await get(new URL(path, origin), { method: "POST" });
    assert(response.status >= 400, `${path}: unsupported method succeeded`);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
}
