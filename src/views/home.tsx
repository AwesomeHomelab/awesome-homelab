import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { css } from "../../styled-system/css";
import { button } from "../../styled-system/recipes";
import { registryLink } from "../metrix.ts";
import { sortedDashboards } from "../catalog.ts";
import { baseLocale, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Manifest } from "../registry.ts";
import { DashboardCard } from "./dashboard.tsx";
import { Site } from "./site.tsx";

export function Home({ manifest, locale = baseLocale }: { manifest: Manifest; locale?: Locale }) {
  return (
    <Site manifest={manifest} locale={locale}>
      <section
        className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", lg: "1.2fr 1fr" },
          alignItems: "center",
          gap: { base: "8", lg: "12" },
          bg: "bg.hero",
          borderWidth: "2px",
          borderColor: "border.strong",
          rounded: "2xl",
          p: { base: "6", md: "10", lg: "12" },
          boxShadow: "offset",
          mb: { base: "12", md: "16" },
        })}
        aria-labelledby="intro"
      >
        <header className={css({ display: "grid", gap: "5", minWidth: "0" })}>
          <p className={css({ textStyle: "eyebrow", color: "fg.muted" })}>
            {m.hero_eyebrow({}, { locale })}
          </p>
          <h1 id="intro" className={css({ textStyle: "display", color: "fg.headline" })}>
            {m.hero_heading({}, { locale })}
          </h1>
          <p className={css({ fontSize: "lg", lineHeight: "1.6" })}>
            {m.hero_description({}, { locale })}
          </p>
          <p className={css({ fontSize: "sm", color: "fg.muted" })}>
            {m.hero_details({}, { locale })}
          </p>
          <a href="#dashboards" className={css({ justifySelf: "start", fontWeight: "bold" })}>
            {m.browse_catalog({}, { locale })} <span aria-hidden="true">↓</span>
          </a>
        </header>
        <article
          className={css({
            layerStyle: "panel",
            p: { base: "5", md: "7" },
            display: "grid",
            gap: "4",
            minWidth: "0",
          })}
        >
          <h2 className={css({ textStyle: "heading" })}>{m.registry_heading({}, { locale })}</h2>
          <p className={css({ color: "fg.muted", fontSize: "sm" })}>
            {m.registry_description({}, { locale })}
          </p>
          <Button className={button()} render={<a href={registryLink(manifest.registryURL)} />}>
            {m.add_registry({}, { locale })}
          </Button>
          <Field
            name="registry-url"
            className={css({ display: "grid", gap: "2", mt: "2", minWidth: "0" })}
          >
            <FieldLabel className={css({ fontSize: "xs", fontWeight: "semibold" })}>
              {m.registry_url_label({}, { locale })}
            </FieldLabel>
            <Input
              readOnly
              value={manifest.registryURL}
              spellCheck={false}
              className={css({
                width: "full",
                minWidth: "0",
                minHeight: "11",
                px: "3",
                py: "2.5",
                bg: "bg.subtle",
                color: "fg",
                borderWidth: "1px",
                borderColor: "border.strong",
                rounded: "md",
                fontFamily: "mono",
                fontSize: "xs",
              })}
            />
          </Field>
          <small className={css({ color: "fg.muted", fontSize: "xs", lineHeight: "1.6" })}>
            <a href="https://metrix.bar/">Metrix.Bar</a>
            {m.platform_requirements({}, { locale })}
          </small>
        </article>
      </section>
      <section aria-labelledby="dashboards">
        <header
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            flexWrap: "wrap",
            gap: "4",
            mb: "7",
          })}
        >
          <div>
            <h2 id="dashboards" className={css({ textStyle: "heading", mb: "2" })}>
              {m.catalog_heading({}, { locale })}
            </h2>
            <p className={css({ color: "fg.muted", fontSize: "sm" })}>
              {m.sort_description({}, { locale })}
            </p>
          </div>
          <small className={css({ fontFamily: "mono", fontSize: "xs", color: "fg.muted" })}>
            {m.dashboard_count({ count: manifest.registry.dashboards.length }, { locale })}
          </small>
        </header>
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: { base: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: "6",
          })}
        >
          {sortedDashboards(manifest).map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              manifest={manifest}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </Site>
  );
}
