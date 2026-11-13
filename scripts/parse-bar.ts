import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import type { Dashboard, Registry } from "../src/registry.ts";
import { cacheDir } from "./download.ts";

const exec = promisify(execFile);

export async function parseBar(
  builder: string,
  bytes: Buffer,
  path: string,
  id: string,
): Promise<Dashboard> {
  const workspace = await mkdtemp(join(cacheDir, "parse-"));
  try {
    const input = join(workspace, "input");
    const output = join(workspace, "output");
    await mkdir(input);
    await writeFile(join(input, basename(path)), bytes);
    await exec(process.execPath, [
      builder,
      "--input",
      input,
      "--output",
      output,
      "--id",
      id,
      "--name",
      id,
    ]);
    const registry = JSON.parse(await readFile(join(output, "index.json"), "utf8")) as Registry;
    if (registry.dashboards.length !== 1) {
      throw new Error(`Expected exactly one dashboard: ${id}`);
    }
    return registry.dashboards[0]!;
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
