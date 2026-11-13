import { createElement } from "react";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import generated from "../.generated/manifest.json";
import HomePage from "../src/pages/index.island.tsx";
import { installLink, registryLink } from "../src/metrix.ts";
import { baseLocale, dashboardPath } from "../src/i18n.ts";
import type { Dashboard, Manifest } from "../src/registry.ts";
import { DashboardCard } from "../src/views/dashboard.tsx";
import { DashboardDetail } from "../src/views/detail.tsx";
import { Home } from "../src/views/home.tsx";

const manifest: Manifest = generated;
const renderHome = (manifest: Manifest) => renderToStaticMarkup(createElement(Home, { manifest }));
const renderCard = (dashboard: Dashboard, manifest: Manifest) =>
  renderToStaticMarkup(createElement(DashboardCard, { dashboard, manifest, locale: baseLocale }));
const renderDetail = (dashboard: Dashboard, manifest: Manifest) =>
  renderToStaticMarkup(createElement(DashboardDetail, { dashboard, manifest }));

describe("catalog and dashboard pages", () => {
  it("renders a complete linked catalog without hydration scripts", () => {
    const body = renderToStaticMarkup(createElement(HomePage));
    expect(body).toContain("A registry of dashboards for Metrix.Bar.");
    expect(body).toContain(manifest.registry.name);
    expect(body).toContain(manifest.registryURL);
    expect(body).not.toContain("<script");
    for (const dashboard of manifest.registry.dashboards) {
      expect(body).toContain(`href="${dashboardPath(dashboard.id)}"`);
      expect(body).toContain(`href="${installLink(dashboard.id, manifest.registryURL)}"`);
    }
    expect(body).toContain(`href="${registryLink(manifest.registryURL)}"`);
    const page = load(body);
    const input = page('input[name="registry-url"]');
    expect(input).toHaveLength(1);
    expect(input.attr("id")).toBeTruthy();
    expect(input.attr("readonly")).toBeDefined();
    expect(input.attr("value")).toBe(manifest.registryURL);
    expect(page(`label[for="${input.attr("id")}"]`).text()).toContain("Settings → Registries");
    const addRegistry = page("a[data-slot=button]").filter(
      (_, element) => page(element).text() === "Add registry",
    );
    expect(addRegistry.attr("href")).toBe(registryLink(manifest.registryURL));
    expect(addRegistry.attr("role")).toBeUndefined();
  });

  it.each([1234, 0, null, Number.MAX_SAFE_INTEGER])(
    "renders a local SVG badge with original project stars: %s",
    (stars) => {
      const custom = structuredClone(manifest);
      const dashboard = custom.registry.dashboards.find(({ id }) => id === "magpie")!;
      const repository = "thedavidweng/metrix-bar";
      custom.projectStars[repository] = stars;
      const page = load(renderCard(dashboard, custom));
      const badge = page(".project-stars");
      const value = stars?.toLocaleString("en-US") ?? "—";
      expect(badge.attr("href")).toBe(`https://github.com/${repository}`);
      expect(badge.attr("aria-label")).toBe(
        stars === null
          ? `${repository}: GitHub stars unavailable`
          : `${repository}: ${value} GitHub stars`,
      );
      expect(badge.find("svg[aria-hidden=true]")).toHaveLength(1);
      expect(badge.find("text").text()).toBe(value);
      expect(badge.find("img")).toHaveLength(0);
    },
  );

  it("escapes upstream names, descriptions, setup text and attributes", () => {
    const custom = structuredClone(manifest);
    custom.registry.name = "Another collection";
    custom.registryURL = "https://registry.example/dashboards/index.json";
    const dashboard = custom.registry.dashboards[0]!;
    dashboard.name = '<script>alert("name")</script>';
    dashboard.author = '<img src=x onerror="alert(1)">';
    dashboard.homepage = 'https://example.com/?q=" onclick="alert(1)';
    dashboard.description = "<strong>Untrusted summary</strong>";
    dashboard.docs = '<script>alert("docs")</script>\nSetup instructions';
    expect(renderHome(custom)).toContain("Another collection");
    const body = renderDetail(dashboard, custom);
    expect(body).toContain("&lt;script&gt;");
    expect(body).not.toContain("<script");
    expect(body).not.toContain("<img src=x");
    expect(body).not.toContain("<strong>");
    expect(body).toContain("&lt;strong&gt;Untrusted summary&lt;/strong&gt;");
    expect(body).toContain("Setup instructions");
    expect(body).not.toContain('" onclick="');
  });

  it("preserves install and direct-download actions on every detail page", () => {
    for (const dashboard of manifest.registry.dashboards) {
      const body = renderDetail(dashboard, manifest);
      const page = load(body);
      expect(page("h1").text()).toBe(dashboard.name);
      const download = page("a[download]");
      expect(download.attr("href")).toBe(`/dashboards/${dashboard.file}`);
      expect(download.text()).toBe("Download .bar");
      expect(download.attr("role")).toBeUndefined();
      expect(page("a[data-slot=button]")).toHaveLength(2);
      const link = new URL(installLink(dashboard.id, manifest.registryURL));
      expect(link.hostname).toBe("install");
      expect(link.pathname).toBe(`/${dashboard.id}`);
      expect(link.searchParams.get("registry_url")).toBe(manifest.registryURL);
      expect(page("a[data-slot=button]").first().attr("href")).toBe(link.href);
      expect(page("a[data-slot=button]").first().attr("role")).toBeUndefined();
      expect(body).not.toContain("<script");
    }
  });

  it("encodes nested registry URLs once", () => {
    const index = "https://registry.example/index.json?channel=a%2Fb&lang=en";
    expect(new URL(registryLink(index)).searchParams.get("url")).toBe(index);
    expect(new URL(installLink("cpu-load", index)).searchParams.get("registry_url")).toBe(index);
  });

  it("renders plain-text setup, license and optional metadata without inventing values", () => {
    const dashboard = {
      ...manifest.registry.dashboards[0]!,
      docs: "First step\n\nSecond step",
      license: "UNLICENSED",
    };
    const body = renderDetail(dashboard, manifest);
    expect(body).toContain("First step\n\nSecond step");
    expect(body).toContain("Not declared");
    expect(body).toContain("Source code");
    expect(body).toContain(dashboard.sha256);
    const minimal: Dashboard = {
      id: "minimal",
      name: "Minimal",
      file: "files/minimal.bar",
      protocol_version: "0",
      version: "1.0.0",
      sha256: "a".repeat(64),
    };
    const plain = renderDetail(minimal, manifest);
    expect(plain).not.toContain("<img");
    expect(plain).not.toContain("undefined");
    expect(plain).toContain("Get started");
  });

  it("renders local author avatars and only embedded or mapped dashboard icons", () => {
    const custom = structuredClone(manifest);
    const dashboard = custom.registry.dashboards[0]!;
    expect(renderCard(dashboard, custom)).toContain('src="/avatars/baranwang.webp"');
    for (const icon of ["chart.bar.xaxis", "https://unmapped.example/icon.svg"]) {
      dashboard.icon = icon;
      expect(load(renderCard(dashboard, custom))(".dashboard-icon")).toHaveLength(0);
    }
    dashboard.icon = "https://awesome.metrix.bar/dashboards/icons/pinned";
    custom.assets["/dashboards/icons/pinned"] = {
      url: "https://upstream.example/icon.svg",
      sha256: "a".repeat(64),
      contentType: "image/svg+xml",
    };
    expect(renderCard(dashboard, custom)).toContain('src="/dashboards/icons/pinned"');
  });
});
