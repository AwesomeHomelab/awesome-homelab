import { installLink } from "../metrix.ts";
import type { Dashboard, Manifest } from "../registry.ts";
import { DashboardIcon } from "./dashboard.tsx";
import { Author } from "./author.tsx";
import { Site } from "./site.tsx";
import "./detail.css";

export function DashboardDetail({
  dashboard,
  manifest,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
}) {
  const file = new URL(dashboard.file, manifest.registryURL).pathname;
  const repository = manifest.dashboardRepositories[dashboard.id];
  const repositoryURL = repository ? `https://github.com/${repository}` : undefined;
  const homepage = dashboard.homepage === repositoryURL ? undefined : dashboard.homepage;
  return (
    <Site manifest={manifest}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ul>
          <li>
            <a href="/">Dashboards</a>
          </li>
          <li aria-current="page">{dashboard.name}</li>
        </ul>
      </nav>
      <div className="detail-grid">
        <header className="detail-heading">
          <DashboardIcon dashboard={dashboard} manifest={manifest} />
          <div>
            {dashboard.category && <p className="eyebrow">{dashboard.category}</p>}
            <h1>{dashboard.name}</h1>
            <p className="lead">
              {dashboard.description ?? "A community dashboard for Metrix.Bar."}
            </p>
            {repositoryURL && (
              <a
                className="project-link"
                href={repositoryURL}
                aria-label={`View ${repository} on GitHub`}
              >
                GitHub project <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>
        <article className="install-panel" aria-labelledby="install">
          <h2 id="install">Install this dashboard</h2>
          <a role="button" href={installLink(dashboard.id, manifest.registryURL)}>
            Install in Metrix.Bar
          </a>
          <a role="button" className="secondary outline" href={file} download>
            Download .bar
          </a>
          <small>Requires Metrix.Bar. Confirm installation in the app.</small>
        </article>
        <div className="detail-content">
          <section aria-labelledby="setup">
            <h2 id="setup">{dashboard.docs ? "Setup & usage" : "Get started"}</h2>
            {dashboard.docs ? (
              <p className="setup">{dashboard.docs}</p>
            ) : (
              <p>
                Choose Install in Metrix.Bar, then review the dashboard's permissions in the app.
              </p>
            )}
          </section>
          <section aria-labelledby="updates">
            <h2 id="updates">Keep it up to date</h2>
            <p>
              Install from this registry to check for updates in Metrix.Bar. You choose when to
              apply them.
            </p>
          </section>
          <details>
            <summary>Verify your download</summary>
            <p>Compare the SHA-256 of your downloaded file with this release.</p>
            <code className="checksum">{dashboard.sha256}</code>
          </details>
        </div>
        <aside className="dashboard-information" aria-labelledby="dashboard-details">
          <h2 id="dashboard-details">Dashboard details</h2>
          <dl>
            {dashboard.author && (
              <>
                <dt>Author</dt>
                <dd>
                  <Author name={dashboard.author} />
                </dd>
              </>
            )}
            <dt>Version</dt>
            <dd>{dashboard.version}</dd>
            <dt>Dashboard ID</dt>
            <dd>
              <code>{dashboard.id}</code>
            </dd>
            {dashboard.category && (
              <>
                <dt>Category</dt>
                <dd>{dashboard.category}</dd>
              </>
            )}
            {dashboard.license && (
              <>
                <dt>License</dt>
                <dd>{dashboard.license === "UNLICENSED" ? "Not declared" : dashboard.license}</dd>
              </>
            )}
          </dl>
          {(homepage || dashboard.source) && (
            <div className="source-links">
              {homepage && (
                <a href={homepage}>
                  Project homepage <span aria-hidden="true">↗</span>
                </a>
              )}
              {dashboard.source && (
                <a href={dashboard.source}>
                  Source code <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
      <p className="back-link">
        <a href="/#dashboards">← Browse all dashboards</a>
      </p>
    </Site>
  );
}
