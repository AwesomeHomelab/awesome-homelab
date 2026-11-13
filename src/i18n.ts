import { baseLocale, locales, localizeHref, type Locale } from "./paraglide/runtime.js";

export { baseLocale, isLocale, locales, type Locale } from "./paraglide/runtime.js";

export const prefixedLocales = locales.filter((locale) => locale !== baseLocale);

export const languageNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
};

export function localePath(path: string, locale: Locale = baseLocale): string {
  return localizeHref(path, { locale });
}

export function dashboardPath(id: string, locale: Locale = baseLocale): string {
  return localePath(`/dashboards/${encodeURIComponent(id)}`, locale);
}
