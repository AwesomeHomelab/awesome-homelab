import { defineMiddleware } from "void/handler";
import { INDEX_PATH, PAGE_CACHE } from "../registry.ts";

export default defineMiddleware(async (context, next) => {
  await next();
  if (context.res.status >= 400) {
    context.header("Cache-Control", "no-store");
    context.header("X-Robots-Tag", "noindex");
  } else if (context.req.path.startsWith("/avatars/")) {
    context.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
  } else if (context.res.headers.get("Content-Type")?.startsWith("text/html")) {
    context.header("Cache-Control", PAGE_CACHE);
    context.header("X-Content-Type-Options", "nosniff");
  }
  if (context.req.path === INDEX_PATH || context.req.path.startsWith("/dashboards/files/")) {
    context.header("X-Robots-Tag", "noindex");
  }
});
