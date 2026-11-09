import process from "node:process";
import assert from "node:assert/strict";
import generated from "../.generated/manifest.json" with { type: "json" };
import sourceConfig from "../registry/sources.json" with { type: "json" };
import { INDEX_PATH, PAGE_CACHE } from "../src/registry.ts";
import type { Manifest } from "../src/registry.ts";
import { get, verifyAsset, verifyCache } from "./http.ts";
import { verifyPages } from "./verify-pages.ts";
import { validateSources } from "./config.ts";
import { download } from "./download.ts";
import { sha256, validateRegistry } from "./registry.ts";

const config = validateSources(sourceConfig);
const expected: Manifest = generated;
const args: string[] = process.argv.slice(2);
const origin = new URL(args.find((value) => !value.startsWith("--")) ?? config.registry.origin)
  .origin;
const edgeCache = args.includes("--edge-cache");
const schema = JSON.parse((await download(config.tools.schema, "json")).bytes.toString()) as object;
const indexURL = new URL(INDEX_PATH, origin);
const indexResponse = await get(indexURL);
assert.equal(indexResponse.status, 200, "Index download failed");
assert.equal(
  indexResponse.headers.get("Cache-Control"),
  PAGE_CACHE,
  "Unexpected index cache policy",
);
assert.equal(indexResponse.headers.get("X-Robots-Tag"), "noindex");
const indexBytes = new Uint8Array(await indexResponse.arrayBuffer());
const registry: unknown = JSON.parse(new TextDecoder().decode(indexBytes));
validateRegistry(registry, schema);
assert.deepEqual(registry, expected.registry, "Unexpected or stale registry");
assert.equal(registry.id, config.registry.id, "Unexpected registry ID");
assert.deepEqual(
  registry.dashboards.map(({ id, version, sha256 }) => [id, version, sha256]),
  config.dashboards.map(({ id, releases }) => {
    const latest = releases.at(-1)!;
    return [id, latest.version, latest.sha256];
  }),
  "Local registry is stale; run vp run registry:build",
);
assert.equal(
  indexResponse.headers.get("ETag")?.replace(/^W\//, ""),
  `"${sha256(indexBytes)}"`,
  "Index ETag mismatch",
);
for (const entry of registry.dashboards) {
  const fileURL = new URL(entry.file, indexURL);
  assert.equal(fileURL.origin, origin, `${entry.id}: cross-origin file`);
  assert.equal(
    expected.assets[fileURL.pathname]?.sha256,
    entry.sha256,
    `${entry.id}: missing file route`,
  );
  if (entry.icon && /^(?:https?:|\/\/)/i.test(entry.icon)) {
    const iconURL = new URL(entry.icon, config.registry.origin);
    assert.equal(iconURL.origin, config.registry.origin, `${entry.id}: cross-origin icon`);
    assert(expected.assets[iconURL.pathname], `${entry.id}: missing icon route`);
  }
}
for (const [path, asset] of Object.entries(expected.assets))
  await verifyAsset(new URL(path, origin), asset, edgeCache);
await verifyPages(expected, origin, edgeCache);
const post = await get(indexURL, { method: "POST" });
assert.equal(post.status, 405, "Unsupported registry methods must return 405");
assert.equal(post.headers.get("Cache-Control"), "no-store", "Method errors must not be cached");
const conditional = await get(indexURL, {
  headers: { "If-None-Match": indexResponse.headers.get("ETag")! },
});
assert.equal(conditional.status, 304, "Conditional index request did not return 304");
const head = await get(indexURL, { method: "HEAD" });
assert.equal(head.status, 200, "Index HEAD request failed");
assert.equal((await head.arrayBuffer()).byteLength, 0, "HEAD must not return a body");
const missing = await get(new URL("/dashboards/not-registered.bar", origin));
assert.equal(missing.status, 404, "Unknown files must return 404");
assert.equal(missing.headers.get("Cache-Control"), "no-store", "Unknown files must not be cached");
if (edgeCache) await verifyCache(indexURL, sha256(indexBytes));
console.log(
  `Verified ${registry.dashboards.length + 1} pages, SEO metadata, author avatars, ${registry.dashboards.length} dashboards and ${Object.keys(expected.assets).length} resources at ${indexURL.href}`,
);
