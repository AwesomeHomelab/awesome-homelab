# Awesome.Metrix.Bar

简体中文 · [English](README.md)

适用于 macOS、Windows 和 Linux（实验性支持）的 [Metrix.Bar](https://metrix.bar/) 社区看板注册表，全部看板见 [awesome.metrix.bar](https://awesome.metrix.bar/)。

## 安装看板

在网站上点击 **Add registry**，或在 Metrix.Bar 的 **Settings → Registries** 中粘贴：

```text
https://awesome.metrix.bar/dashboards/index.json
```

然后打开看板页面，按说明完成配置，点击 **Install**。所需权限和每次更新都由你在 Metrix.Bar 中确认。

## 看板

| 看板                                                                       | 用途                    |
| -------------------------------------------------------------------------- | ----------------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | 服务器监控              |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | AI 编程用量             |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | 股票与加密货币          |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | Codex 额度重置（中文）  |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | Codex 额度重置（英文）  |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | 月历                    |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | 本机端口与进程（macOS） |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | 股票报价与走势          |
| [`stevefans`](https://awesome.metrix.bar/dashboards/stevefans)             | X 粉丝数                |
| [`magpie`](https://awesome.metrix.bar/dashboards/magpie)                   | Agent 模型与额度        |
| [`nezha`](https://awesome.metrix.bar/dashboards/nezha)                     | 哪吒 V2 监控            |

每个看板页面还列出作者、版本、许可证和配置说明。目录按仓库 Star 数除以本站收录的看板数降序排列。徽章显示 Star 总数，并链接到仓库。

## 贡献

可以在 Issue 中提供看板的上游地址，或提交修改 [registry/sources.json](registry/sources.json) 的 Pull Request。请保留上游作者、许可证、原始字节和发布历史，具体要求见 [AGENTS.md](AGENTS.md)。修改文档时同步更新两份 README。

## 开发

使用 [Vite+](https://viteplus.dev/guide/)、Node.js 24（24.22.0+）和 pnpm 12。

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

开发服务器地址为 `http://localhost:5173/`。

项目 Star 在构建时刷新，本地缓存位于 `.cache/projects/`，有效期为 24 小时。设置 `GH_TOKEN` 可使用 GitHub 认证请求，CI 使用内置令牌。请求失败时沿用缓存；无可用数据时显示 `—` 并排在最后。线上目录随部署更新。

## 部署

```sh
vp run deploy:dry-run
vp run deploy
```

## 许可证

[Apache-2.0](LICENSE)。各看板保留其上游许可证；`UNLICENSED` 表示上游仓库未声明许可证。
