# Awesome.Metrix.Bar

简体中文 · [English](README.md)

为 [Metrix.Bar](https://metrix.bar/) 提供社区看板注册表，使用 [Void](https://void.cloud/)、React、[Pico CSS](https://picocss.com/) 和 [Vite+](https://viteplus.dev/) 构建。可在 [awesome.metrix.bar](https://awesome.metrix.bar/) 浏览目录，打开看板详情页查看配置说明、作者信息并安装；索引、看板文件、远程图标及作者头像统一通过我们的 Cloudflare Worker 提供。

在网站点击 **Add registry** 或看板旁的 **Install**，即可打开 Metrix.Bar。应用会请求确认，并让安装的看板继续接收注册表更新。每个 `/dashboards/<id>` 详情页展示原始描述、配置说明、许可证和来源链接，也可通过 **Download .bar** 手动下载。

主页和全部详情页均预渲染，并包含各自的标题、描述、规范链接、社交分享元数据及 JSON-LD。`/sitemap.xml` 列出公开页面，`/robots.txt` 向爬虫提供站点地图地址。Pico CSS 打包到本站。作者头像使用 [WebP.se 的 GitHub 头像服务](https://webp.se/public-services/github-avatar/)。构建时读取 `src/authors.ts` 中已核验的数字 GitHub ID，下载 WebP 图片并复用一天本地缓存，生成本站 `/avatars/<author>.webp` 文件。

也可以在 Metrix.Bar 中添加以下注册表地址：

```text
https://awesome.metrix.bar/dashboards/index.json
```

看板脚本保留原有 API、CDN 连接，这些运行时请求不经过注册表代理。

## 看板

| 看板 ID           | 来源                                                                                        | 许可证        |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------- |
| `komari`          | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| `tokens`          | [baranwang/metrix-bar](https://github.com/baranwang/metrix-bar)                             | AGPL-3.0-only |
| `pulse`           | [fatwang2/Pulse](https://github.com/fatwang2/Pulse/blob/main/metrix/README.md)              | MIT           |
| `codex-resets`    | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| `codex-resets-en` | [0tt0/codex-resets-bar](https://github.com/0tt0/codex-resets-bar)                           | Apache-2.0    |
| `calendar`        | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| `local-ports`     | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |
| `stock-board`     | [JasonChou0v0/metrix-bar-dashboards](https://github.com/JasonChou0v0/metrix-bar-dashboards) | UNLICENSED    |

看板归原作者所有，沿用上游许可证；`UNLICENSED` 表示来源仓库未声明许可证。索引保留作者及固定到具体提交的来源链接。本机端口看板需要运行 macOS 采集脚本，详见[上游配置说明](https://github.com/JasonChou0v0/metrix-bar-dashboards#启动本机端口采集)。

项目优先使用英文，英文 README 与本简体中文译文同步维护；上游看板元数据保留原语言。

## 本地开发

安装 [Vite+](https://viteplus.dev/guide/)，使用 Node.js 24、pnpm 12。精确版本分别声明在 `.node-version` 和 `package.json` 中，Vite+ 负责选用对应包管理器。

```sh
vp install --frozen-lockfile
vp run verify
vp run dev
```

主页地址为 `http://localhost:5173/`，详情页位于 `/dashboards/<id>`，注册表位于 `/dashboards/index.json`。Void 通过 `@void/react` 提供 React Pages，使用 `output: "static"` 在构建时预渲染 HTML。主页和详情页使用 `.island.tsx`，不启用 hydrated islands。可复用 React 组件和本地打包的 Pico 样式位于 `src/views/`，注册表及下载 API 仍由 `src/routes/` 下的 Worker 路由提供。

生产构建包含 `dist/client/index.html`，以及每个看板对应的 `dist/client/dashboards/<id>.html`。详情页的 `.server.ts` 使用 `getPrerenderPaths()` 枚举 ID，并提供各页 SEO 元数据。保持枚举结果与生成的注册表一致，新增条目即可自动获得详情页和站点地图地址。仅对需要请求时渲染的页面设置 `prerender = false`；只有组件需要浏览器交互时，才使用 Void 的 island 导入。

| 命令                                                     | 用途                                             |
| -------------------------------------------------------- | ------------------------------------------------ |
| `vp run registry:build`                                  | 下载固定版本的来源，校验元数据和哈希，生成注册表 |
| `vp run types`                                           | 生成 Void 路由与环境类型                         |
| `vp run dev`                                             | 生成注册表并启动本地 Worker                      |
| `vp run build`                                           | 生成注册表并构建生产 Worker                      |
| `vp run preview`                                         | 构建并在本地运行生产 Worker                      |
| `vp check`                                               | 检查格式、lint 和类型                            |
| `vp check --fix`                                         | 应用格式化及可自动修复的 lint 修改               |
| `vp test`                                                | 执行一轮 Node.js 与 Workers 运行时测试           |
| `vp test tests/worker.test.ts -t 'exact upstream bytes'` | 运行指定测试                                     |
| `vp test watch`                                          | 持续监听测试                                     |
| `vp run verify`                                          | 生成注册表与类型，检查、测试并构建               |
| `vp run verify:http -- http://localhost:5173`            | 验证主页、索引、保留的看板文件及远程图标         |

使用 `vp run dev`、`vp run build`；同名内置命令 `vp dev`、`vp build` 会跳过注册表生成。全新检出后若要单独检查或测试，先执行 `vp run registry:build` 和 `vp run types`。

直接依赖使用 `^` 范围，实际安装版本由 `pnpm-lock.yaml` 固定。Node.js 类型定义保持在支持的 Node 24 主版本内，`package.json` 与 `pnpm-workspace.yaml` 中的 Vite+ 别名保持一致。

首次生成需要访问 GitHub、metrix.bar 和 WebP.se，后续复用 `.cache/` 中已校验哈希的注册表下载文件，并在一天后刷新头像。刷新失败时保留现有头像，下次构建再次尝试；空缓存仍需要成功下载。`public/avatars/`、`.cache/`、`.generated/`、`.void/`、`.void-wrangler.jsonc`、`.cloudflare/`、`dist/`、`.wrangler/` 内的生成内容不进入 Git；依赖锁文件进入 Git。

CI 执行相同验证、部署预检及本地 HTTP 下载检查，不自动部署。

## 收录或更新看板

编辑 [registry/sources.json](registry/sources.json)。每个看板声明 ID、仓库、文件路径、作者、后备许可证及按时间排列的 `releases`。每个发布版本固定完整 Git commit、实际 `.bar` 文件内的版本号，以及原始字节的 SHA-256。上游移动文件时，可在该发布版本中用 `path` 覆盖路径。

1. 审核上游文件和许可证。固定完整 commit，下载原始文件并计算 SHA-256，从 `.bar` 根元素读取版本号；上游索引可能过时。
2. 在保留历史版本的前提下追加发布记录。字节变化必须提升版本号；同版本不同哈希、版本倒退都会校验失败。
3. 若文件声明远程图标，为该版本添加 `icon`，包含 `url`、`sha256` 及图片 `contentType`。生成索引会将其改为本站不可变图标地址。内嵌 `data:` 图标、原生图标名不需要额外请求。
4. 执行 `vp run verify`，用 `vp run dev` 启动服务，然后在另一终端运行 `vp run verify:http -- http://localhost:5173`。
5. 修改看板脚本后，还需使用 Metrix.Bar 本地 check/validate API 验证权限与渲染。注册表构建器只做静态校验，不执行看板脚本。

[官方注册表构建器与 Schema](https://metrix.bar/docs/registries.md) 按 `tools` 中的固定哈希下载。上游工具内容变化会使哈希检查失败，应审核差异后再更新固定值。

索引只展示最新版本。保留的历史版本继续通过 `/dashboards/files/<sha256>/<filename>.bar` 下载。注册表 ID、看板 ID 和公开索引入口保持稳定；删除历史发布记录会破坏仍持有旧地址的客户端。

## 部署与缓存

[void.config.ts](void.config.ts) 集中管理 Void 与 Cloudflare 配置，不声明域名路由，并关闭默认 `workers.dev` 域名和版本预览地址。使用 `vp exec cf auth login` 登录 Worker 所属的 Cloudflare 账户；部署后，在 Cloudflare 后台手动绑定 `awesome.metrix.bar`，再执行 HTTP 验收。若配置 CI 部署，需将 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` 存为 secrets。

部署脚本会构建 Void 的 Cloudflare 输出，并使用 `cf deploy --prebuilt --mode production` 发布；预检使用同一命令并加上 `--dry-run`。Cloudflare CLI 的登录状态独立于 Wrangler；Wrangler 无法部署这种构建输出。

```sh
vp run deploy:dry-run
vp run deploy
vp run verify:http -- https://awesome.metrix.bar --edge-cache
```

Worker 只获取映射表内固定提交的上游资源，直接返回字节，并在成功分发前核对 SHA-256；上游重定向会被拒绝。没有可传入任意目标地址的代理入口。

启用 [Workers Cache](https://developers.cloudflare.com/workers/cache/)，并设置 `cross_version_cache: true`：

| 响应                               | Cache-Control                          |
| ---------------------------------- | -------------------------------------- |
| HTML 页面与注册表索引              | `public, max-age=60, s-maxage=300`     |
| 作者头像                           | `public, max-age=3600, s-maxage=86400` |
| 哈希地址的看板文件与远程图标       | `public, max-age=31536000, immutable`  |
| 未知路径、下载失败、完整性校验失败 | `no-store`                             |

注册表支持 ETag、条件 GET、HEAD；主页支持 GET 和 HEAD。跨版本缓存使不可变文件在部署后仍可复用，主页及索引更新最多约五分钟可见。HTTP 验收会检查全部页面、规范链接、结构化数据、站点地图和头像，对比服务端索引与本地构建，并检查所有保留的看板文件和远程图标的哈希、内容类型及缓存策略。添加 `--edge-cache` 可要求重复请求返回 `Cf-Cache-Status: HIT`，并核对缓存字节；可结合 Workers 可观测性检查 CPU 与回源变化。

边缘缓存命中时跳过 Worker 执行，减少 CPU 与上游流量。Cloudflare 仍将命中计为标准 Worker 请求，缓存不会减少这部分请求计费。
