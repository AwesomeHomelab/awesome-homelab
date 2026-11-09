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
          <p className="lead">A little more insight, right in your menu bar.</p>
          <p>
            Servers, usage, markets, and more. Find a dashboard, check its setup, and make it yours.
          </p>
          <a href="#dashboards">
            Explore the collection <span aria-hidden="true">↓</span>
          </a>
        </header>
        <article className="registry-panel">
          <h2>One registry. Every dashboard.</h2>
          <p>Add the collection to Metrix.Bar and keep your dashboards connected to updates.</p>
          <a role="button" href={registryLink(manifest.registryURL)}>
            Add registry
          </a>
          <label htmlFor="registry-url">Or paste this URL in Settings → Registries</label>
          <input id="registry-url" readOnly value={manifest.registryURL} spellCheck={false} />
          <small>
            Requires <a href="https://metrix.bar/">Metrix.Bar for macOS</a>. The app will ask for
            confirmation.
          </small>
        </article>
      </section>
      <section aria-labelledby="dashboards">
        <header className="section-heading">
          <div>
            <h2 id="dashboards">Find your next dashboard</h2>
            <p>Small tools for the things you like to keep an eye on.</p>
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
