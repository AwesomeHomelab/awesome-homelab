import { registryLink } from "../metrix.ts";
import { sortedDashboards } from "../catalog.ts";
import type { Manifest } from "../registry.ts";
import { DashboardCard } from "./dashboard.tsx";
import { Site } from "./site.tsx";
import "./home.css";

export function Home({ manifest }: { manifest: Manifest }) {
  return (
    <Site manifest={manifest}>
      <section className="hero" aria-labelledby="intro">
        <header>
          <p className="eyebrow">Community dashboards</p>
          <h1 id="intro">A registry of dashboards for Metrix.Bar.</h1>
          <p className="lead">
            Browse community dashboards, check what each one needs, and install it from inside the
            app.
          </p>
          <p>
            Each dashboard page shows its author, version, and license, with links to the project.
          </p>
          <a href="#dashboards">
            Browse the catalog <span aria-hidden="true">↓</span>
          </a>
        </header>
        <article className="registry-panel">
          <h2>Browse in Metrix.Bar</h2>
          <p>Add this registry to browse dashboards and check for updates in the app.</p>
          <a role="button" href={registryLink(manifest.registryURL)}>
            Add registry
          </a>
          <label htmlFor="registry-url">Or paste this URL in Settings → Registries</label>
          <input id="registry-url" readOnly value={manifest.registryURL} spellCheck={false} />
          <small>
            Requires <a href="https://metrix.bar/">Metrix.Bar</a> for macOS, Windows, or Linux
            (experimental). Confirm in the app.
          </small>
        </article>
      </section>
      <section aria-labelledby="dashboards">
        <header className="section-heading">
          <div>
            <h2 id="dashboards">All dashboards</h2>
            <p>Ranked by GitHub stars per dashboard from the same repository.</p>
          </div>
          <small>{manifest.registry.dashboards.length} dashboards</small>
        </header>
        <div className="dashboard-grid">
          {sortedDashboards(manifest).map((dashboard) => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} manifest={manifest} />
          ))}
        </div>
      </section>
    </Site>
  );
}
