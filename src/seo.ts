import type { HeadDescriptor } from "void";
import { sortedDashboards } from "./catalog.ts";
import { baseLocale, dashboardPath, locales, localePath, type Locale } from "./i18n.ts";
import * as m from "./paraglide/messages.js";
import type { Dashboard, Manifest } from "./registry.ts";

export function siteURL(manifest: Manifest, path = "/"): string {
  return new URL(path, manifest.registryURL).href;
}

function websiteData(manifest: Manifest) {
  return {
    "@type": "WebSite",
    "@id": `${siteURL(manifest)}#website`,
    name: manifest.registry.name,
    url: siteURL(manifest),
    inLanguage: [...locales],
  };
}

export function languageAlternates(manifest: Manifest, path: string) {
  return [
    ...locales.map((language) => ({
      hreflang: language,
      href: siteURL(manifest, localePath(path, language)),
    })),
    { hreflang: "x-default", href: siteURL(manifest, path) },
  ];
}

const socialLocales: Record<Locale, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  pt: "pt_PT",
};

function metadata(
  manifest: Manifest,
  path: string,
  title: string,
  description: string,
  data: object,
  locale: Locale,
): HeadDescriptor {
  const url = siteURL(manifest, localePath(path, locale));
  return {
    title,
    htmlAttrs: { lang: locale, dir: "ltr" },
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: manifest.registry.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:locale", content: socialLocales[locale] },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    link: [
      { rel: "canonical", href: url },
      ...languageAlternates(manifest, path).map((alternate) => ({
        rel: "alternate",
        ...alternate,
      })),
    ],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(data).replaceAll("<", "\\u003c"),
      },
    ],
  };
}

export function homeHead(manifest: Manifest, locale: Locale = baseLocale): HeadDescriptor {
  const url = siteURL(manifest, localePath("/", locale));
  const website = `${siteURL(manifest)}#website`;
  const title = m.home_title({ site: manifest.registry.name }, { locale });
  const description = m.home_description({}, { locale });
  return metadata(
    manifest,
    "/",
    title,
    description,
    {
      "@context": "https://schema.org",
      "@graph": [
        websiteData(manifest),
        {
          "@type": "CollectionPage",
          "@id": url,
          url,
          name: title,
          description,
          inLanguage: locale,
          isPartOf: { "@id": website },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: manifest.registry.dashboards.length,
            itemListElement: sortedDashboards(manifest).map((dashboard, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: dashboard.name,
              url: siteURL(manifest, dashboardPath(dashboard.id, locale)),
            })),
          },
        },
      ],
    },
    locale,
  );
}

export function dashboardHead(
  dashboard: Dashboard,
  manifest: Manifest,
  locale: Locale = baseLocale,
): HeadDescriptor {
  const path = dashboardPath(dashboard.id);
  const url = siteURL(manifest, dashboardPath(dashboard.id, locale));
  const application = `${siteURL(manifest, path)}#dashboard`;
  const breadcrumb = `${url}#breadcrumb`;
  const duplicateName = manifest.registry.dashboards.some(
    (entry) => entry.id !== dashboard.id && entry.name === dashboard.name,
  );
  const label = duplicateName ? `${dashboard.name} (${dashboard.id})` : dashboard.name;
  const title = `${label} | ${manifest.registry.name}`;
  const description =
    dashboard.description ?? m.dashboard_fallback_description({ name: dashboard.name }, { locale });
  return metadata(
    manifest,
    path,
    title,
    description,
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": application,
          url,
          mainEntityOfPage: { "@id": url },
          name: dashboard.name,
          description,
          softwareVersion: dashboard.version,
          softwareRequirements: "Metrix.Bar",
          applicationCategory: dashboard.category,
          downloadUrl: new URL(dashboard.file, manifest.registryURL).href,
          author: dashboard.author
            ? {
                "@type": "Person",
                name: dashboard.author,
                url: `https://github.com/${encodeURIComponent(dashboard.author)}`,
              }
            : undefined,
          isBasedOn: dashboard.source,
          license:
            dashboard.license && dashboard.license !== "UNLICENSED"
              ? `https://spdx.org/licenses/${encodeURIComponent(dashboard.license)}.html`
              : undefined,
        },
        {
          "@type": "BreadcrumbList",
          "@id": breadcrumb,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: m.dashboards({}, { locale }),
              item: siteURL(manifest, localePath("/", locale)),
            },
            { "@type": "ListItem", position: 2, name: dashboard.name, item: url },
          ],
        },
        {
          "@type": "WebPage",
          "@id": url,
          url,
          name: title,
          description,
          inLanguage: locale,
          isPartOf: { "@id": `${siteURL(manifest)}#website` },
          mainEntity: { "@id": application },
          breadcrumb: { "@id": breadcrumb },
        },
        websiteData(manifest),
      ],
    },
    locale,
  );
}
