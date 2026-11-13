import { Button } from "@ui-sdk/react/button";
import { css } from "../../styled-system/css";
import { button } from "../../styled-system/recipes";
import { dashboardLinks } from "../catalog.ts";
import { baseLocale, dashboardPath, localePath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard, Manifest } from "../registry.ts";
import { DashboardIcon } from "./dashboard-icon.tsx";
import { DashboardInfo } from "./dashboard-info.tsx";
import { Site } from "./site.tsx";

export function DashboardDetail({
  dashboard,
  manifest,
  locale = baseLocale,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  locale?: Locale;
}) {
  const links = dashboardLinks(dashboard, manifest);
  return (
    <Site manifest={manifest} locale={locale} path={dashboardPath(dashboard.id)}>
      <nav
        className={css({ py: "4", mb: { base: "5", md: "8" }, color: "fg.muted", fontSize: "sm" })}
        aria-label={m.breadcrumb({}, { locale })}
      >
        <ol
          className={css({
            display: "flex",
            flexWrap: "wrap",
            gap: "3",
            listStyle: "none",
            "& li + li::before": { content: '"/"', mr: "3" },
          })}
        >
          <li>
            <a href={localePath("/", locale)}>{m.dashboards({}, { locale })}</a>
          </li>
          <li aria-current="page">{dashboard.name}</li>
        </ol>
      </nav>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: { base: "minmax(0, 1fr)", lg: "minmax(0, 1.75fr) minmax(0, 1fr)" },
          gap: { base: "8", lg: "10" },
          alignItems: "start",
        })}
      >
        <header
          className={css({
            display: "flex",
            alignItems: "start",
            gap: "4",
            py: "2",
            minWidth: "0",
          })}
        >
          <DashboardIcon dashboard={dashboard} manifest={manifest} loading="eager" />
          <div className={css({ display: "grid", gap: "4", minWidth: "0" })}>
            {dashboard.category && (
              <p className={css({ textStyle: "eyebrow", color: "fg.muted" })}>
                {dashboard.category}
              </p>
            )}
            <h1 className={css({ textStyle: "display", color: "fg.headline" })}>
              {dashboard.name}
            </h1>
            <p className={css({ fontSize: "lg", color: "fg.muted", whiteSpace: "pre-line" })}>
              {dashboard.description ?? m.fallback_description({}, { locale })}
            </p>
            {links.repository && (
              <a
                className={css({ justifySelf: "start", fontSize: "sm", fontWeight: "semibold" })}
                href={links.repository}
                aria-label={m.view_repository(
                  { repository: manifest.dashboardRepositories[dashboard.id] },
                  { locale },
                )}
              >
                {m.github_project({}, { locale })} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>
        <article
          className={css({ layerStyle: "panel", p: "6", display: "grid", gap: "4" })}
          aria-labelledby="install"
        >
          <h2 id="install" className={css({ textStyle: "heading" })}>
            {m.install_heading({}, { locale })}
          </h2>
          <Button className={button()} render={<a href={links.install} />}>
            {m.install_in_app({}, { locale })}
          </Button>
          <Button
            className={button({ visual: "outline" })}
            render={<a href={links.download} download />}
          >
            {m.download_bar({}, { locale })}
          </Button>
          <small className={css({ color: "fg.muted", fontSize: "xs" })}>
            {m.install_requirement({}, { locale })}
          </small>
        </article>
        <div
          className={css({
            display: "grid",
            gap: "8",
            minWidth: "0",
            "& h2": { textStyle: "heading", mb: "4" },
            "& p": { color: "fg.muted" },
          })}
        >
          <section aria-labelledby="setup">
            <h2 id="setup">
              {dashboard.docs ? m.setup_heading({}, { locale }) : m.getting_started({}, { locale })}
            </h2>
            {dashboard.docs ? (
              <p className={css({ whiteSpace: "pre-wrap" })}>{dashboard.docs}</p>
            ) : (
              <p>{m.setup_fallback({}, { locale })}</p>
            )}
          </section>
          <section aria-labelledby="updates">
            <h2 id="updates">{m.updates_heading({}, { locale })}</h2>
            <p>{m.updates_description({}, { locale })}</p>
          </section>
          <details
            className={css({
              borderTopWidth: "1px",
              borderColor: "border",
              pt: "5",
              "& summary": { cursor: "pointer", fontWeight: "semibold", minHeight: "8" },
              "& p": { mt: "4", mb: "3", fontSize: "sm" },
            })}
          >
            <summary>{m.verify_download({}, { locale })}</summary>
            <p>{m.verify_description({}, { locale })}</p>
            <code
              className={css({
                display: "block",
                p: "4",
                bg: "bg.subtle",
                rounded: "md",
                borderWidth: "1px",
                borderColor: "border",
                fontFamily: "mono",
                fontSize: "xs",
                overflowWrap: "anywhere",
              })}
            >
              {dashboard.sha256}
            </code>
          </details>
        </div>
        <DashboardInfo dashboard={dashboard} homepage={links.homepage} locale={locale} />
      </div>
      <p className={css({ mt: "10", fontSize: "sm", fontWeight: "semibold" })}>
        <a href={`${localePath("/", locale)}#dashboards`}>← {m.browse_all({}, { locale })}</a>
      </p>
    </Site>
  );
}
