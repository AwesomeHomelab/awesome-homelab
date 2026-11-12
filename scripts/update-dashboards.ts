import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod";
import { parseBar } from "./build-registry.ts";
import { validateSources } from "./config.ts";
import type { Release } from "./config.ts";
import { cacheDir, download } from "./download.ts";
import { writeAtomic } from "./files.ts";
import { get } from "./http.ts";
import { completeEntry, sha256, sourceURL, validateRegistry } from "./registry.ts";

async function request(url: string, token?: string) {
  const response = await get(new URL(url), {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (response.status !== 200) throw new Error(`Download failed (${response.status}): ${url}`);
  return response;
}

async function head(repository: string) {
  const response = await request(
    `https://api.github.com/repos/${repository}/commits/HEAD`,
    process.env.GH_TOKEN,
  );
  return z.object({ sha: z.hash("sha1") }).parse(await response.json()).sha;
}

export async function updateDashboards(input: unknown) {
  const config = validateSources(input);
  const [builder, schema] = await Promise.all([
    download(config.tools.builder, "mjs"),
    download(config.tools.schema, "json"),
  ]);
  const parsedSchema = JSON.parse(schema.bytes.toString()) as object;
  const heads = new Map<string, Promise<string>>();
  let changed = false;
  let failed = false;
  for (const source of config.dashboards) {
    try {
      const previous = source.releases.at(-1)!;
      if (!heads.has(source.repository)) heads.set(source.repository, head(source.repository));
      const commit = (await heads.get(source.repository))!;
      const { bytes } = await download({ url: sourceURL(source, { ...previous, commit }) }, "bar");
      const hash = sha256(bytes);
      if (hash === previous.sha256) continue;
      const entry = await parseBar(builder.path, bytes, previous.path ?? source.path, source.id);
      if (entry.protocol_version !== "0") throw new Error("Unsupported dashboard protocol");
      const release: Release = {
        commit,
        version: entry.version,
        sha256: hash,
        ...(previous.path ? { path: previous.path } : {}),
      };
      if (entry.icon && /^(?:https?:|\/\/)/i.test(entry.icon)) {
        const response = await request(entry.icon);
        const iconBytes = Buffer.from(await response.arrayBuffer());
        release.icon = {
          url: entry.icon,
          sha256: sha256(iconBytes),
          contentType:
            response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "",
        };
        await writeAtomic(join(cacheDir, "downloads", `${release.icon.sha256}.icon`), iconBytes);
      }
      validateSources({
        ...config,
        dashboards: [{ ...source, releases: [...source.releases, release] }],
      });
      validateRegistry(
        {
          $schema: config.tools.schema.url,
          schema_version: 1,
          id: config.registry.id,
          name: config.registry.name,
          dashboards: [completeEntry(entry, source, release)],
        },
        parsedSchema,
      );
      source.releases.push(release);
      changed = true;
      console.log(`${source.id}: ${previous.version} -> ${release.version}`);
    } catch (error) {
      failed = true;
      console.error(`${source.id}: ${String(error)}`);
    }
  }
  return { config, changed, failed };
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { "dry-run": { type: "boolean" } } });
  const path = resolve(import.meta.dirname, "../registry/sources.json");
  const { config, changed, failed } = await updateDashboards(
    JSON.parse(await readFile(path, "utf8")),
  );
  if (changed && !values["dry-run"])
    await writeAtomic(path, `${JSON.stringify(config, null, 2)}\n`);
  process.exitCode = Number(failed);
}
