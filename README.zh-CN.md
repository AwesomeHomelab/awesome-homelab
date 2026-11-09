# Awesome.Metrix.Bar

简体中文 · [English](README.md)

在 macOS 上使用 [Metrix.Bar](https://metrix.bar/) 时，可以在这里发现社区看板，将它们添加到菜单栏，并通过同一个注册表接收后续版本。打开 [awesome.metrix.bar](https://awesome.metrix.bar/)，选择看板，查看配置说明、作者、许可证和来源后再安装。

## 安装看板并接收更新

| 网站操作                                | 使用方式                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| **Add registry**                        | 打开 Metrix.Bar，添加整个看板集合，随后在应用中浏览和安装看板。                      |
| **Install** / **Install in Metrix.Bar** | 打开 Metrix.Bar，安装选中的看板，并关联此注册表以接收后续更新。                      |
| **Download .bar**                       | 下载单个看板文件，供手动导入。需要让安装的看板关联注册表更新时，请使用 **Install**。 |

添加注册表、安装看板或应用更新时，Metrix.Bar 都会请求确认。请在应用中查看所需权限，并按照看板的配置说明操作。

也可以在 Metrix.Bar 的 **Settings → Registries** 中粘贴这个稳定地址：

```text
https://awesome.metrix.bar/dashboards/index.json
```

看板文件及其声明的远程图标均从本站下载。看板运行时仍使用原有的外部 API 和 CDN 连接；所需账户、服务或本地工具，请参照各看板的配置说明。

## 选择适合的看板

| 看板 ID                                                                    | 用途                                                                | 来源                                                                                        | 上游许可证    |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------- |
| [`komari`](https://awesome.metrix.bar/dashboards/komari)                   | 通过 Komari 查看服务器状态、带宽、流量，以及历史负载和延迟趋势。    | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| [`tokens`](https://awesome.metrix.bar/dashboards/tokens)                   | 查看 Tokens 上的 AI 编程 token 用量、每日花费及模型用量分布。       | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| [`pulse`](https://awesome.metrix.bar/dashboards/pulse)                     | 关注股票和加密货币自选列表，查看日内走势图。                        | [fatwang2/Pulse](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md)              | MIT           |
| [`codex-resets`](https://awesome.metrix.bar/dashboards/codex-resets)       | 追踪 Codex 额度重置公告并接收新公告提醒，使用中文界面。             | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| [`codex-resets-en`](https://awesome.metrix.bar/dashboards/codex-resets-en) | 追踪 Codex 额度重置公告并接收新公告提醒，使用英文界面。             | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| [`calendar`](https://awesome.metrix.bar/dashboards/calendar)               | 查看今天的日期，在月历中浏览或选择日期。                            | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| [`local-ports`](https://awesome.metrix.bar/dashboards/local-ports)         | 查找 macOS 上的 TCP 监听和 UDP 绑定，查看对应进程、PID 及监听范围。 | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| [`stock-board`](https://awesome.metrix.bar/dashboards/stock-board)         | 查看美股、港股和 A 股自选行情、分时走势及日 K 线。                  | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |

本机端口看板需要 macOS 采集器。请按照[上游配置说明](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集)启动采集器，再打开看板。

## 收录或更新看板

编辑 [registry/sources.json](registry/sources.json)，提交新看板或发布上游的新版本。每个条目记录 ID、仓库、文件路径、作者、后备许可证，以及从旧到新排列的 `releases` 列表。

1. 审核上游 `.bar` 文件及其许可证。固定完整的 40 位 Git commit，从实际 `.bar` 元数据读取 ID 和版本号，计算原始字节的小写 SHA-256。保留编码和换行符；上游索引可能过时。若上游移动文件，可在对应发布记录中用 `path` 覆盖路径。
2. 使用严格 SemVer，追加发布记录，保留历史版本且不覆盖。文件字节变化时必须提升版本号；同版本不同哈希或版本倒退都会校验失败。保持已发布的看板 ID、注册表 ID 和公开索引地址稳定。
3. 若看板声明远程图标，固定 `release.icon.url`、`sha256` 和图片 `contentType`，由本站提供下载。保留内嵌 `data:` 图标及原生图标名。
4. 执行 `vp run verify`，用 `vp run dev` 启动服务，再在另一终端运行 `vp run verify:http -- http://localhost:5173`。这些检查会验证官方 Schema、ID 唯一性、版本、元数据一致性，以及实际下载响应的 SHA-256，覆盖保留的历史版本和远程图标。
5. 新增或修改看板内容时，还需使用 [Metrix.Bar 本地 API](https://metrix.bar/docs/registries.md#building-registries-with-buildjs) 验证运行行为、权限与渲染。官方构建器只做静态校验；生成注册表时不执行看板脚本，也不启动本机端口采集器。

[官方注册表构建器与 Schema](https://metrix.bar/docs/registries.md) 的固定地址和哈希位于 `registry/sources.json` 的 `tools` 中，更新哈希前应审核上游变化。保留上游作者、来源链接、许可证声明和元数据原语言；修改文档时同步维护两份 README。

索引只展示最新版本。请保留历史发布记录，让客户端继续通过 `/dashboards/files/<sha256>/<filename>.bar` 下载旧版本。

## 本地开发

安装 [Vite+](https://viteplus.dev/guide/)，使用 **Node.js 24.22.0 或更新的 Node 24 版本**及 **pnpm 12**。精确版本分别声明在 [.node-version](.node-version) 和 [package.json](package.json) 中。

在仓库目录安装依赖，先验证，再启动开发服务：

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

打开 `http://localhost:5173/` 浏览看板，`/dashboards/<id>` 为详情页，`/dashboards/index.json` 为本地注册表。保持服务运行，在另一终端检查实际提供的页面与下载：

```sh
vp run verify:http -- http://localhost:5173
```

`vp run verify` 会生成注册表和 Void 类型，检查格式、lint 和类型，运行测试并构建网站。全新检出后若要单独运行检查或测试，先准备生成文件：

```sh
vp run registry:build
vp run types
```

| 需要做什么               | 命令             |
| ------------------------ | ---------------- |
| 检查格式、lint 和类型    | `vp check`       |
| 运行测试                 | `vp test`        |
| 构建生产版本             | `vp run build`   |
| 构建并在本地预览生产版本 | `vp run preview` |

请使用 `vp run dev` 和 `vp run build`，确保启动或构建前先生成注册表。

首次构建注册表需要访问 GitHub、metrix.bar 和 WebP.se，复用注册表下载缓存时仍会校验哈希。生成内容不进入 Git：`.cache/`、`.generated/`、`public/avatars/`、`.void/`、`.void-wrangler.jsonc`、`.cloudflare/`、`dist/` 和 `.wrangler/` 均已忽略。修改依赖时一并提交 `pnpm-lock.yaml`。

## 部署注册表

通过本地验证后，登录 Worker 所属的 Cloudflare 账户，预检并发布：

```sh
vp exec cf auth login
vp run deploy:dry-run
vp run deploy
```

部署脚本会构建 Void 的 Cloudflare 输出 `.cloudflare/output/v0/`，并使用 `cf deploy --prebuilt --mode production` 发布；预检会添加 `--dry-run`。这种输出需使用 **cf** 部署，不要使用 Wrangler。cf 使用自己的登录凭据。

在 Cloudflare 后台手动将 `awesome.metrix.bar` 绑定到 Worker，然后验证线上部署：

```sh
vp run verify:http -- https://awesome.metrix.bar --edge-cache
```

Worker 设置位于 [void.config.ts](void.config.ts)。域名继续手动绑定，不声明 `routes`，并保持 `workers_dev: false`、`preview_urls: false`。HTTP 检查会对比线上与本地注册表，验证下载文件及真实边缘缓存命中。

受缓存影响，主页和索引的更新最多约需 **五分钟**才可见。若部署后没有立即看到新版本，请等待缓存过期，再运行 HTTP 验证。只要来源列表保留对应发布记录，历史下载地址就能继续使用。

## 许可证

本项目采用 [Apache-2.0](LICENSE) 许可证。各看板分别遵循其上游许可证，具体见上表及注册表。`UNLICENSED` 表示上游仓库未声明许可证。
