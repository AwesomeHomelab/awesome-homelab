import { css } from "../../styled-system/css";
import type { Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard } from "../registry.ts";
import { Author } from "./author.tsx";

export function DashboardInfo({
  dashboard,
  homepage,
  locale,
}: {
  dashboard: Dashboard;
  homepage?: string;
  locale: Locale;
}) {
  return (
    <aside
      className={css({ layerStyle: "panel", p: "6", minWidth: "0" })}
      aria-labelledby="dashboard-details"
    >
      <h2 id="dashboard-details" className={css({ textStyle: "heading", mb: "5" })}>
        {m.details_heading({}, { locale })}
      </h2>
      <dl
        className={css({
          display: "grid",
          gap: "2",
          "& dt": { color: "fg.muted", fontSize: "xs", fontWeight: "semibold" },
          "& dd": { mb: "3", fontSize: "sm" },
          "& code": { fontFamily: "mono", fontSize: "xs" },
        })}
      >
        {dashboard.author && (
          <>
            <dt>{m.author({}, { locale })}</dt>
            <dd>
              <Author name={dashboard.author} />
            </dd>
          </>
        )}
        <dt>{m.version({}, { locale })}</dt>
        <dd>{dashboard.version}</dd>
        <dt>{m.dashboard_id({}, { locale })}</dt>
        <dd>
          <code>{dashboard.id}</code>
        </dd>
        {dashboard.category && (
          <>
            <dt>{m.category({}, { locale })}</dt>
            <dd>{dashboard.category}</dd>
          </>
        )}
        {dashboard.license && (
          <>
            <dt>{m.license({}, { locale })}</dt>
            <dd>
              {dashboard.license === "UNLICENSED"
                ? m.license_undeclared({}, { locale })
                : dashboard.license}
            </dd>
          </>
        )}
      </dl>
      {(homepage || dashboard.source) && (
        <div
          className={css({
            display: "grid",
            gap: "3",
            pt: "4",
            mt: "2",
            borderTopWidth: "1px",
            borderColor: "border",
            fontSize: "sm",
          })}
        >
          {homepage && (
            <a href={homepage}>
              {m.project_homepage({}, { locale })} <span aria-hidden="true">↗</span>
            </a>
          )}
          {dashboard.source && (
            <a href={dashboard.source}>
              {m.source_code({}, { locale })} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
