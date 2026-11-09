# Awesome.Metrix.Bar

[简体中文](README.zh-CN.md) · English

A community dashboard registry for [Metrix.Bar](https://metrix.bar/), built with [Void](https://void.cloud/), React, [Pico CSS](https://picocss.com/), and [Vite+](https://viteplus.dev/). Browse the catalog at [awesome.metrix.bar](https://awesome.metrix.bar/) and open a dashboard’s detail page for setup instructions, author information, and installation. The registry, dashboard downloads, remote icons, and author avatars are served through our Cloudflare Worker.

Choose **Add registry** or a dashboard’s **Install** action on the website to open Metrix.Bar. The app asks for confirmation and keeps installed dashboards linked to registry updates. Each `/dashboards/<id>` page includes the original description, setup instructions, license, and source links; **Download .bar** remains available for manual use.

The homepage and every dashboard page are prerendered with unique titles, descriptions, canonical URLs, social metadata, and JSON-LD. `/sitemap.xml` lists the public pages and `/robots.txt` points crawlers to it. Pico CSS is bundled locally. Author avatars use [WebP.se’s GitHub avatar service](https://webp.se/public-services/github-avatar/). The build downloads WebP images using verified numeric GitHub IDs from `src/authors.ts`, reuses a one-day cache, and serves generated `/avatars/<author>.webp` files locally.

You can also add this registry URL in Metrix.Bar:

```text
https://awesome.metrix.bar/dashboards/index.json
```

Dashboard scripts keep their original API and CDN connections. This registry does not proxy those runtime requests.

## Dashboards

| Dashboard ID      | Source                                                                                      | License       |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------- |
| `komari`          | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| `tokens`          | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| `pulse`           | [fatwang2/Pulse](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md)              | MIT           |
| `codex-resets`    | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| `codex-resets-en` | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| `calendar`        | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| `local-ports`     | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| `stock-board`     | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |

Dashboards remain the work of their respective authors and retain their upstream licenses. `UNLICENSED` means the source repository has no declared license. The index includes author and pinned source links. Local Ports needs the macOS collector described in its [upstream setup guide](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集).

English is the primary project language. This README and the Simplified Chinese translation are maintained together; upstream dashboard metadata keeps its original language.

## Development

Install [Vite+](https://viteplus.dev/guide/), then use Node.js 24 and pnpm 12. The exact versions are declared in `.node-version` and `package.json`; Vite+ manages the selected package manager.

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

The homepage is available at `http://localhost:5173/`, detail pages at `/dashboards/<id>`, and the registry at `/dashboards/index.json`. Void uses React Pages through `@void/react`, with `output: "static"` to prerender HTML at build time. The homepage and detail pages use `.island.tsx` without hydrated islands. Reusable React components and locally bundled Pico styles live in `src/views/`; registry and download APIs remain Worker routes in `src/routes/`.

Production builds include `dist/client/index.html` and `dist/client/dashboards/<id>.html` for every dashboard. The detail page’s `.server.ts` companion enumerates IDs with `getPrerenderPaths()` and supplies page-specific SEO metadata. Keep that list tied to the generated registry so new entries receive detail pages and sitemap URLs automatically. Add `prerender = false` only for pages that need request-time rendering; use Void island imports only for components that need browser interaction.

| Command                                                  | Purpose                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `vp run registry:build`                                  | Download pinned sources, validate metadata and hashes, generate the registry |
| `vp run types`                                           | Generate Void route and environment types                                    |
| `vp run dev`                                             | Generate the registry and start the local Worker                             |
| `vp run build`                                           | Generate the registry and build the production Worker                        |
| `vp run preview`                                         | Build and serve the production Worker locally                                |
| `vp check`                                               | Check formatting, lint, and types                                            |
| `vp check --fix`                                         | Apply formatting and available lint fixes                                    |
| `vp test`                                                | Run Node.js and Workers runtime tests once                                   |
| `vp test tests/worker.test.ts -t 'exact upstream bytes'` | Run a specific test                                                          |
| `vp test watch`                                          | Watch tests                                                                  |
| `vp run verify`                                          | Generate registry/types, check, test, and build                              |
| `vp run verify:http -- http://localhost:5173`            | Verify the homepage, registry, retained dashboard files, and remote icons    |

Use `vp run dev` and `vp run build`: the built-in `vp dev` and `vp build` skip registry generation. Run `vp run registry:build` and `vp run types` before standalone checks or tests on a fresh checkout.

Direct dependencies use `^` ranges, with exact installed versions in `pnpm-lock.yaml`. Keep Node.js type definitions on the supported Node 24 major and keep the Vite+ aliases in `package.json` and `pnpm-workspace.yaml` aligned.

The first generation requires access to GitHub, metrix.bar, and WebP.se. Later runs reuse hash-verified registry downloads in `.cache/` and refresh avatar images after one day. If an avatar refresh fails, the build keeps the existing image and retries next time; an empty cache still requires a successful download. Generated files under `public/avatars/`, `.cache/`, `.generated/`, `.void/`, `.void-wrangler.jsonc`, `.cloudflare/`, `dist/`, and `.wrangler/` stay out of Git; the dependency lockfile stays in Git.

CI runs the same verification, a deployment dry run, and local HTTP download checks. It does not deploy automatically.

## Adding or updating a dashboard

Edit [registry/sources.json](registry/sources.json). Each dashboard records its ID, repository, file path, author, license fallback, and an ordered `releases` list. Each release pins a full Git commit, the version from the actual `.bar` file, and SHA-256 of its original bytes. A release may override `path` when an upstream file moves.

1. Review the upstream file and license. Pin the full commit, download its raw bytes, and calculate SHA-256. Read the version from the `.bar` root; an upstream index may be stale.
2. Append the new release while preserving previous releases. Versions must increase when bytes change; the same version with different bytes and version rollbacks fail validation.
3. If the file declares a remote icon, add `release.icon` with `url`, `sha256`, and an image `contentType`. The generated index points to an immutable icon URL on this service. Embedded `data:` icons and native icon names need no separate request.
4. Run `vp run verify`, start `vp run dev`, then run `vp run verify:http -- http://localhost:5173` in another terminal.
5. For modified dashboard scripts, also validate permissions and rendering with Metrix.Bar's local check/validate API. The registry builder provides static validation and never executes dashboard scripts.

The official [registry builder and schema](https://metrix.bar/docs/registries.md) are downloaded using the pins in `tools`. A changed upstream tool fails its hash check; review the change before updating that pin.

Only the newest release appears in the index. Every retained release keeps its immutable download route at `/dashboards/files/<sha256>/<filename>.bar`. Keep registry IDs, dashboard IDs, and the public index URL stable. Removing a historical release breaks clients that still hold its URL.

## Deployment and caching

[void.config.ts](void.config.ts) holds Void and Cloudflare settings, leaves domain routes unconfigured, and disables the default `workers.dev` hostname and version preview URLs. Sign in to the Cloudflare CLI with `vp exec cf auth login` using the Worker's account, deploy, then manually bind `awesome.metrix.bar` in Cloudflare before running HTTP verification. CI deployment would require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as secrets.

The deploy scripts build Void's Cloudflare output and publish it with `cf deploy --prebuilt --mode production`. Dry runs use the same command with `--dry-run`. The Cloudflare CLI has its own login, separate from Wrangler; Wrangler cannot deploy this build output.

```sh
vp run deploy:dry-run
vp run deploy
vp run verify:http -- https://awesome.metrix.bar --edge-cache
```

The Worker only fetches allowlisted URLs pinned to upstream commits. It returns bytes directly, checks SHA-256 before serving a successful file response, and rejects upstream redirects. There is no arbitrary-target proxy endpoint.

[Workers Cache](https://developers.cloudflare.com/workers/cache/) is enabled with `cross_version_cache: true`:

| Response                                            | Cache-Control                          |
| --------------------------------------------------- | -------------------------------------- |
| HTML pages and registry index                       | `public, max-age=60, s-maxage=300`     |
| Author avatars                                      | `public, max-age=3600, s-maxage=86400` |
| Hashed dashboard files and remote icons             | `public, max-age=31536000, immutable`  |
| Unknown paths, failed downloads, integrity failures | `no-store`                             |

The registry supports ETag, conditional GET, and HEAD requests. The homepage supports GET and HEAD. Cross-version caching preserves immutable files across deployments; homepage and index updates can take up to five minutes to appear. HTTP verification checks every page, canonical URLs, structured data, sitemap, and avatars; it compares the served index with the local build, then checks hashes, content types, and cache policies for every retained dashboard file and remote icon. Add `--edge-cache` to require `Cf-Cache-Status: HIT` on repeated requests and verify cached bytes. Inspect Workers observability for CPU and origin-request changes.

An edge cache hit skips Worker execution and reduces CPU and upstream traffic. Cloudflare still bills cache hits as standard Worker requests; caching does not reduce that request count.
