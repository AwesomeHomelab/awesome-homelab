import settings from "./settings.json" with { type: "json" };

const prefixedLocales = settings.locales.filter((locale) => locale !== settings.baseLocale);

export default {
  outdir: "./src/paraglide",
  emitTsDeclarations: true,
  outputStructure: "message-modules",
  strategy: ["url", "baseLocale"],
  urlPatterns: [
    {
      pattern: "/",
      localized: [
        ...prefixedLocales.map((locale) => [locale, `/${locale}`]),
        [settings.baseLocale, "/"],
      ],
    },
    {
      pattern: "/:path(.*)?",
      localized: [
        ...prefixedLocales.map((locale) => [locale, `/${locale}/:path(.*)?`]),
        [settings.baseLocale, "/:path(.*)?"],
      ],
    },
  ],
};
