import { installLink } from "../metrix.ts";
import { dashboardPath } from "../seo.ts";
import type { Dashboard, Manifest } from "../registry.ts";
import { Author } from "./author.tsx";
import { ProjectStars } from "./project-stars.tsx";

function imageIcon(icon: string | undefined, manifest: Manifest): string | undefined {
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

export function DashboardIcon({
  dashboard,
  manifest,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
}) {
  const icon = imageIcon(dashboard.icon, manifest);
  return icon ? (
    <img className="dashboard-icon" src={icon} alt="" width={48} height={48} loading="lazy" />
  ) : null;
}

export function DashboardCard({
  dashboard,
  manifest,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
}) {
  const repository = manifest.dashboardRepositories[dashboard.id];
  return (
    <article className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-heading">
          <DashboardIcon dashboard={dashboard} manifest={manifest} />
          <div>
            <h3>
              <a href={dashboardPath(dashboard.id)}>{dashboard.name}</a>
            </h3>
            <p className="byline">
              {dashboard.author && (
                <>
                  <Author name={dashboard.author} /> <span>·</span>{" "}
                </>
              )}
              <span>v{dashboard.version}</span>
            </p>
          </div>
        </div>
        {repository && (
          <ProjectStars repository={repository} stars={manifest.projectStars[repository] ?? null} />
        )}
      </div>
      <p className="card-description">
        {dashboard.description ?? "A community dashboard for Metrix.Bar."}
      </p>
      {dashboard.category && <small className="category">{dashboard.category}</small>}
      <footer>
        <a href={dashboardPath(dashboard.id)} aria-label={`View ${dashboard.name} details`}>
          Details <span aria-hidden="true">→</span>
        </a>
        <a
          role="button"
          className="outline"
          href={installLink(dashboard.id, manifest.registryURL)}
          aria-label={`Install ${dashboard.name} in Metrix.Bar`}
        >
          Install
        </a>
      </footer>
    </article>
  );
}
