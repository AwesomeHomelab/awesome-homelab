import { Button } from "@ui-sdk/react/button";
import { css, cx } from "../../styled-system/css";
import { button } from "../../styled-system/recipes";
import { dashboardLinks } from "../catalog.ts";
import { dashboardPath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard, Manifest } from "../registry.ts";
import { Author } from "./author.tsx";
import { ProjectStars } from "./project-stars.tsx";
import { DashboardIcon } from "./dashboard-icon.tsx";

export function DashboardCard({
  dashboard,
  manifest,
  locale,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  locale: Locale;
}) {
  const repository = manifest.dashboardRepositories[dashboard.id];
  const links = dashboardLinks(dashboard, manifest);
  return (
    <article
      className={cx(
        "dashboard-card",
        css({
          layerStyle: "panel",
          p: { base: "5", md: "6" },
          display: "flex",
          flexDirection: "column",
          gap: "4",
          minWidth: "0",
        }),
      )}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "3",
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "3", minWidth: "0" })}>
          <DashboardIcon dashboard={dashboard} manifest={manifest} />
          <div className={css({ minWidth: "0" })}>
            <h3
              className={css({
                fontSize: "lg",
                fontWeight: "bold",
                lineHeight: "1.3",
                "& a": { textDecoration: "none", _hover: { textDecoration: "underline" } },
              })}
            >
              <a href={dashboardPath(dashboard.id, locale)}>{dashboard.name}</a>
            </h3>
            <p
              className={css({
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "1.5",
                mt: "2",
                fontSize: "xs",
                color: "fg.muted",
              })}
            >
              {dashboard.author && (
                <>
                  <Author name={dashboard.author} />
                  {" · "}
                </>
              )}
              v{dashboard.version}
            </p>
          </div>
        </div>
        {repository && (
          <ProjectStars
            repository={repository}
            stars={manifest.projectStars[repository] ?? null}
            locale={locale}
          />
        )}
      </div>
      <p className={css({ color: "fg.muted", fontSize: "sm", whiteSpace: "pre-line" })}>
        {dashboard.description ?? m.fallback_description({}, { locale })}
      </p>
      {dashboard.category && (
        <small
          className={css({
            alignSelf: "start",
            bg: "bg.subtle",
            px: "2.5",
            py: "1",
            borderWidth: "1px",
            borderColor: "border",
            rounded: "md",
            fontSize: "xs",
            color: "fg.muted",
          })}
        >
          {dashboard.category}
        </small>
      )}
      <footer
        className={css({
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4",
          mt: "auto",
          pt: "4",
          borderTopWidth: "1px",
          borderColor: "border",
          fontSize: "sm",
          fontWeight: "semibold",
        })}
      >
        <a
          href={dashboardPath(dashboard.id, locale)}
          aria-label={m.view_details({ name: dashboard.name }, { locale })}
        >
          {m.details({}, { locale })} <span aria-hidden="true">→</span>
        </a>
        {repository && (
          <a
            className={css({ color: "fg.muted" })}
            href={links.repository}
            aria-label={m.view_repository({ repository }, { locale })}
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        )}
        <Button
          className={cx(button({ visual: "outline" }), css({ ml: "auto" }))}
          render={<a href={links.install} />}
          aria-label={m.install_named({ name: dashboard.name }, { locale })}
        >
          {m.install({}, { locale })}
        </Button>
      </footer>
    </article>
  );
}
