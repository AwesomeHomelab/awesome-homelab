# Awesome.Metrix.Bar

简体中文 · [English](README.md)

适用于 macOS、Windows 和 Linux（实验性支持）的 [Metrix.Bar](https://metrix.bar/) 社区看板。在菜单栏或系统托盘查看服务器状态、AI 用量、行情等信息。

## 开始使用

1. 浏览[看板目录](https://awesome.metrix.bar/)，点击 **Add registry**，或在 Metrix.Bar 的 **Settings → Registries** 中粘贴：

   ```text
   https://awesome.metrix.bar/dashboards/index.json
   ```

2. 打开看板详情页，阅读配置说明，点击 **Install**，在 Metrix.Bar 中确认所需权限。

安装后可通过注册表接收更新，更新看板前需要确认。也可点击 **Download .bar** 手动导入。看板脚本仍使用原有的外部服务连接。

## 看板

| 看板                                                                       | 用途                                           | 来源                                                                     | 许可证        |
| -------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ | ------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | 查看服务器状态、带宽、流量和负载。             | [baranwang](https://github.com/baranwang/metrix-bar)                     | AGPL-3.0-only |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | 查看 AI 编程 token 用量、花费和模型用量分布。  | [baranwang](https://github.com/baranwang/metrix-bar)                     | AGPL-3.0-only |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | 关注股票与加密货币，查看日内走势图。           | [fatwang2](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md) | MIT           |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | 接收 Codex 额度重置公告，中文界面。            | [0tt0](https://github.com/0tt0/codex-resets-bar)                         | Apache-2.0    |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | 接收 Codex 额度重置公告，英文界面。            | [0tt0](https://github.com/0tt0/codex-resets-bar)                         | Apache-2.0    |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | 查看今天的日期和月历。                         | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | 查看 macOS 上的 TCP 监听、UDP 绑定及对应进程。 | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | 查看美股、港股和 A 股报价及走势图。            | [JasonChou0v0](https://github.com/JasonChou0v0/metrix-bar-dashboards)    | UNLICENSED    |
| [`stevefans`](https://awesome.metrix.bar/dashboards/stevefans)             | 以点阵显示 X 粉丝数，支持多账号与趋势图。      | [zxfccmm4](https://github.com/zxfccmm4/stevefans-bar)                    | MIT           |
| [`magpie`](https://awesome.metrix.bar/dashboards/magpie)                   | 在菜单栏切换 Agent 模型、连接状态与额度。      | [thedavidweng](https://github.com/thedavidweng/metrix-bar)               | AGPL-3.0-only |

本机端口看板需要 macOS 和[上游采集器](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集)。各看板所需账户、服务或本地工具，请参照其配置说明。

## 贡献看板

1. 编辑 [registry/sources.json](registry/sources.json)。保留上游作者与许可证，固定完整 Git commit、实际 `.bar` 版本及原始字节的 SHA-256；远程图标需固定 URL、哈希和图片内容类型。
2. 按从旧到新的顺序追加发布记录，保留历史版本。文件字节变化时，必须使用更高的严格 SemVer 版本。保持已发布的 ID 和注册表地址稳定。
3. 执行 `vp run verify`，用 `vp run dev` 启动服务，再在另一终端运行 `vp run verify:http -- http://localhost:5173`，检查实际下载响应。新增或修改看板内容时，还需使用 [Metrix.Bar 本地 API](https://metrix.bar/docs/registries.md#building-registries-with-buildjs) 验证运行行为、权限和渲染。

完成后提交 Pull Request。修改文档时同步维护两份 README。

## 本地开发

安装 [Vite+](https://viteplus.dev/guide/)，使用 Node.js 24（24.22.0+）和 pnpm 12。精确版本见 [.node-version](.node-version) 和 [package.json](package.json)。

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

打开 `http://localhost:5173/`。使用 `vp run build` 构建生产版本，或用 `vp run preview` 在本地预览。首次构建需要联网；生成文件已加入 `.gitignore`。

## 部署

```sh
vp run deploy:dry-run
vp run deploy
```

## 许可证

[Apache-2.0](LICENSE)。各看板保留上游许可证；`UNLICENSED` 表示上游仓库未声明许可证。
