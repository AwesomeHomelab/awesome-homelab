import { ASSET_CACHE, INDEX_PATH, PAGE_CACHE } from "./registry.ts";
import type { Manifest } from "./registry.ts";

function matchesETag(request: Request, etag: string): boolean {
  return (
    request.headers
      .get("If-None-Match")
      ?.split(",")
      .some((value) => ["*", etag, `W/${etag}`].includes(value.trim())) ?? false
  );
}

function errorResponse(
  message: string,
  status: number,
  headers?: Record<string, string>,
): Response {
  return new Response(message, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function createHandler(manifest: Manifest, fetchUpstream: typeof fetch = fetch) {
  const index = `${JSON.stringify(manifest.registry, null, 2)}\n`;
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return errorResponse("Method not allowed", 405, { Allow: "GET, HEAD" });
    }
    const { pathname } = new URL(request.url);
    const isIndex = pathname === INDEX_PATH;
    const asset = manifest.assets[pathname];
    if (!isIndex && !asset) return errorResponse("Not found", 404);
    const etag = asset ? `"${asset.sha256}"` : manifest.indexETag;
    const headers = {
      "Content-Type": asset?.contentType ?? "application/json; charset=utf-8",
      "Cache-Control": asset ? ASSET_CACHE : PAGE_CACHE,
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    };
    if (matchesETag(request, etag)) return new Response(null, { status: 304, headers });
    if (request.method === "HEAD") return new Response(null, { headers });
    if (!asset) return new Response(index, { headers });
    try {
      const upstream = await fetchUpstream(asset.url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      });
      if (upstream.status !== 200) throw new Error(`Upstream returned ${upstream.status}`);
      const bytes = await upstream.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (value) =>
        value.toString(16).padStart(2, "0"),
      ).join("");
      if (hash !== asset.sha256) throw new Error("SHA-256 mismatch");
      return new Response(bytes, { headers });
    } catch (error) {
      console.error(`Upstream request failed: ${asset.url}`, error);
      return errorResponse("Upstream unavailable", 502);
    }
  };
}
