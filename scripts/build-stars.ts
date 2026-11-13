import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";
import type { Manifest } from "../src/registry.ts";
import { writeAtomic } from "./files.ts";

const root = resolve(import.meta.dirname, "..");
const maxAge = 86_400_000;
const starCount = z.int().nonnegative();
const snapshot = z.object({ stars: starCount, fetchedAt: z.number().int().nonnegative() });
const githubProject = z.object({ stargazers_count: starCount });

export async function buildStars(
  repositories: string[],
  cache = join(root, ".cache/projects"),
  fetchUpstream: typeof fetch = fetch,
  now = Date.now(),
): Promise<Manifest["projectStars"]> {
  const entries = await Promise.all(
    [...new Set(repositories)].map(async (repository) => {
      const path = join(cache, `${repository}.json`);
      const cached = await readFile(path, "utf8")
        .then((text) => snapshot.parse(JSON.parse(text)))
        .catch(() => undefined);
      if (cached && now - cached.fetchedAt < maxAge) return [repository, cached.stars] as const;
      let stars: number;
      try {
        const response = await fetchUpstream(`https://api.github.com/repos/${repository}`, {
          headers: {
            Accept: "application/vnd.github+json",
            ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
          },
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        });
        if (response.status !== 200)
          throw new Error(`GitHub project request failed (${response.status}): ${repository}`);
        stars = githubProject.parse(await response.json()).stargazers_count;
      } catch (error) {
        console.warn(
          `Star refresh failed for ${repository}; ${cached ? "using cached stars" : "stars unavailable"}.`,
          error,
        );
        return [repository, cached?.stars ?? null] as const;
      }
      await writeAtomic(path, JSON.stringify({ stars, fetchedAt: now })).catch((error) => {
        console.warn(`Star cache write failed for ${repository}; using fresh stars.`, error);
      });
      return [repository, stars] as const;
    }),
  );
  return Object.fromEntries(entries);
}
