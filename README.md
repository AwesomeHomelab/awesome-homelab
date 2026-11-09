# Awesome.Metrix.Bar

[简体中文](README.zh-CN.md) · English

Find community dashboards for [Metrix.Bar for macOS](https://metrix.bar/), add them to your menu bar, and receive future releases through one registry. Browse [awesome.metrix.bar](https://awesome.metrix.bar/) to choose a dashboard and read its setup instructions, author information, license, and source before installing.

## Install a dashboard and keep it up to date

| Website action                          | How to use it                                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Add registry**                        | Open Metrix.Bar to add the whole collection, then browse and install dashboards in the app.                                  |
| **Install** / **Install in Metrix.Bar** | Open Metrix.Bar to install the selected dashboard with a link to this registry for future updates.                           |
| **Download .bar**                       | Save an individual dashboard file for manual import. Use **Install** to keep the installation connected to registry updates. |

Metrix.Bar asks for confirmation when adding a registry, installing a dashboard, or applying an update. Review the requested permissions in the app and follow the dashboard's setup instructions.

You can also paste this stable address into **Settings → Registries** in Metrix.Bar:

```text
https://awesome.metrix.bar/dashboards/index.json
```

Dashboard files and declared remote icons are downloaded from this service. When a dashboard runs, it keeps its original connections to external APIs and CDNs; follow its setup instructions for any required accounts, services, or local tools.

## Choose a dashboard

| Dashboard ID                                                               | What you can use it for                                                                            | Source                                                                                      | Upstream license |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | Monitor servers, bandwidth, traffic, and historical load and ping trends with Komari.              | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only    |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | Track AI coding token usage, daily spend, and model breakdown on Tokens.                           | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only    |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | Follow a stock and crypto watchlist with intraday charts.                                          | [fatwang2/Pulse](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md)              | MIT              |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | Follow Codex quota reset announcements and receive new announcement alerts, in Chinese.            | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0       |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | Follow Codex quota reset announcements and receive new announcement alerts, in English.            | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0       |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | Check today's date and browse or select dates in a monthly calendar.                               | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED       |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | Find macOS TCP listeners and UDP bindings, including their processes, PIDs, and listening scope.   | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED       |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | Check US, Hong Kong, and mainland China stock watchlists, intraday charts, and daily candlesticks. | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED       |

Local Ports requires a macOS collector. Follow the [upstream setup guide](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集) to start it before opening the dashboard.

## Add or update a dashboard

Edit [registry/sources.json](registry/sources.json) to propose a dashboard or publish a newer upstream release. Each entry records its ID, repository, file path, author, license fallback, and a `releases` list ordered from oldest to newest.

1. Review the upstream `.bar` file and its license. Pin the full 40-character Git commit, read the ID and version from the actual `.bar` metadata, and calculate the lowercase SHA-256 of its original bytes. Preserve encoding and line endings; an upstream index may be stale. A release can override `path` if the file moves.
2. Use strict SemVer and append new releases without removing or overwriting history. Changed bytes require a higher version; publishing a different hash at the same version or rolling back a version fails validation. Keep published dashboard IDs, the registry ID, and the public index URL stable.
3. For a declared remote icon, pin `release.icon.url`, `sha256`, and an image `contentType`. The registry serves it through this service. Keep embedded `data:` icons and native icon names as they are.
4. Run `vp run verify`, start `vp run dev`, then run `vp run verify:http -- http://localhost:5173` in another terminal. These checks validate the official schema, unique IDs, versions, metadata agreement, and the SHA-256 of actual served downloads, including retained releases and remote icons.
5. For new or changed dashboard content, also use the [Metrix.Bar local API](https://metrix.bar/docs/registries.md#building-registries-with-buildjs) to validate runtime behavior, permissions, and rendering. The official builder checks files statically; registry generation does not execute dashboard scripts or start the Local Ports collector.

The [official registry builder and schema](https://metrix.bar/docs/registries.md) are pinned under `tools` in `registry/sources.json`. Review upstream changes before updating their hashes. Preserve upstream authorship, source links, license declarations, and the original language of dashboard metadata; keep both READMEs in sync when updating documentation.

Only the newest release appears in the index. Retain older releases so clients can still download them from `/dashboards/files/<sha256>/<filename>.bar`.

## Develop locally

Install [Vite+](https://viteplus.dev/guide/) and use Node.js **24.22.0 or newer within Node 24**, with **pnpm 12**. Exact versions are declared in [.node-version](.node-version) and [package.json](package.json).

From the repository directory, install dependencies, verify the checkout, then start development:

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

Open `http://localhost:5173/` to browse dashboards, `/dashboards/<id>` for a detail page, or `/dashboards/index.json` for the local registry. With the server running, check the served pages and downloads in another terminal:

```sh
vp run verify:http -- http://localhost:5173
```

`vp run verify` generates the registry and Void types, checks formatting, lint, and types, runs tests, and builds the site. On a fresh checkout, prepare generated files before running checks or tests individually:

```sh
vp run registry:build
vp run types
```

| To…                                  | Run…             |
| ------------------------------------ | ---------------- |
| Check formatting, lint, and types    | `vp check`       |
| Run tests                            | `vp test`        |
| Build for production                 | `vp run build`   |
| Build and preview production locally | `vp run preview` |

Use `vp run dev` and `vp run build` so the registry is generated before serving or building.

The first registry build needs network access to GitHub, metrix.bar, and WebP.se. Cached registry downloads are hash-checked on reuse. Keep generated content out of Git: `.cache/`, `.generated/`, `public/avatars/`, `.void/`, `.void-wrangler.jsonc`, `.cloudflare/`, `dist/`, and `.wrangler/` are ignored. Commit dependency changes with `pnpm-lock.yaml`.

## Deploy the registry

After local verification, sign in to the Worker's Cloudflare account, check the deployment, and publish:

```sh
vp exec cf auth login
vp run deploy:dry-run
vp run deploy
```

The deploy scripts build Void's Cloudflare output at `.cloudflare/output/v0/` and publish it with `cf deploy --prebuilt --mode production`; the dry run adds `--dry-run`. Use **cf**, not Wrangler, for this output. cf has its own login credentials.

Manually bind `awesome.metrix.bar` to the Worker in Cloudflare, then verify the public deployment:

```sh
vp run verify:http -- https://awesome.metrix.bar --edge-cache
```

Manage Worker settings in [void.config.ts](void.config.ts). Keep domain binding manual, with no `routes` declaration, and leave `workers_dev: false` and `preview_urls: false` in place. The HTTP check compares the deployment with the local registry and verifies downloads and real edge cache hits.

Homepage and index updates can take up to about **five minutes** to appear because of caching. If a new release is not visible immediately after deployment, wait for that cache to expire and rerun HTTP verification. Historical download URLs remain usable as long as their releases stay in the source list.

## License

This project is licensed under [Apache-2.0](LICENSE). Each dashboard remains subject to its own upstream license, as listed above and in the registry. `UNLICENSED` means the upstream repository has not declared a license.
