import assert from "node:assert/strict";
import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { HeadDescriptor } from "void";
import { avatarPath } from "../src/authors.ts";
import { sortedDashboards } from "../src/catalog.ts";
import { installLink, registryLink } from "../src/metrix.ts";
import { PAGE_CACHE } from "../src/registry.ts";
import type { Manifest } from "../src/registry.ts";
import { dashboardHead, dashboardPath, homeHead, siteURL } from "../src/seo.ts";
import { get, verifyCache } from "./http.ts";
import { parsePage } from "./html.ts";
import { sha256 } from "./registry.ts";

async function verifyPage(
  path: string,
  head: HeadDescriptor,
  manifest: Manifest,
  origin: string,
  edgeCache: boolean,
): Promise<CheerioAPI> {
  const url = new URL(path, origin);
  const response = await get(url);
  assert.equal(response.status, 200, `${path}: page request failed`);
  assert.match(response.headers.get("Content-Type") ?? "", /^text\/html/);
  assert.equal(response.headers.get("Cache-Control"), PAGE_CACHE);
  const html = await response.text();
  const page = parsePage(html, head, siteURL(manifest, path));
  const responseHead = await get(url, { method: "HEAD" });
  assert.equal(responseHead.status, 200, `${path}: HEAD failed`);
  assert.equal((await responseHead.arrayBuffer()).byteLength, 0, `${path}: HEAD returned a body`);
  if (edgeCache) await verifyCache(url, sha256(html));
  return page;
}

export async function verifyPages(
  manifest: Manifest,
  origin: string,
  edgeCache: boolean,
): Promise<void> {
  const home = await verifyPage("/", homeHead(manifest), manifest, origin, edgeCache);
  assert(
    home(`a[href="${registryLink(manifest.registryURL)}"]`).length,
    "Missing add-registry action",
  );
  const cards = home(".dashboard-card");
  assert.deepEqual(
    cards.toArray().map((card) => home(card).find("h3 a").attr("href")),
    sortedDashboards(manifest).map(({ id }) => dashboardPath(id)),
    "Catalog cards must follow weighted project stars",
  );
  for (const dashboard of manifest.registry.dashboards) {
    const path = dashboardPath(dashboard.id);
    const install = `a[href="${installLink(dashboard.id, manifest.registryURL)}"]`;
    assert(home(`a[href="${path}"]`).length, `${dashboard.id}: missing detail link`);
    assert(home(install).length, `${dashboard.id}: missing catalog install link`);
    const card = cards.filter((_, element) => home(element).find("h3 a").attr("href") === path);
    const repository = manifest.dashboardRepositories[dashboard.id];
    const badge = card.find(".project-stars");
    assert.equal(
      badge.attr("href"),
      `https://github.com/${repository}`,
      `${dashboard.id}: wrong star repository`,
    );
    assert.equal(
      badge.find("text").text(),
      manifest.projectStars[repository]?.toLocaleString("en-US") ?? "—",
      `${dashboard.id}: wrong project star count`,
    );
    assert.equal(badge.find("svg").length, 1, `${dashboard.id}: missing SVG badge`);
    const page = await verifyPage(
      path,
      dashboardHead(dashboard, manifest),
      manifest,
      origin,
      edgeCache,
    );
    assert(page(install).length, `${dashboard.id}: missing install action`);
    assert(
      page(`a[href="${new URL(dashboard.file, manifest.registryURL).pathname}"]`).length,
      `${dashboard.id}: missing download`,
    );
    const avatar = dashboard.author && avatarPath(dashboard.author);
    if (avatar)
      assert(
        home(`img[src="${avatar}"]`).length && page(`img[src="${avatar}"]`).length,
        `${dashboard.id}: missing author avatar`,
      );
  }
  const sitemap = await get(new URL("/sitemap.xml", origin));
  assert.equal(sitemap.status, 200, "Sitemap failed");
  assert.match(sitemap.headers.get("Content-Type") ?? "", /^application\/xml/);
  const xml = load(await sitemap.text(), { xml: true });
  const locations = xml("loc")
    .toArray()
    .map((node) => xml(node).text());
  assert.deepEqual(
    locations,
    [
      siteURL(manifest),
      ...manifest.registry.dashboards.map(({ id }) => siteURL(manifest, dashboardPath(id))),
    ],
    "Sitemap must contain exactly the public pages",
  );
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
  for (const path of ["/", dashboardPath(manifest.registry.dashboards[0]!.id)]) {
    const response = await get(new URL(path, origin), { method: "POST" });
    assert(response.status >= 400, `${path}: unsupported method succeeded`);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
}
