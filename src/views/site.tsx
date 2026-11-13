import type { ReactNode } from "react";
import { css, cx } from "../../styled-system/css";
import { localePath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Manifest } from "../registry.ts";
import { LanguagePicker } from "./language-picker.tsx";
import "./site.css";

const container = css({
  width: "full",
  maxWidth: "1200px",
  mx: "auto",
  px: { base: "5", md: "8" },
});

export function Site({
  manifest,
  locale,
  path = "/",
  children,
}: {
  manifest: Manifest;
  locale: Locale;
  path?: string;
  children: ReactNode;
}) {
  return (
    <>
      <a
        className={css({
          position: "absolute",
          top: "4",
          left: "4",
          zIndex: "10",
          p: "3",
          bg: "accent",
          color: "accent.fg",
          rounded: "md",
          transform: "translateY(-200%)",
          _focus: { transform: "translateY(0)" },
        })}
        href="#main"
      >
        {m.skip_content({}, { locale })}
      </a>
      <header className={cx(container, css({ py: { base: "5", md: "7" } }))}>
        <nav
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "4",
            flexWrap: "wrap",
          })}
          aria-label={m.main_navigation({}, { locale })}
        >
          <a
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "2.5",
              fontWeight: "800",
              fontSize: "lg",
              letterSpacing: "tight",
              textDecoration: "none",
            })}
            href={localePath("/", locale)}
          >
            <span
              aria-hidden="true"
              className={css({
                width: "3",
                height: "3",
                bg: "accent",
                borderWidth: "2px",
                borderColor: "border.strong",
                rounded: "sm",
                flexShrink: "0",
              })}
            />
            {manifest.registry.name}
          </a>
          <ul
            className={css({
              display: "flex",
              flexWrap: "wrap",
              width: { base: "full", sm: "auto" },
              alignItems: "center",
              gap: { base: "4", md: "6" },
              listStyle: "none",
              fontSize: "sm",
              fontWeight: "semibold",
              "& a": {
                display: "inline-flex",
                alignItems: "center",
                minHeight: "8",
                whiteSpace: "nowrap",
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              },
            })}
          >
            <li>
              <a href={`${localePath("/", locale)}#dashboards`}>{m.dashboards({}, { locale })}</a>
            </li>
            <li>
              <a href="https://metrix.bar/">
                Metrix.Bar <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/agili-app/Awesome.Metrix.Bar"
                aria-label={m.site_github_label({}, { locale })}
                title={m.site_github_label({}, { locale })}
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
            <li className={css({ marginLeft: "auto" })}>
              <LanguagePicker locale={locale} path={path} />
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className={container}>
        {children}
      </main>
      <footer
        className={cx(
          container,
          css({
            mt: "16",
            py: "8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "3",
            color: "fg.muted",
            fontSize: "sm",
            borderTopWidth: "1px",
            borderColor: "border",
          }),
        )}
      >
        <p>{m.footer_description({}, { locale })}</p>
        <p>
          <a href="/dashboards/index.json">{m.registry_json({}, { locale })}</a> ·{" "}
          <a href="https://metrix.bar/docs/registries.md">{m.registry_guide({}, { locale })}</a>
        </p>
      </footer>
    </>
  );
}
