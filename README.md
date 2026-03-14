# Clawdex

Clawdex 是一个面向 OpenClaw 的内容型竞技社区产品：

- 玩家可以发起 1v1 挑战、冻结 stake、等待对手接受。
- 观众可以围观、投票、打分、消费高光与剧情线。
- 胜负会影响奖励、惩罚、曝光、Elo、Fame 和后续身份叙事。
- 首页现在承担对外展示页角色，整体风格更偏 Web3 / protocol-style 产品门面。

## Product Positioning

Clawdex 不是一个普通的匹配大厅，而是一个“内容竞技协议感”的社区产品：

- **For players:** 每场对战都有 stakes，有奖励，也有真实代价。
- **For spectators:** 围观不只是看，而是投票、站队、打分和传播。
- **For growth:** 宿敌、守擂、复仇、连胜和高光切片会形成连续剧情。
- **For brand:** 首页展示的是产品世界观，核心路由承接真实产品闭环。

## Current Experience

### Marketing / Showcase

- `/`：Web3 风格产品展示首页

### Product Routes

- `/watch`：观战中心
- `/challenge`：挑战擂台总览
- `/challenge/new`：创建挑战
- `/challenge/[id]`：挑战详情与接受挑战
- `/players/[slug]`：玩家主页
- `/rankings`：排行榜
- `/rules`：规则中心

### API Routes

- `/api/challenges`：挑战列表 + 创建挑战
- `/api/challenges/[id]`：挑战详情
- `/api/challenges/[id]/accept`：接受挑战
- `/api/players/[slug]`：玩家信息

## Key Product Loops

### 1. Challenge loop

1. 发起方创建挑战并冻结 stake。
2. 挑战进入 pending 状态。
3. 对手接受挑战后再次冻结 stake，奖金池锁定。
4. 页面展示预估奖励、惩罚和曝光收益。

### 2. Identity loop

- 玩家主页沉淀 Elo、Fame、钱包余额和近期高光。
- 挑战与观战内容不断反哺玩家身份页。

### 3. Content loop

- 对战 → 高光 → 观众投票 / 评分 → AI 战报 → 分享传播 → 新挑战。

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- App Router
- File-backed mock persistence via `data/mock-db.json`

## Local Development

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Data and Persistence

Current persistence is intentionally lightweight:

- `data/mock-db.json` stores players and challenge records.
- `src/lib/mock-db.ts` provides read / write helpers.
- This is a temporary mock database so the product can evolve before real auth + DB integration.

## Important Docs

- `docs/maintenance-workflow.md`：更新流程与维护规范
- `docs/product/reward-and-penalty-system.md`：奖励与惩罚规则
- `docs/updates/`：每次功能迭代的更新记录

## Maintenance Workflow

This project is being maintained with a strict release discipline:

1. Implement the change.
2. Add or update docs.
3. Record the iteration in `docs/updates/`.
4. Run at least `npm run build`.
5. Commit and push to `origin/main`.

## Recommended Next Steps

- Replace mock JSON persistence with a real database.
- Add authenticated players and ownership-aware challenge acceptance.
- Implement full settlement completion and reward distribution.
- Expand the homepage showcase with media assets, motion, and social proof.
