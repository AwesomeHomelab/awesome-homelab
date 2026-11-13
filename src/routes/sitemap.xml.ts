import { defineHandler } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { dashboardPath, locales, localePath } from "../i18n.ts";
import { PAGE_CACHE } from "../registry.ts";
import { siteURL } from "../seo.ts";

export const GET = defineHandler(() => {
  const paths = locales.flatMap((locale) => [
    localePath("/", locale),
    ...manifest.registry.dashboards.map(({ id }) => dashboardPath(id, locale)),
  ]);
  const urls = paths
    .map(
      (path) =>
        `<url><loc>${siteURL(manifest, path).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</loc></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>
`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": PAGE_CACHE,
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
});
