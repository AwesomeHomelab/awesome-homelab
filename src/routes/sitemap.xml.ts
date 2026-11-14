import { defineHandler } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { dashboardPath, locales, localePath } from "../i18n.ts";
import { PAGE_CACHE } from "../registry.ts";
import { languageAlternates, siteURL } from "../seo.ts";

function escapeXML(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

export const GET = defineHandler(() => {
  const paths = ["/", ...manifest.registry.dashboards.map(({ id }) => dashboardPath(id))];
  const urls = locales
    .flatMap((locale) =>
      paths.map((path) => {
        const alternates = languageAlternates(manifest, path)
          .map(
            ({ hreflang, href }) =>
              `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXML(href)}"/>`,
          )
          .join("");
        return `<url><loc>${escapeXML(siteURL(manifest, localePath(path, locale)))}</loc>${alternates}</url>`;
      }),
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>
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
