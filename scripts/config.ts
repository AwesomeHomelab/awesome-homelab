import { compare, parse } from "semver";
import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const httpsURL = z.url({ protocol: /^https$/ }).refine((value) => {
  const url = new URL(value);
  return !url.username && !url.password;
}, "URL must not contain credentials");
export function isBarPath(value: string): boolean {
  return (
    value.endsWith(".bar") &&
    !/[\p{Cc}\\?#:]/u.test(value) &&
    value.split("/").every((part) => part && part !== "." && part !== "..")
  );
}

const barPath = z.string().refine(isBarPath, "Invalid source path");
const digest = z
  .hash("sha256")
  .refine((value) => value === value.toLowerCase(), "SHA-256 must be lowercase");
const pin = z.strictObject({ url: httpsURL, sha256: digest });
const tool = pin.omit({ sha256: true });
const release = z.strictObject({
  commit: z.string().regex(/^[a-f0-9]{40}$/, "Release must pin a full commit"),
  version: z.string().refine(
    (value) => {
      const version = parse(value);
      // semver's normalized version omits build metadata.
      return (
        version !== null &&
        value === `${version.version}${version.build.length ? `+${version.build.join(".")}` : ""}`
      );
    },
    { message: "Invalid SemVer", abort: true },
  ),
  sha256: digest,
  path: barPath.optional(),
  icon: pin.extend({ contentType: z.string().startsWith("image/") }).optional(),
});
const source = z.strictObject({
  id,
  repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  path: barPath,
  author: z.string().min(1),
  license: z.string().min(1),
  releases: z
    .array(release)
    .min(1)
    .superRefine((releases, ctx) => {
      for (const [index, current] of releases.entries()) {
        const previous = releases[index - 1];
        if (!previous) continue;
        const order = compare(current.version, previous.version);
        if (order < 0) {
          ctx.addIssue({ code: "custom", path: [index, "version"], message: "Version rollback" });
        } else if (order === 0 && current.sha256 !== previous.sha256) {
          ctx.addIssue({
            code: "custom",
            path: [index, "sha256"],
            message: "Same version has different bytes",
          });
        }
      }
    }),
});
const sources = z.strictObject({
  registry: z.strictObject({
    id,
    name: z.string().min(1),
    origin: httpsURL.refine((value) => new URL(value).origin === value, "Expected an HTTPS origin"),
  }),
  tools: z.strictObject({ builder: tool, schema: tool }),
  dashboards: z.array(source).superRefine((dashboards, ctx) => {
    const ids = new Set<string>();
    for (const [index, dashboard] of dashboards.entries()) {
      if (ids.has(dashboard.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Invalid or duplicate source id: ${dashboard.id}`,
        });
      }
      ids.add(dashboard.id);
    }
  }),
});

export type Pin = z.infer<typeof pin>;
export type Release = z.infer<typeof release>;
export type Source = z.infer<typeof source>;

export function validateSources(config: unknown) {
  return sources.parse(config);
}
