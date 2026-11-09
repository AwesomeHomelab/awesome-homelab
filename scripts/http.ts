import assert from "node:assert/strict";
import { ASSET_CACHE } from "../src/registry.ts";
import type { Asset } from "../src/registry.ts";
import { sha256 } from "./registry.ts";

export function get(url: URL, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, redirect: "error", signal: AbortSignal.timeout(30_000) });
}

export async function verifyCache(url: URL, hash: string): Promise<void> {
  const response = await get(url);
  assert.equal(response.status, 200, `${url.pathname}: cached request failed`);
  assert.equal(
    response.headers.get("Cf-Cache-Status"),
    "HIT",
    `${url.pathname}: expected cache HIT`,
  );
  assert.equal(
    sha256(new Uint8Array(await response.arrayBuffer())),
    hash,
    `${url.pathname}: cached bytes mismatch`,
  );
}

export async function verifyAsset(url: URL, asset: Asset, edgeCache: boolean): Promise<void> {
  const response = await get(url);
  assert.equal(response.status, 200, `${url.pathname}: download failed`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.equal(sha256(bytes), asset.sha256, `${url.pathname}: SHA-256 mismatch`);
  assert.equal(
    response.headers.get("Content-Type"),
    asset.contentType,
    `${url.pathname}: unexpected content type`,
  );
  assert.equal(
    response.headers.get("Cache-Control"),
    ASSET_CACHE,
    `${url.pathname}: unexpected cache policy`,
  );
  if (edgeCache) await verifyCache(url, asset.sha256);
  console.log(
    `OK ${url.pathname}: ${bytes.byteLength} bytes, verified SHA-256${edgeCache ? ", cache HIT" : ""}`,
  );
}
