import type { Dashboard, Manifest } from "./registry.ts";

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
