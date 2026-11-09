import type { ReactNode } from "react";
import type { Manifest } from "../registry.ts";
import "@picocss/pico/css/pico.jade.min.css";
import "./site.css";

export function Site({ manifest, children }: { manifest: Manifest; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="container site-header">
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <a className="brand" href="/">
                {manifest.registry.name}
              </a>
            </li>
          </ul>
          <ul>
            <li>
              <a href="/#dashboards">Dashboards</a>
            </li>
            <li>
              <a href="https://metrix.bar/">
                Metrix.Bar <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className="container">
        {children}
      </main>
      <footer className="container site-footer">
        <small>Independent dashboards. One community registry.</small>
        <small>
          <a href="/dashboards/index.json">Registry JSON</a> ·{" "}
          <a href="https://metrix.bar/docs/registries.md">Registry guide</a>
        </small>
      </footer>
    </>
  );
}
