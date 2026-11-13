import { defineConfig } from "void/config";
import sources from "./registry/sources.json";

export default defineConfig({
  sourceDir: "src",
  output: "static",
  head: {
    title: sources.registry.name,
    htmlAttrs: { lang: "en" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Community dashboards for Metrix.Bar. Add one registry to browse and install them all.",
      },
      { name: "color-scheme", content: "light dark" },
    ],
  },
  routing: { isr: false },
  cloudflare: {
    name: "awesome-metrix-bar",
    compatibility_date: "2026-11-04",
    compatibility_flags: ["nodejs_als"],
    workers_dev: false,
    preview_urls: false,
    upload_source_maps: true,
    cache: { enabled: true, cross_version_cache: true },
    observability: { enabled: true },
  },
});
