import type { HeadDescriptor } from "void";
import { sortedDashboards } from "./catalog.ts";
import type { Dashboard, Manifest } from "./registry.ts";

export const HOME_DESCRIPTION =
  "Browse community dashboards for Metrix.Bar, check setup requirements, and add the registry to install them and get updates in the app.";

export function dashboardPath(id: string): string {
  return `/dashboards/${encodeURIComponent(id)}`;
}

export function siteURL(manifest: Manifest, path = "/"): string {
  return new URL(path, manifest.registryURL).href;
}

function metadata(
  manifest: Manifest,
  path: string,
  title: string,
  description: string,
  data: object,
): HeadDescriptor {
  const url = siteURL(manifest, path);
  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: manifest.registry.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    link: [{ rel: "canonical", href: url }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(data).replaceAll("<", "\\u003c"),
      },
    ],
  };
}

export function homeHead(manifest: Manifest): HeadDescriptor {
  const url = siteURL(manifest);
  const title = `${manifest.registry.name} — Metrix.Bar dashboards`;
  return metadata(manifest, "/", title, HOME_DESCRIPTION, {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${url}#website`, name: manifest.registry.name, url },
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        description: HOME_DESCRIPTION,
        isPartOf: { "@id": `${url}#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: manifest.registry.dashboards.length,
          itemListElement: sortedDashboards(manifest).map((dashboard, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: dashboard.name,
            url: siteURL(manifest, dashboardPath(dashboard.id)),
          })),
        },
      },
    ],
  });
}

export function dashboardHead(dashboard: Dashboard, manifest: Manifest): HeadDescriptor {
  const path = dashboardPath(dashboard.id);
  const url = siteURL(manifest, path);
  const duplicateName = manifest.registry.dashboards.some(
    (entry) => entry.id !== dashboard.id && entry.name === dashboard.name,
  );
  const label = duplicateName ? `${dashboard.name} (${dashboard.id})` : dashboard.name;
  const title = `${label} | ${manifest.registry.name}`;
  const description =
    dashboard.description ?? `Install ${dashboard.name}, a community dashboard for Metrix.Bar.`;
  return metadata(manifest, path, title, description, {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": url,
        url,
        name: dashboard.name,
        description,
        softwareVersion: dashboard.version,
        softwareRequirements: "Metrix.Bar",
        applicationCategory: dashboard.category,
        downloadUrl: new URL(dashboard.file, manifest.registryURL).href,
        author: dashboard.author ? { "@type": "Person", name: dashboard.author } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Dashboards", item: siteURL(manifest) },
          { "@type": "ListItem", position: 2, name: dashboard.name, item: url },
        ],
      },
    ],
  });
}
