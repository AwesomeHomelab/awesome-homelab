import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import sources from "../registry/sources.json" with { type: "json" };
import { validateSources } from "./config.ts";
import type { Release, Source } from "./config.ts";
import { sourceURL } from "./registry.ts";

function releasePin(source: Source, release: Release) {
  return { sha256: release.sha256, url: sourceURL(source, release), icon: release.icon };
}

export function verifyHistory(
  previous: ReturnType<typeof validateSources>,
  current: ReturnType<typeof validateSources>,
): void {
  assert.equal(current.registry.id, previous.registry.id, "Published registry ID changed");
  assert.equal(
    current.registry.origin,
    previous.registry.origin,
    "Published registry origin changed",
  );
  for (const source of previous.dashboards) {
    const next = current.dashboards.find(({ id }) => id === source.id);
    assert(next, `Published dashboard removed: ${source.id}`);
    for (const release of source.releases) {
      assert(
        next.releases.some(
          (candidate) =>
            candidate.version === release.version &&
            isDeepStrictEqual(releasePin(source, release), releasePin(next, candidate)),
        ),
        `Published release changed or removed: ${source.id}@${release.version}`,
      );
    }
  }
}

if (import.meta.main) {
  const args: string[] = process.argv.slice(2);
  const revision = args.find((value) => !value.startsWith("--"));
  assert(revision, "Provide a Git revision: vp run registry:history -- origin/main");
  if (/^0+$/.test(revision)) {
    console.log("No previous history on the first push.");
  } else {
    const previous: unknown = JSON.parse(
      execFileSync("git", ["show", `${revision}:registry/sources.json`], { encoding: "utf8" }),
    );
    verifyHistory(validateSources(previous), validateSources(sources));
    console.log(`Verified published dashboard history against ${revision}.`);
  }
}
