import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vite-plus/test";
import sources from "../registry/sources.json";
import { updateDashboards } from "../scripts/update-dashboards.ts";
import { validateSources } from "../scripts/config.ts";
import { download } from "../scripts/download.ts";
import { sha256, sourceURL } from "../scripts/registry.ts";

const [builder, schema] = await Promise.all([
  download(sources.tools.builder, "mjs"),
  download(sources.tools.schema, "json"),
]);
const commit = "b".repeat(40);
const icon = "https://example.com/icon.svg";
const bar = (id: string, version: string, attributes = "") =>
  `<bar protocol-version="0" id="${id}" title="Sample" version="${version}" ${attributes}>\r\n<script>throw new Error("must not execute");</script></bar>\r\n`;

function fixture(count = 2) {
  const config = validateSources({ ...sources, dashboards: sources.dashboards.slice(0, count) });
  const files = new Map(config.dashboards.map(({ id }) => [id, bar(id, "9.0.0")]));
  const responses = new Map<string, Response>();
  const iconBytes = Buffer.from(`<svg><!--${randomUUID()}--></svg>`);
  let iconRequests = 0;
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const response = responses.get(url);
    if (response) return response.clone();
    if (url === config.tools.builder.url) return new Response(builder.bytes);
    if (url === config.tools.schema.url) return new Response(schema.bytes);
    if (url.startsWith("https://api.github.com/")) {
      return Response.json({ sha: commit });
    }
    if (url === icon) {
      if (++iconRequests > 1) return new Response("Rate limited", { status: 429 });
      return new Response(iconBytes, { headers: { "content-type": "image/svg+xml" } });
    }
    for (const source of config.dashboards) {
      if (url === sourceURL(source, { ...source.releases.at(-1)!, commit })) {
        return new Response(files.get(source.id));
      }
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  return { config, files, fetch, iconBytes, responses };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("appends actual releases while preserving history and sharing a repository snapshot", async () => {
  const { config, files, fetch } = fixture();
  const original = structuredClone(config);
  const result = await updateDashboards(config);
  expect(result.failed).toBe(false);
  expect(result.changed).toBe(true);
  expect(config).toEqual(original);
  for (const source of result.config.dashboards) {
    const previous = original.dashboards.find(({ id }) => id === source.id)!;
    expect(source).toEqual({
      ...previous,
      releases: [
        ...previous.releases,
        { commit, version: "9.0.0", sha256: sha256(files.get(source.id)!) },
      ],
    });
  }
  expect(
    fetch.mock.calls.filter(([url]) => url instanceof URL && url.hostname === "api.github.com"),
  ).toHaveLength(1);
});

it("skips identical bytes without appending a release", async () => {
  const { config, files } = fixture();
  const source = config.dashboards[0]!;
  const previous = source.releases.at(-1)!;
  files.set(source.id, bar(source.id, previous.version));
  previous.sha256 = sha256(files.get(source.id)!);
  const result = await updateDashboards(config);
  expect(result.failed).toBe(false);
  expect(result.config.dashboards[0]).toEqual(source);
  expect(result.config.dashboards[1]!.releases).toHaveLength(
    config.dashboards[1]!.releases.length + 1,
  );
});

it("keeps the configuration unchanged when every file is identical", async () => {
  const { config, files } = fixture();
  for (const source of config.dashboards) {
    const previous = source.releases.at(-1)!;
    files.set(source.id, bar(source.id, previous.version));
    previous.sha256 = sha256(files.get(source.id)!);
  }
  const result = await updateDashboards(config);
  expect(result).toEqual({ config, changed: false, failed: false });
});

it.each([
  ["upstream failure", new Response("Unavailable", { status: 503 })],
  ["invalid commit", Response.json({ sha: "invalid" })],
])("leaves shared sources unchanged on %s", async (_, response) => {
  const { config, fetch, responses } = fixture();
  responses.set(
    `https://api.github.com/repos/${config.dashboards[0]!.repository}/commits/HEAD`,
    response,
  );
  const result = await updateDashboards(config);
  expect(result).toEqual({ config, changed: false, failed: true });
  expect(
    fetch.mock.calls.filter(([url]) => url instanceof URL && url.hostname === "api.github.com"),
  ).toHaveLength(1);
});

it("continues with other repositories after a shared HEAD request fails", async () => {
  const { config, fetch, responses } = fixture(3);
  responses.set(
    `https://api.github.com/repos/${config.dashboards[0]!.repository}/commits/HEAD`,
    new Response("Rate limited", { status: 429 }),
  );
  const result = await updateDashboards(config);
  expect(result.failed).toBe(true);
  expect(result.changed).toBe(true);
  expect(result.config.dashboards.slice(0, 2)).toEqual(config.dashboards.slice(0, 2));
  expect(result.config.dashboards[2]!.releases).toHaveLength(
    config.dashboards[2]!.releases.length + 1,
  );
  expect(
    fetch.mock.calls.filter(([url]) => url instanceof URL && url.hostname === "api.github.com"),
  ).toHaveLength(2);
});

it.each([
  ["unchanged version", bar("komari", sources.dashboards[0]!.releases.at(-1)!.version)],
  ["version rollback", bar("komari", "0.0.0")],
  ["non-strict version", bar("komari", "v2.0.0")],
  ["invalid metadata", bar("komari", "2.0.0", 'homepage="invalid"')],
  [
    "unsupported protocol",
    bar("komari", "2.0.0").replace('protocol-version="0"', 'protocol-version="1"'),
  ],
])("rejects %s while updating healthy sources", async (_, bytes) => {
  const { config, files } = fixture();
  files.set("komari", bytes);
  const result = await updateDashboards(config);
  expect(result.failed).toBe(true);
  expect(result.config.dashboards[0]).toEqual(config.dashboards[0]);
  expect(result.config.dashboards[1]!.releases).toHaveLength(
    config.dashboards[1]!.releases.length + 1,
  );
});

it("pins and caches a remote icon from one successful request", async () => {
  const { config, files, fetch, iconBytes } = fixture();
  files.set("komari", bar("komari", "9.0.0", `icon="${icon}"`));
  const result = await updateDashboards(config);
  expect(result.failed).toBe(false);
  const pin = result.config.dashboards[0]!.releases.at(-1)!.icon!;
  expect(pin).toEqual({
    url: icon,
    sha256: sha256(iconBytes),
    contentType: "image/svg+xml",
  });
  expect((await download(pin, "icon")).bytes).toEqual(iconBytes);
  expect(
    fetch.mock.calls.filter(([url]) => (url instanceof URL ? url.href === icon : url === icon)),
  ).toHaveLength(1);
});
