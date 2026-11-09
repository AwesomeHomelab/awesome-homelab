import { describe, expect, it } from "vite-plus/test";
import type { HeadDescriptor } from "void";
import { parsePage } from "../scripts/html.ts";

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

  it("allows Vite development tools while rejecting executable application scripts", () => {
    expect(() =>
      parsePage(
        html.replace("</body>", '<script type="module" src="/@vite/client"></script></body>'),
        head,
        url,
      ),
    ).not.toThrow();
    expect(() =>
      parsePage(
        html.replace("</body>", '<script>console.log("/@vite/client")</script></body>'),
        head,
        url,
      ),
    ).toThrow("unexpected browser JavaScript");
  });
});
