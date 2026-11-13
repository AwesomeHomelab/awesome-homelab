import { installLink } from "./metrix.ts";
import type { Dashboard, Manifest } from "./registry.ts";

export function dashboardLinks(dashboard: Dashboard, manifest: Manifest) {
  const name = manifest.dashboardRepositories[dashboard.id];
  const repository = name ? `https://github.com/${name}` : undefined;
  return {
    repository,
    homepage: dashboard.homepage === repository ? undefined : dashboard.homepage,
    download: new URL(dashboard.file, manifest.registryURL).pathname,
    install: installLink(dashboard.id, manifest.registryURL),
  };
}

export function dashboardIcon(icon: string | undefined, manifest: Manifest): string | undefined {
  if (!icon) return;
  if (icon.startsWith("data:image/")) return icon;
  if (!URL.canParse(icon)) return;
  const url = new URL(icon);
  if (
    url.origin === new URL(manifest.registryURL).origin &&
    manifest.assets[url.pathname]?.contentType.startsWith("image/")
  )
    return url.pathname;
}

export function sortedDashboards(manifest: Manifest): Dashboard[] {
  const counts = new Map<string, number>();
  for (const { id } of manifest.registry.dashboards) {
    const repository = manifest.dashboardRepositories[id];
    counts.set(repository, (counts.get(repository) ?? 0) + 1);
  }
  function weight({ id }: Dashboard): number {
    const repository = manifest.dashboardRepositories[id];
    const stars = manifest.projectStars[repository];
    return stars == null ? -1 : stars / counts.get(repository)!;
  }
  return manifest.registry.dashboards.toSorted(
    (a, b) => weight(b) - weight(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}
