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
            <li>
              <a
                className="repository-link"
                href="https://github.com/agili-app/Awesome.Metrix.Bar"
                aria-label="Awesome.Metrix.Bar on GitHub"
                title="Awesome.Metrix.Bar on GitHub"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className="container">
        {children}
      </main>
      <footer className="container site-footer">
        <small>Community dashboards for Metrix.Bar.</small>
        <small>
          <a href="/dashboards/index.json">Registry JSON</a> ·{" "}
          <a href="https://metrix.bar/docs/registries.md">Registry guide</a>
        </small>
      </footer>
    </>
  );
}
