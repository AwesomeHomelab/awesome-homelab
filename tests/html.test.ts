import { load } from "cheerio";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import type { HeadDescriptor } from "void";
import generated from "../.generated/manifest.json";
import { parsePage, verifyDashboard } from "../scripts/html.ts";
import { createPageVerifier } from "../scripts/verify-page.ts";
import { installLink } from "../src/metrix.ts";
import { PAGE_CACHE } from "../src/registry.ts";

const url = "https://registry.example/";
const head: HeadDescriptor = {
  title: "Servers & usage",
  meta: [
    { name: "description", content: "A < B" },
    { property: "og:url", content: url },
  ],
  script: [{ type: "application/ld+json", innerHTML: '{"@type":"WebSite"}' }],
};
const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Servers &amp; usage</title><meta name="description" content="A &lt; B">
<meta property="og:url" content="${url}"><link rel="canonical" href="${url}">
<script type="application/ld+json">{"@type":"WebSite"}</script>
</head><body></body></html>`;

describe("page verification", () => {
  it("compares decoded titles and metadata", () => {
    expect(parsePage(html, head, url)("title").text()).toBe("Servers & usage");
  });

  it.each([
    html.replace("</head>", `<link rel="canonical" href="${url}"></head>`),
    html.replace("</head>", `<meta property="og:url" content="${url}"></head>`),
    html.replace(
      `property="og:url" content="${url}"`,
      'property="og:url" content="https://wrong.example/"',
    ),
    html.replace('"@type":"WebSite"', '"@type":"Person"'),
  ])("rejects duplicate or incorrect metadata", (invalid) => {
    expect(() => parsePage(invalid, head, url)).toThrow();
  });

  it("allows Vite tools only in development and rejects executable application scripts", () => {
    const development = html.replace(
      "</body>",
      '<script type="module" src="/@vite/client"></script></body>',
    );
    expect(() => parsePage(development, head, url, true)).not.toThrow();
    expect(() => parsePage(development, head, url)).toThrow("unexpected browser JavaScript");
    for (const script of [
      '<script>console.log("/@vite/client")</script>',
      '<script type="module">/* from "/@react-refresh" */ console.log("app")</script>',
    ]) {
      expect(() => parsePage(html.replace("</body>", `${script}</body>`), head, url, true)).toThrow(
        "unexpected browser JavaScript",
      );
    }
  });
});

afterEach(() => vi.unstubAllGlobals());

function withStyles(stylesheet: Response) {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
    if (input instanceof URL && input.href === `${url}assets/site.css`) return stylesheet.clone();
    return new Response(
      init?.method === "HEAD"
        ? null
        : html.replace("</head>", '<link rel="stylesheet" href="/assets/site.css"></head>'),
      {
        headers: { "Content-Type": "text/html", "Cache-Control": PAGE_CACHE },
      },
    );
  });
  vi.stubGlobal("fetch", fetch);
  return {
    fetch,
    verify: createPageVerifier({ ...generated, registryURL: `${url}dashboards/index.json` }, url),
  };
}

describe("stylesheet verification", () => {
  it.each([
    [404, "text/css", "missing"],
    [200, "text/html", "<html>Error</html>"],
    [200, "text/css", ""],
  ])(
    "rejects an unavailable, invalid or empty stylesheet %#",
    async (status, contentType, body) => {
      const { verify } = withStyles(
        new Response(body, { status, headers: { "Content-Type": contentType } }),
      );
      await expect(verify("/", head)).rejects.toThrow();
    },
  );

  it("checks each shared stylesheet once", async () => {
    const { verify, fetch } = withStyles(
      new Response("body { color: black; }", { headers: { "Content-Type": "text/css" } }),
    );
    await verify("/", head);
    await verify("/", head);
    expect(
      fetch.mock.calls.filter(
        ([input]) => input instanceof URL && input.href === `${url}assets/site.css`,
      ),
    ).toHaveLength(1);
  });
});

describe("dashboard content verification", () => {
  const dashboard = {
    ...generated.registry.dashboards[0]!,
    name: "Sample",
    description: "Essential description",
    docs: "Required setup instructions",
  };
  const registryURL = generated.registryURL;
  const body = `<main><h1>${dashboard.name}</h1><p>${dashboard.description}</p><p>${dashboard.docs}</p><a href="${installLink(dashboard.id, registryURL)}">Install</a><a download href="${new URL(dashboard.file, registryURL).pathname}">Download</a></main>`;

  it("accepts complete visible content and named actions", () => {
    expect(() => verifyDashboard(load(body), dashboard, registryURL)).not.toThrow();
  });

  it.each([
    "Sample",
    "Essential description",
    "Required setup instructions",
    ">Install<",
    ">Download<",
  ])("rejects missing content %s", (content) => {
    const invalid = body.replace(content, content.startsWith(">") ? "><" : "");
    expect(() => verifyDashboard(load(invalid), dashboard, registryURL)).toThrow();
  });
});
