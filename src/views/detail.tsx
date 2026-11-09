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
      <header className="detail-heading">
        <DashboardIcon dashboard={dashboard} manifest={manifest} />
        <div>
          {dashboard.category && <p className="eyebrow">{dashboard.category}</p>}
          <h1>{dashboard.name}</h1>
          <p className="lead">{dashboard.description ?? "A community dashboard for Metrix.Bar."}</p>
        </div>
      </header>
      <div className="detail-grid">
        <div>
          <section aria-labelledby="setup">
            <h2 id="setup">{dashboard.docs ? "Setup & usage" : "Get started"}</h2>
            {dashboard.docs ? (
              <p className="setup">{dashboard.docs}</p>
            ) : (
              <p>
                Add this registry in Metrix.Bar, then choose Install to add the dashboard. Review
                the requested permissions in the app.
              </p>
            )}
          </section>
          <section aria-labelledby="updates">
            <h2 id="updates">Keep it up to date</h2>
            <p>
              Install through Metrix.Bar to receive future updates from this registry. The dashboard
              keeps its original connections to external services.
            </p>
          </section>
          <details>
            <summary>Verify your download</summary>
            <p>Compare the SHA-256 of your downloaded file with this release.</p>
            <code className="checksum">{dashboard.sha256}</code>
          </details>
        </div>
        <aside aria-label="Installation and dashboard information">
          <article className="install-panel">
            <h2>Add to your menu bar</h2>
            <a role="button" href={installLink(dashboard.id, manifest.registryURL)}>
              Install in Metrix.Bar
            </a>
            <a role="button" className="secondary outline" href={file} download>
              Download .bar
            </a>
            <small>Requires Metrix.Bar for macOS. Installation is confirmed in the app.</small>
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
            {(dashboard.homepage || dashboard.source) && (
              <footer className="source-links">
                {dashboard.homepage && (
                  <a href={dashboard.homepage}>
                    Project homepage <span aria-hidden="true">↗</span>
                  </a>
                )}
                {dashboard.source && (
                  <a href={dashboard.source}>
                    Source code <span aria-hidden="true">↗</span>
                  </a>
                )}
              </footer>
            )}
          </article>
        </aside>
      </div>
      <p className="back-link">
        <a href="/#dashboards">← Browse all dashboards</a>
      </p>
    </Site>
  );
}
