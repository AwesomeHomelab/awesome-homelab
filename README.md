# Awesome.Metrix.Bar

[简体中文](README.zh-CN.md) · English

Community dashboards for [Metrix.Bar](https://metrix.bar/) on macOS, Windows, and Linux (experimental). Track servers, AI usage, markets, and more from your menu bar or system tray.

## Get started

1. Browse [the catalog](https://awesome.metrix.bar/) and choose **Add registry**, or paste this URL into Metrix.Bar's **Settings → Registries**:

   ```text
   https://awesome.metrix.bar/dashboards/index.json
   ```

2. Open a dashboard's page, read its setup instructions, and choose **Install**. Confirm the requested permissions in Metrix.Bar.

Installed dashboards stay linked to registry updates, which require your confirmation. **Download .bar** is available for manual import. Dashboard scripts keep their original connections to external services.

## Dashboards

| Dashboard                                                                  | Use it to                                                       | Source                                                                   | License       |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | Monitor servers, bandwidth, traffic, and load.                  | [baranwang](https://github.com/baranwang/metrix-bar)                     | AGPL-3.0-only |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | Track AI coding token usage, spending, and model breakdown.     | [baranwang](https://github.com/baranwang/metrix-bar)                     | AGPL-3.0-only |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | Follow stocks and crypto with intraday charts.                  | [fatwang2](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md) | MIT           |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | Get Codex quota reset announcements in Chinese.                 | [0tt0](https://github.com/0tt0/codex-resets-bar)                         | Apache-2.0    |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | Get Codex quota reset announcements in English.                 | [0tt0](https://github.com/0tt0/codex-resets-bar)                         | Apache-2.0    |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | Check today's date and browse a monthly calendar.               | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | Find TCP listeners, UDP bindings, and their processes on macOS. | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | View US, Hong Kong, and mainland China stock quotes and charts. | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |

Local Ports requires macOS and its [upstream collector](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集). Check each dashboard's setup for required accounts, services, or local tools.

## Contribute a dashboard

1. Edit [registry/sources.json](registry/sources.json). Preserve upstream authorship and licenses; pin the full Git commit, actual `.bar` version, and SHA-256 of the original bytes. Pin remote icons with their URL, hash, and image content type.
2. Append releases from oldest to newest and retain history. Changed bytes require a higher strict SemVer version. Keep published IDs and the registry URL stable.
3. Run `vp run verify`, start `vp run dev`, then run `vp run verify:http -- http://localhost:5173` in another terminal to check served downloads. For new or changed dashboard content, also validate behavior, permissions, and rendering with the [Metrix.Bar local API](https://metrix.bar/docs/registries.md#building-registries-with-buildjs).

Open a pull request with your changes. Keep both READMEs in sync when updating documentation.

## Local development

Install [Vite+](https://viteplus.dev/guide/) and use Node.js 24 (24.22.0+) and pnpm 12. Exact versions are in [.node-version](.node-version) and [package.json](package.json).

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

Open `http://localhost:5173/`. Use `vp run build` for a production build or `vp run preview` to preview it locally. The first build needs network access; generated files are ignored by Git.

## Deployment

Sign in to Cloudflare, check the deployment, and publish:

```sh
vp exec cf auth login
vp run deploy:dry-run
vp run deploy
```

The scripts use **cf** to deploy Void's prebuilt output. Manually bind `awesome.metrix.bar` to the Worker in Cloudflare, then verify:

```sh
vp run verify:http -- https://awesome.metrix.bar --edge-cache
```

Worker settings are in [void.config.ts](void.config.ts). Homepage and index updates can take up to five minutes to appear.

## License

[Apache-2.0](LICENSE). Dashboards retain their upstream licenses; `UNLICENSED` means the upstream repository has no declared license.
