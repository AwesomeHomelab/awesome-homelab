# Awesome.Metrix.Bar — Agent Guide

## Project scope

- English is the primary language for project communication, UI copy, comments, and documentation. Keep `README.md` and `README.zh-CN.md` concise and in sync, with a short dashboard list linking to the catalog for setup details. Preserve upstream dashboard metadata in its original language.
- This is a community registry for [Metrix.Bar](https://metrix.bar/), built with [Void](https://void.cloud/), [Vite+](https://viteplus.dev/), and Cloudflare Workers. The public index stays at `https://awesome.metrix.bar/dashboards/index.json`.
- Bind the custom domain manually in Cloudflare. Do not declare `routes`; keep `workers_dev: false` and `preview_urls: false` in `void.config.ts`.
- Serve the registry, `.bar` files, and remote icons through this service. Dashboard scripts retain their original runtime API/CDN connections. Usage, inclusion, and deployment instructions live in the two READMEs.

## Commands and configuration

- Use Node.js 24 and pnpm 12; exact versions are in `.node-version` and `package.json#packageManager`. Void requires Node.js 24.22.0 or newer within the supported Node 24 line. Install with `vp install --frozen-lockfile`.
- Use `^` ranges for direct dependencies, keep the Vite+ aliases and overrides aligned, and keep `@types/node` on Node 24. Commit the lockfile for reproducible installs.
- Vite+, lint, format, and test settings live in `vite.config.ts`. Import `defineConfig` from `vite-plus` and test APIs from `vite-plus/test`; keep `lint.options.typeAware` and `typeCheck` enabled.
- Void and Cloudflare settings live in `void.config.ts`. React pages live in `src/pages/`; server API routes live in `src/routes/` and import handlers from `void/handler`. Keep reusable React components and CSS in `src/views/`.
- Use `voidReact()` from `@void/react/plugin` alongside `voidPlugin()`; it includes the React Vite plugin. `output: "static"` prerenders the homepage and dashboard detail pages. Detail URLs are `/dashboards/<id>`; `src/pages/dashboards/[id].server.ts#getPrerenderPaths()` must enumerate every published dashboard. Keep complete page content available without browser JavaScript.
- Use locally bundled Pico CSS with shared styles in `src/views/site.css` and catalog/detail styles beside their React components. Page-specific canonical URLs, social metadata, and escaped JSON-LD live in `src/seo.ts`; `/sitemap.xml` lists only public pages. JSON-LD is data, not a hydrated island.
- Author avatars use `https://unavatar.webp.se/github/<username>` through WebP.se, with GitHub usernames listed in `src/authors.ts`. `scripts/build-avatars.ts` preserves successful, nonempty avatar responses without image format validation in Node during registry generation, with a one-day local cache, into ignored `public/avatars/`. Keep existing avatars if a refresh fails; a cold cache still requires a successful download. Serve those files locally with a one-day shared cache. Dashboard files and declared dashboard icons remain hash-pinned.
- Generate the registry with `vp run registry:build` and Void types with `vp run types`. Run both before standalone checks or tests after a fresh checkout.
- Develop with `vp run dev`, build with `vp run build`, and preview with `vp run preview`. Built-in `vp dev` and `vp build` skip registry generation.
- Check everything with `vp check`; lint with `vp lint`; check formatting with `vp fmt --check`; check types only with `vp check --no-fmt --no-lint`.
- Run all tests with `vp test`, one file with `vp test tests/worker.test.ts`, one case with `vp test tests/worker.test.ts -t 'exact upstream bytes'`, or watch with `vp test watch`.
- Run full verification with `vp run verify`. With a local server running, use `vp run verify:http -- http://localhost:5173`.
- Preview deployment with `vp run deploy:dry-run`; deploy with `vp run deploy`; verify a deployment with `vp run verify:http -- https://awesome.metrix.bar --edge-cache`.
- Void emits Cloudflare Build Output into `.cloudflare/output/v0/`. Deployment scripts use `cf deploy --prebuilt --mode production`, including dry runs. Do not use Wrangler for this output: its dry run can pass while a real deployment aborts. Sign in with `vp exec cf auth login`; cf uses its own credentials.
- `.cache/`, `.generated/`, `public/avatars/`, `.void/`, `.void-wrangler.jsonc`, `.cloudflare/`, `dist/`, and `.wrangler/` are generated and ignored. Do not edit or commit them; commit `pnpm-lock.yaml`. Official tools refresh on each build; cached dashboard and icon downloads are hash-checked on every use.

## Dashboard sources

- [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar): the root `index.json` contains Komari and Tokens. Include each dashboard only once.
- [Pulse](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md): resolve `metrix/index.json` and `metrix/pulse.bar` from the `metrix/` directory, not the repository root.
- [Codex Resets](https://github.com/0tt0/codex-resets-bar): include both `codex-resets.bar` and `codex-resets-en.bar` using their actual metadata.
- [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards): files are under `dashboards/`. No upstream license is declared; record `UNLICENSED`. Local Ports requires the upstream macOS collector described in its README; do not execute it during registry generation.
- [zxfccmm4/stevefans-bar](https://github.com/zxfccmm4/stevefans-bar): the root `stevefans.bar` declares MIT and embeds its icon. It reads public X follower counts from the FxTwitter API with avatars from unavatar.io, so generation needs no extra steps.
- [thedavidweng/metrix-bar](https://github.com/thedavidweng/metrix-bar/tree/main/magpie): Magpie lives under `magpie/` and is AGPL-3.0-only. Its `homepage` points at [yetone/magpie](https://github.com/yetone/magpie), the app it controls; keep the repository URL as the source link.
- [bluenight91/nezha-metrix-bar](https://github.com/bluenight91/nezha-metrix-bar): the root `nezha.bar` declares AGPL-3.0-only and embeds its icon. It reads Nezha Monitoring V2 data from the `baseURL` input with an optional PAT secret and needs no local collector, so generation needs no extra steps.
- Preserve authors, license declarations, and source links. Revalidate upstream examples instead of concatenating their indexes.
- `registry/sources.json` pins full commits, actual metadata versions, and original-byte SHA-256 hashes. Append releases from oldest to newest; retain history so old download URLs keep working. Download the official builder and schema without SHA-256 pins; keep dashboard files and remote icons hash-pinned.

## Registry and proxy constraints

- Follow the [official registry protocol](https://metrix.bar/docs/registries.md) and [JSON Schema](https://metrix.bar/dashboards/schema.json), not a custom index format.
- Website app links use `metrixbar://registry/add?url=…` and `metrixbar://install/<id>?registry_url=…`; encode nested URLs as query values. Registry-aware installation preserves updates. Render descriptions and plain-text setup docs from registry metadata; keep download links available.
- Indexes require `schema_version: 1`, `id`, `name`, and `dashboards`; entries require `id`, `name`, `file`, `protocol_version: "0"`, `version`, and `sha256`.
- IDs match `^[a-z0-9]+(?:-[a-z0-9]+)*$`; dashboard IDs are unique within the registry. `--` is reserved for client installation IDs. Keep published IDs and the index URL stable.
- Versions are strict SemVer and must increase when bytes change. Clients reject a changed hash at the same version; do not overwrite releases.
- `file` is a same-origin `.bar` path resolved relative to the index URL: no leading slash, scheme, host, query, fragment, or backslash. Percent-decoded paths must remain valid.
- Public files resolve under `https://awesome.metrix.bar/dashboards/`. Return their bytes directly; never redirect downloads to GitHub/raw/CDNs. Workers `fetch` requires `redirect: "manual"` with an explicit upstream status 200 check; `redirect: "error"` is unsupported there.
- `sha256` is the 64-character lowercase SHA-256 of the distributed bytes. Preserve encoding and line endings; any byte change requires a new hash, version, and metadata check.
- Do not set `compatibility_date` beyond the installed workerd version. Actually start `vp run dev` when upgrading; unit tests and builds cannot replace this check.
- The proxy accepts only `manifest.assets` mappings, never arbitrary target URLs. Pin remote icon URLs, hashes, and image content types and serve them locally; retain embedded icons.
- Enable Workers Cache and `cross_version_cache` in `void.config.ts`. HTML pages and the index have a 300-second shared cache; hash-addressed resources are immutable for one year; errors use `no-store`. Cache hits reduce execution and upstream traffic but still count as standard Worker requests.

## Required verification

- For documentation-only changes, run `git diff --check` and verify referenced commands, paths, and facts. Report checks that could not run.
- For code or configuration changes, run `vp run verify`. For proxy, route, or inclusion changes, also start the local server and run `vp run verify:http -- http://localhost:5173`. After deployment, add `--edge-cache` to verify real cache hits.
- For dashboard additions or updates, verify the official schema, unique IDs, strict SemVer, agreement with `.bar` metadata, and SHA-256 of actual proxy responses. Checking upstream URLs or claimed hashes alone is insufficient.
- For route or proxy changes, verify the homepage, parseable index, relative downloads, no cross-origin redirects, unknown paths, and upstream failures. Error pages must never pass as successful dashboard files.
- The official builder only checks `.bar` files statically. If dashboard content changes, use the Metrix.Bar local API to validate runtime behavior, permissions, and rendering; see the [official guide](https://metrix.bar/docs/registries.md#building-registries-with-buildjs).
