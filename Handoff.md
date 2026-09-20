# Handoff: Core Web Vitals 优化

更新日期：2026-09-19　分支：`perf/core-web-vitals`（基于 `main` 的 `c9d5d49`，未推送，工作区已干净）

## 1. 背景与目标

Cloudflare Web Analytics 显示三项 Core Web Vitals 有页面"需改进/差"。目标是在**不改变站点外观和玩法**的前提下把它们降下来，并且尽量保持图片清晰度、不出现图片加载位移。

改动前的后台数据（截图）：

| 指标 | Good | 需改进 | 差 | 备注 |
|---|---|---|---|---|
| LCP | 94% | 6% | 0% | P50 614ms / P75 868ms / P90 2,032ms / P99 2,928ms；需改进集中在 `/` |
| CLS | 86% | 9% | 5% | `/photography` 差（10 次）；`/game` 需改进（20 次） |
| INP | 95% | 5% | 0% | `/game` 需改进（20 好 / 10 需改进） |

CLS 调试视图里的两个元素：`#main-card-footer`（0.111）和 `div.bg-gray-100.border.border-transparent.cursor-pointer…`（0.585，即 Gallery 的照片卡片）。

## 2. 当前状态

### 已提交（分支 `perf/core-web-vitals`，共 5 个提交，可单独 `git revert`）

| 提交 | 内容 | 目标指标 |
|---|---|---|
| `98705c8` | 删除 `vite.config.ts` 的 `manualChunks`；admin 和 ChatWidget 改懒加载（`App.tsx`） | LCP |
| `6b8a638` | `Game.tsx` 的文案字典 `GAME_TEXT` 提到模块级；`useCanvasLayer` 在标签页隐藏时停 rAF；`NightCloudCanvas` 非夜晴时 `display:none` 并跳过每帧清空 | INP |
| `a829689` | 游戏音频：提前创建 AudioContext、首次手势 `resume()`、首音符就绪即播、卸载时停音乐并 `close()` | 声音启动、INP |
| `c4c010a` | Gallery 预取宽高比 + 共用 header；`PageLoader` 80vh；About 图片从原图重新导出（3000px / q92，4MB→2.3MB） | CLS |
| `0d3bd75` | 补齐剩余位移：Lightbox 按比例预留大图框；About 的 10 个 logo 加 `width`/`height`；非首页 `#content-container` 加 `min-h-[80vh]`（与 `PageLoader` 对齐）；Gallery 清理已不存在照片的比例缓存 | CLS |

最后一次 `npm run build`（含 `0d3bd75`）：lint 0 错误（73 条警告，改动前后一致）、类型检查通过、构建成功。

## 3. 已验证 / 未验证

**已在真实浏览器里验证**（Playwright + `vite preview`，模拟 `/api/photos` 和图片，同时构建 `main` 做基准）：

- CLS：Gallery 手机宽度 0.565 → 0.0009；桌面 0.056 → 0.0001；About 0.150 → 0；Design 0.033 → 0。
- 首页不再请求 Three.js chunk；ChatWidget 单独加载；`/project-flow`、`/admin`、`/admin/chat-logs` 渲染正常且无页面报错。
- 夜间云层：白天隐藏、晴夜显示、夜雨隐藏。
- 游戏 AudioContext：手势前 suspended → 开始后 running → 离开页面后 closed（旧版离开后仍是 running，从不关闭）。
- Lightbox 标题：旧版加载原图时 432→792 跳动，新版不动。

**没有验证**：

- **声音本身。** 自动化只能看 AudioContext 状态，听不到。首音符是否更快、手机上是否只需点一次，必须人工确认。
- **INP 的实际改善。** 只确认了重建 effect 的原因被消除，没有做交互延迟测量。
- **线上数据。** Cloudflare 需要部署后积累数据才能看出 LCP / CLS / INP 分布变化。
- **Cloudflare Pages 分支预览。** 分支还没推送，预览站没走过。

## 4. 卡住 / 待决定的问题

1. **声音"慢"的具体场景不明。** 已问用户是在电脑还是手机、是延迟还是要点两次，用户尚未回答。目前的修复是不依赖设备的通用做法（见 §6）。如果修复后仍慢，下一步是"提前排程"（见 §5）。
2. **"离开游戏页后音乐继续响"未复现。** 代码上没有卸载清理，AudioContext 泄漏已确认；但测试里离开后没有新音符产生，可能是那局游戏已结束。不要在没复现的情况下把它当成已证实的 bug 写进对外说明。
3. **Gallery 首次访问的等待。** 为了零位移，首次访问要等全部缩略图量完比例才显示（最长 4 秒）；回访读 localStorage 缓存。用户当前选择"零位移优先"，所以没有改成"只等首屏"的折中方案。
4. **缓存可能过期。** 比例缓存以照片 `key` 为键；如果同名文件被替换成不同比例，会用旧比例预留空间，加载后出现一次位移。API 目前不返回 `etag`/`uploaded`，没法据此失效。

## 5. 下一步计划

按优先级：

1. **推送分支，用 Cloudflare Pages 预览站验证**：Gallery 首次加载和回访、游戏声音（电脑 + 手机各试）、游戏中切走页面音乐是否停止、夜间云层（控制台 `__setWeather("clear", 3, false)`）、`/admin`、手机宽度。
2. **合并到 `main`，部署，观察 1–2 周**的 Cloudflare 数据，重点看：`/photography` 的 CLS、首页 LCP 的 P75/P90、`/game` 的 INP。
3. **视预览结果决定是否做**：
   - 音频"提前排程"（lookahead scheduler）：用 AudioContext 自己的时钟提前约 100ms 排音符，避免主线程繁忙时节奏忽快忽慢。改动较大，只有玩起来节奏不稳时才做。
   - 让 API 直接返回图片宽高（例如上传时写入 R2 `customMetadata`），这样 Gallery 就不用在客户端预取，首次也能立刻显示。
   - 清理 `index.html` 里残留的 `aistudiocdn` importmap（Vite 打包后已不起作用）。
   - Google Fonts 目前是渲染阻塞的，可以改成非阻塞，但字体切换会带来新的布局位移，需要配合 `size-adjust` 之类的回退字体调整，和 CLS 目标冲突，没做。

## 6. 踩过的坑（避免重复）

**构建与分包**
- `manualChunks` 里手动放一个 `three-vendor` 会把 React 的共享运行时（jsx-runtime、scheduler）也吸进去，导致 1MB 的 Three.js 被 modulepreload 到**每个页面**，包括首页。判断方法：看构建后 `dist/index.html` 里的 `modulepreload`。现在已删除，不要加回来。

**React / 游戏**
- 在组件函数体里写 `const text = {...}` 再 `const t = text[language]`，每次渲染 `t` 都是新对象；`t` 又在游戏主 effect 的依赖里，于是点静音/暂停引起重渲染时整个 canvas 循环被拆掉重建。文案这类不依赖状态的常量要放在模块级。
- 游戏主 effect 依赖很多 `useCallback`，改动其中任何一个的依赖都可能让 effect 重建，改之前先看依赖数组。

**音频**
- 暂停（suspended）的 AudioContext 时钟是冻结的，此时排进去的音符都落在同一时刻，恢复时会一起爆出来。所以节拍要在 `ctx.state === 'running'` 时才排。
- iOS Safari 只认 `touchend`/`click` 作为解锁手势，`pointerdown` 不算，所以解锁监听要同时挂 `pointerdown`、`touchend`、`click`、`keydown`。
- Chrome 对同一页面的 AudioContext 数量有上限（约 6 个），并且 React StrictMode 开发模式会挂载两次，所以创建了就必须在卸载时 `close()` 并把 ref 置空。

**CLS**
- 只有**在视口内**发生的位移才计入。所以页脚 0.111 的根因是懒加载占位只有 200px，页脚在屏幕内，内容到达后被顶下去；把占位加高到页脚在首屏之外就消除了，同时要给内容容器设同样的最小高度，否则短页面加载完页脚会上跳进视野。
- `<img>` 只要带 `width`/`height` 属性，Tailwind v4 的 preflight（`height: auto`）会让浏览器按属性算出宽高比，从而在加载前预留空间。API 不返回尺寸，所以 Gallery 在客户端预取缩略图量比例，而不是在 Worker 里量（R2 的子请求数量有限制，照片一多会超）。
- 量不到比例的照片用固定 `aspect-[3/2]` + `object-contain`（完整显示、可能留白），保证任何情况下都不会位移；用 `object-cover` 会裁掉内容。

**图片压缩**
- 要重新压缩图片时，一定从**原图**（`git show <旧提交>:路径`）导出，不要在已经压缩过的版本上再压。
- macOS `sips` 裁剪 JPEG 时会用默认质量重新编码，把 q100 和 q80 的差别抹平，导致对比无效；对比画质要输出成 PNG 再看。

**测试 / 环境**
- 这台机器的 shell 是 zsh：`grep --include=*.tsx` 会因为通配符报 `no matches found`，要加引号；`echo =====` 会被当成命令展开报错。
- 这个会话里没有 Grep 工具，只能用 Bash 的 `grep`。
- Playwright 点击 Gallery 里的照片会超时，因为照片列在持续滚动、元素永远"不稳定"；测试里改用 `page.evaluate(() => el.click())`。
- 做新旧对比的办法：`git worktree add --detach <目录> main`，把 `node_modules` 软链进去，`npx vite build` 后各起一个 `vite preview`（不同端口），测完 `git worktree remove --force` 并 `git worktree prune`。
- 验证脚本放在会话的临时目录里，**没有加进仓库**，会话结束后不保留。要复用就重新写：模拟 `/api/photos` 和 `media.yunwustudio.com` 的图片请求，用 `PerformanceObserver` 监听 `layout-shift`，并把非 `/assets/index*` 的 JS chunk 人为延迟约 900ms 来模拟慢网络。
- `/video` 测试里会有一条 `Failed to fetch videos: TypeError: Cannot read properties of undefined (reading 'length')`，是测试脚本的问题：真实的 `/api/videos` 返回 `{ videos: [...], totalResults }`（见 `functions/api/videos.ts`），而脚本对所有未单独模拟的 `/api/*` 都返回了 `[]`，`data.videos` 就成了 `undefined`。这个错误被 `Video.tsx` 的 `try/catch` 接住，页面只是显示 "Failed to load videos" 的提示，没有崩溃。新旧版本都有，与本次改动无关。以后要测 `/video`，模拟数据要用 `{"videos": [], "totalResults": 0}`。

## 7. 关键文件速查

| 文件 | 相关内容 |
|---|---|
| `vite.config.ts` | 已删除 `manualChunks`，注释说明了原因 |
| `App.tsx` | admin / ChatWidget 的 `lazy()` 与 `Suspense` |
| `components/Photography.tsx` | 比例预取（`resolveAspectRatios`、`ratioCache`、localStorage 键 `photoAspectRatios`）、共用 `headerSection`、固定 3:2 回退 |
| `components/Lightbox.tsx` | `aspectRatio` 属性 |
| `components/MainContent.tsx` | `PageLoader`、`#content-container` 的 `min-h-[80vh]`、`#main-card-footer` |
| `components/About.tsx` / `public/images/about-page-yun.jpg` | 大图 3000×1674，logo 234×234 |
| `components/Game.tsx` | `GAME_TEXT`、音频生命周期 effect、`playArcadeMusic` 里的节拍守卫 |
| `components/weather/useCanvasLayer.ts` / `NightCloudCanvas.tsx` | 后台标签页暂停、夜晴才显示 |
| `components/weather/collisionDetection.ts` | 按 `#content-container`、`#main-card-header`、`#main-card-footer` 取碰撞矩形，改这些元素的 id 或结构时要同步 |

## 8. 常用命令

```bash
npm run build                      # lint + typecheck + 生产构建（改完必跑）
npm run dev                        # 本地开发 (localhost:3000)
git log --oneline main..HEAD       # 查看分支上的提交
git revert <hash>                  # 单独回退某一组改动
git checkout <旧提交> -- public/images/about-page-yun.jpg   # 恢复原始 About 图片
```
