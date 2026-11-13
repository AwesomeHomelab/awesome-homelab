import { defineHandler, defineHead } from "void/handler";
import type { InferProps } from "void/handler";
import type { PageParams } from "void/routes";
import manifest from "../../../.generated/manifest.json";
import { baseLocale, isLocale, prefixedLocales } from "../../i18n.ts";
import { homeHead } from "../../seo.ts";

export const loader = defineHandler((context) => {
  const locale = context.req.param("locale");
  if (!isLocale(locale) || locale === baseLocale) return context.notFound();
  return { locale };
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_context, { locale }) => homeHead(manifest, locale));

export function getPrerenderPaths(): PageParams<"/[locale]">[] {
  return prefixedLocales.map((locale) => ({ locale }));
}
