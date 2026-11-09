import { registryLink } from "../metrix.ts";
import type { Manifest } from "../registry.ts";
import { DashboardCard } from "./dashboard.tsx";
import { Site } from "./site.tsx";
import "./home.css";

export function Home({ manifest }: { manifest: Manifest }) {
  return (
    <Site manifest={manifest}>
      <section className="hero" aria-labelledby="intro">
        <header>
          <p className="eyebrow">The community collection</p>
          <h1 id="intro">Community dashboards for Metrix.Bar.</h1>
          <p className="lead">Track servers, AI usage, and markets at a glance.</p>
          <p>Find a dashboard, read its setup, and install it in Metrix.Bar.</p>
          <a href="#dashboards">
            Explore the collection <span aria-hidden="true">↓</span>
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
            <h2 id="dashboards">Find your next dashboard</h2>
            <p>Check setup instructions and requirements before installing.</p>
          </div>
          <small>{manifest.registry.dashboards.length} dashboards</small>
        </header>
        <div className="dashboard-grid">
          {manifest.registry.dashboards.map((dashboard) => (
            <DashboardCard key={dashboard.id} dashboard={dashboard} manifest={manifest} />
          ))}
        </div>
      </section>
    </Site>
  );
}
