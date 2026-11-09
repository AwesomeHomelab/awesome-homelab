import { defineHandler, defineHead } from "void/handler";
import type { InferProps } from "void/handler";
import type { PageParams } from "void/routes";
import manifest from "../../../.generated/manifest.json";
import { dashboardHead } from "../../seo.ts";

export const loader = defineHandler((context) => {
  const dashboard = manifest.registry.dashboards.find(({ id }) => id === context.req.param("id"));
  if (!dashboard) return context.notFound();
  return { dashboard };
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_context, { dashboard }) =>
  dashboardHead(dashboard, manifest),
);

export function getPrerenderPaths(): PageParams<"/dashboards/[id]">[] {
  return manifest.registry.dashboards.map(({ id }) => ({ id }));
}
