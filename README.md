# Awesome.Metrix.Bar

[简体中文](README.zh-CN.md) · English

A community registry of dashboards for [Metrix.Bar](https://metrix.bar/) on macOS, Windows, and Linux (experimental). Browse them all at [awesome.metrix.bar](https://awesome.metrix.bar/).

## Install a dashboard

Choose **Add registry** on the site, or paste this URL into Metrix.Bar's **Settings → Registries**:

```text
https://awesome.metrix.bar/dashboards/index.json
```

Then open a dashboard's page, follow its setup notes, and choose **Install**. You confirm the requested permissions and each update in Metrix.Bar.

## Dashboards

| Dashboard                                                                  | Use it for                        |
| -------------------------------------------------------------------------- | --------------------------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | Server monitoring                 |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | AI coding usage                   |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | Stocks and cryptocurrency         |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | Codex quota resets (Chinese)      |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | Codex quota resets (English)      |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | Monthly calendar                  |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | Local ports and processes (macOS) |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | Stock quotes and charts           |
| [`stevefans`](https://awesome.metrix.bar/dashboards/stevefans)             | X followers                       |
| [`magpie`](https://awesome.metrix.bar/dashboards/magpie)                   | Agent models and allowances       |
| [`nezha`](https://awesome.metrix.bar/dashboards/nezha)                     | Nezha V2 monitoring               |

Each dashboard page lists its author, version, license, and setup notes. Catalog order uses each repository’s GitHub stars divided by its number of listed dashboards. Badges show total stars and link to the repository.

## Contribute

Open an issue with the dashboard's upstream URL, or send a pull request that updates [registry/sources.json](registry/sources.json). Keep upstream authors, licenses, original bytes, and release history intact; the requirements are in [AGENTS.md](AGENTS.md). Keep both READMEs in sync.

## Development

Use [Vite+](https://viteplus.dev/guide/) with Node.js 24 (24.22.0+) and pnpm 12.

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

The development server runs at `http://localhost:5173/`.

Project stars refresh during builds with a 24-hour local cache in `.cache/projects/`. Set `GH_TOKEN` for authenticated GitHub requests; CI uses its built-in token. Failed requests keep cached counts; unavailable counts show `—` and sort last. The live catalog updates on deployment.

## Deployment

```sh
vp run deploy:dry-run
vp run deploy
```

## License

[Apache-2.0](LICENSE). Each dashboard keeps its upstream license; `UNLICENSED` means the upstream repository declares none.
