# Clawdex TODO — 产品迭代清单

> 由架构师 / PM 维护。开发 Agent 按优先级逐条实现，每完成一条 commit。
> PM 每轮 review commit 后更新此文件。

---

## 🔴 P0 — 必须立即修复

### 1. Replay 详情页链接修正
- **问题**：`/replay` 列表页中，每张卡片的 Link href 指向 `/debate/{debateId}` 或 `/challenge/{matchId}`，但应该统一指向 `/replay/{matchId}`（即 challenge ID）。
- **文件**：`src/app/replay/page.tsx`
- **改法**：所有卡片的 `<Link href={...}>` 统一改为 `href={/replay/${match.id}}`，不再区分是否有辩论。

### 2. Replay 列表页筛选标签改为可交互
- **问题**：当前筛选标签（全部/已结算/进行中/含辩论）仅为静态 `<span>`，不可点击。
- **文件**：`src/app/replay/page.tsx`
- **方案**：
  - 使用 URL searchParams `?filter=all|settled|live|debate` 控制筛选
  - 标签改为 `<Link>` 或改成客户端组件用 `useState`
  - 高亮当前选中标签（`border-accent/40 bg-accent/10`），其余灰色

---

## 🟡 P1 — 本轮迭代核心需求

### 3. 观战中心 /watch 页面增加跳转到回放
- **现状**：`/watch` 页面的已结算卡片点击无反应。
- **需求**：已结算对战卡片加上 `<Link href="/replay/{id}">` 指向回放详情页。进行中的卡片加上 `<Link href="/challenge/{id}">` 指向挑战详情。

### 4. 选手主页增加历史战绩区块
- **文件**：`src/app/players/[slug]/page.tsx`
- **需求**：在选手主页底部增加「历史战绩」区块：
  - 列出该选手参与的所有 challenge（作为 challenger 或 defender）
  - 每行显示：对手名、模式、结果（胜/负/进行中）、奖池、日期
  - 点击跳转 `/replay/{id}`
  - 调用 `listChallenges()` 后在客户端筛选该选手的记录

### 5. 辩论详情页增加「返回」和「回放入口」导航
- **文件**：`src/app/debate/[id]/page.tsx`
- **需求**：页面顶部增加面包屑或返回按钮：`对战回放 > 辩论 PK #xxx`，点击「对战回放」回到 `/replay`。底部增加「查看完整对战回放」按钮跳转到 `/replay/{challengeId}`。

### 6. 挑战详情页增加辩论入口
- **文件**：`src/app/challenge/[id]/page.tsx`
- **需求**：如果该挑战有关联辩论（`getDebateByChallengeId`），在 settlement 区块下方增加「查看辩论实录」卡片，展示议题摘要和发言数，点击跳转 `/debate/{debateId}` 或 `/replay/{challengeId}`。

---

## 🟢 P2 — 体验优化

### 7. 回放详情页增加「上一场 / 下一场」导航
- **文件**：`src/app/replay/[id]/page.tsx`
- **需求**：页面底部增加翻页导航，按时间排序指向上/下一场对战的回放页。需要在数据层扩展一个 `getAdjacentChallenges(id)` 函数返回 prev/next。

### 8. 排行榜页面增加「最近对战」列
- **文件**：`src/app/rankings/page.tsx`
- **需求**：排行榜表格增加一列「最近对战」，显示该选手最近一场对战的对手和结果，点击跳转 `/replay/{id}`。

### 9. 首页增加「最新回放」推荐区块
- **文件**：`src/app/page.tsx`
- **需求**：首页底部增加「最新回放」区块，展示最近 3 场已结算对战：对手、结果、奖池。使用与 `/replay` 列表相同的卡片样式但简化版。

### 10. 页面 metadata（SEO）
- **文件**：`src/app/replay/page.tsx`、`src/app/replay/[id]/page.tsx`
- **需求**：为 replay 页面导出 `metadata` / `generateMetadata`，包含标题、描述，用于 SEO 和社交分享。

---

## 🔵 P3 — 后续规划（暂不实现）

### 11. 回放动画/时间轴播放器
- 将辩论回合改为可按时间轴自动播放的「直播回放」模式，逐条发言淡入展示。

### 12. 数据导出 — 对战记录 CSV/JSON 下载
- `/api/replay/export?format=csv` 导出选手的历史对战数据。

### 13. 观众评论系统
- 回放页面底部支持观众留言评论，用于赛后讨论。

---

_最后更新：2026-03-15 · PM Review Round 1_
