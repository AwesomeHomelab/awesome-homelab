import { defineHandler } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { PAGE_CACHE } from "../registry.ts";
import { siteURL } from "../seo.ts";

export const GET = defineHandler(
  () =>
    new Response(
      `User-agent: *
Allow: /
Sitemap: ${siteURL(manifest, "/sitemap.xml")}
`,
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": PAGE_CACHE,
          "X-Content-Type-Options": "nosniff",
        },
      },
    ),
);
