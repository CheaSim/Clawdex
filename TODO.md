# Clawdex TODO — 产品迭代清单

> 由架构师 / PM 维护。开发 Agent 按优先级逐条实现，每完成一条 commit。
> PM 每轮 review commit 后更新此文件。

---

## ✅ P0 — 已完成（Round 2 Review）

### 1. ~~Replay 详情页链接修正~~ ✅
- **已修复**：所有卡片 Link 统一指向 `/replay/${match.id}`。
- **Review 备注**：实现正确，无问题。

### 2. ~~Replay 列表页筛选标签改为可交互~~ ✅
- **已修复**：使用 `searchParams.filter` + `<Link>` 实现服务端筛选，高亮逻辑正确。
- **Review 备注**：
  - ✅ filterOptions 提取为常量 + `as const`，好
  - ✅ 不合法 filter 值 fallback 到 `"all"`，防御到位
  - ✅ 空结果提示文案改为「当前筛选下暂无回放记录」，更准确
  - ⚠️ **额外改动注意**：emoji 🏆 被替换为文字"冠军"，破分隔符从 `—` 改为 `·`，Polymarket odds 预览被移除。Polymarket 预览移除是退步，下面新增 P0 补回。
  - ⚠️ **额外改动注意**：代码注释（`{/* ─── Filter Tabs */}` 等）全部被删除（代码清洁化），可以接受。
  - ⚠️ 变量命名从短名（`c`, `d`, `s`）改为全名（`challenge`, `debate`, `sum`），style 层面可以接受。

---

## ✅ P0 补充 — 已完成（Round 3 Review）

### 2.1 ~~恢复 Replay 列表页 Polymarket 赔率预览~~ ✅
- **已修复**（`049f7b2`）：Polymarket odds 行已恢复到辩论预览区块底部。
- **Review 备注**：实现正确，用 `debate.topic ? ... : null` 守卫，无问题。

### 2.2 ~~开发完成后必须 commit~~ ✅
- **已修复**：3 个 commit 均已正确提交（`26242c1`, `049f7b2`, `ec54d50`）。

---

## ✅ P1 部分完成（Round 3 Review）

### 3. ~~观战中心 /watch 页面增加跳转到回放~~ ✅
- **已修复**（`ec54d50`）：已结算卡片 → `/replay/{id}`，进行中卡片 → `/challenge/{id}`。
- **Review 备注**：
  - ✅ 用 `targetHref` 变量分流，逻辑清晰
  - ✅ 近期结算高光区块统一指向 `/replay/{id}`
  - ⚠️ 额外改动：emoji 🏆 被移除（`watch` 页面高光区 winner 显示），风格统一可接受
  - ⚠️ 额外改动：description 文案微调（沉浸→持续），可接受

---

## 🔴 P0 — 必须立即修复

### 3.1 Watch 页面「近期结算高光」区需去重（NEW）
- **问题**：`/watch` 页面中，`recentSettled` 同时出现在上方 `allWatchable` 列表和下方「近期结算高光」区，导致已结算对战重复显示两次。
- **文件**：`src/app/watch/page.tsx`
- **改法**：将上方 `allWatchable` 只包含 `liveAndAccepted`（去掉 recentSettled），或在下方「近期结算高光」标注为独立区块并从上方排除。

---

## 🟡 P1 — 本轮迭代核心需求

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

_最后更新：2026-03-15 · PM Review Round 3_
_Round 3：P0 #2.1 #2.2 验收通过，P1 #3 验收通过。新增 P0 #3.1（watch 去重）。下一步：P1 #4 #5 #6。_
