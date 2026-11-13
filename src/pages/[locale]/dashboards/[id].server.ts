import { defineHandler, defineHead } from "void/handler";
import type { InferProps } from "void/handler";
import type { PageParams } from "void/routes";
import manifest from "../../../../.generated/manifest.json";
import { baseLocale, isLocale, prefixedLocales } from "../../../i18n.ts";
import { dashboardHead } from "../../../seo.ts";

export const loader = defineHandler((context) => {
  const locale = context.req.param("locale");
  if (!isLocale(locale) || locale === baseLocale) return context.notFound();
  const dashboard = manifest.registry.dashboards.find(({ id }) => id === context.req.param("id"));
  if (!dashboard) return context.notFound();
  return { dashboard, locale };
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_context, { dashboard, locale }) =>
  dashboardHead(dashboard, manifest, locale),
);

export function getPrerenderPaths(): PageParams<"/[locale]/dashboards/[id]">[] {
  return prefixedLocales.flatMap((locale) =>
    manifest.registry.dashboards.map(({ id }) => ({ locale, id })),
  );
}
