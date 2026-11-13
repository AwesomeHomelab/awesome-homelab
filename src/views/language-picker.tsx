import { css } from "../../styled-system/css";
import { languageNames, locales, localePath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";

export function LanguagePicker({ locale, path }: { locale: Locale; path: string }) {
  return (
    <details className={css({ position: "relative" })}>
      <summary
        aria-label={`${m.language_picker({}, { locale })}: ${languageNames[locale]}`}
        className={css({
          cursor: "pointer",
          minHeight: "8",
          py: "1.5",
          whiteSpace: "nowrap",
        })}
      >
        <span lang={locale}>{languageNames[locale]}</span>
      </summary>
      <nav
        aria-label={m.language_picker({}, { locale })}
        className={css({
          position: "absolute",
          right: "0",
          top: "calc(100% + 0.5rem)",
          zIndex: "20",
          width: "max-content",
          minWidth: "44",
          layerStyle: "panel",
          p: "2",
          boxShadow: "offset",
        })}
      >
        <ul className={css({ listStyle: "none", display: "grid", gap: "1" })}>
          {locales.map((language) => (
            <li key={language}>
              <a
                href={localePath(path, language)}
                hrefLang={language}
                lang={language}
                aria-current={language === locale ? "page" : undefined}
                className={css({
                  width: "full",
                  px: "3",
                  py: "1.5",
                  rounded: "sm",
                  _hover: { bg: "bg.subtle" },
                  _currentPage: {
                    bg: "accent",
                    color: "accent.fg",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  },
                })}
              >
                {languageNames[language]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
