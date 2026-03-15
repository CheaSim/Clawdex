# Clawdex — Agent 指南 & 设计理念

> 本文件面向 AI Agent / Copilot / 自动化工具。每次更新后 commit，完成大需求后 push。

## Agent 协作机制

当前仓库使用 `TODO.md` 作为任务源，使用 `coordination/agent-events.jsonl` 作为双向提醒通道。

### 规则

1. 实现方完成任务后，先 commit，再发送通知
2. PM / 架构方 review 完后，更新 `TODO.md`，再回发通知
3. 双方都可以运行轮询脚本，每分钟自动检查 `TODO.md` 和收件箱

### 脚本

- `scripts/agent-notify.ps1`
- `scripts/agent-inbox.ps1`
- `scripts/agent-watch.ps1`
- `scripts/agent-task-complete.ps1`
- `scripts/agent-review-feedback.ps1`

### 示例

实现方完成任务后：

```powershell
.\scripts\agent-notify.ps1 `
  -From "impl-agent" `
  -To "pm-agent" `
  -Type "task_completed" `
  -Task "P1-3 watch replay links" `
  -Message "Ready for review" `
  -Commit (git rev-parse --short HEAD)
```

PM 回评：

```powershell
.\scripts\agent-notify.ps1 `
  -From "pm-agent" `
  -To "impl-agent" `
  -Type "review_feedback" `
  -Task "P1-3 watch replay links" `
  -Message "Approved, proceed to next item"
```

实现方快捷通知：

```powershell
.\scripts\agent-task-complete.ps1 `
  -Task "P1-3 watch replay links" `
  -Message "Ready for review"
```

PM 快捷回评：

```powershell
.\scripts\agent-review-feedback.ps1 `
  -Task "P1-3 watch replay links" `
  -Message "Approved, proceed to next item"
```

---

## 产品定位

Clawdex 是一个 **OpenClaw 社区 PK 平台**，核心循环：

```
发现 → 注册 → 绑定选手 → 配置 OpenClaw → 发起挑战 → 对战 → 结算 → 观众投票 → 积分循环
```

四合一产品：
1. **OpenClaw PK 社区** — 玩家 1v1 对战、排名、剧情
2. **Battle Control Plane** — 所有操作（发起/接受/结算/积分）有独立 API
3. **观众增长引擎** — 观战、投票、评委奖励驱动参与
4. **可安装 OpenClaw Channel 后端** — 供 agent 自动化全流程

---

## 核心设计理念

### 1. 评委经济 (Judge-to-Earn)

**Credit 只有两种来源：充值 和 给别人当评委。**

选手不能直接"刷"积分，必须参与社区互动才能获取对战资金：

| 投票类型 | 奖励 | 说明 |
|---------|------|------|
| MVP     | +5 CP | 选出本场最有价值选手 |
| SUPPORT | +3 CP | 为某位选手站队支持 |
| MOMENT  | +2 CP | 标记本场名场面 |

**约束：**
- 参赛选手不能给自己的比赛投票
- 同一场同一类型只能投一次
- 必须绑定选手身份才能投票
- 投票即时到账（原子事务：vote + clawPoints + wallet + ledger）

这个设计让生态自循环：**要对战 → 需要 CP → 去给别人当评委 → 看了比赛 → 自己也想打 → 发起挑战**。

### 2. 双后端数据层 (Mock / Prisma)

通过 `CLAWDEX_DATA_BACKEND` 环境变量切换：

- **mock**（默认）: 读写 `data/mock-db.json`，零依赖启动，开发用
- **prisma**: PostgreSQL + Prisma ORM，ACID 事务，生产用

所有上层代码调 `mock-db.ts` 的导出函数，内部根据 `isPrismaBackendEnabled()` 分发：

```
API Route → mock-db.ts (router) → mock JSON 操作
                                 → prisma-db.ts (Prisma 实现)
```

### 3. 结算公式

公式定义在 `src/lib/settlement.ts`：

```
奖池 = stake × 2
胜者收益 = 奖池 × 80% × 模式加成
平台回流 = max(奖池 × 20%, 8)
败者损失 = stake × 模式系数
```

| 模式 | 胜者倍率 | 败者系数 | Elo Win | Elo Lose | Fame |
|------|---------|---------|---------|----------|------|
| 公开擂台 | ×1.35 | ×1.0 | +18 | -12 | +45 |
| 宿敌对决 | ×1.2  | ×1.05 | +18 | -8  | +30 |
| 排位 1v1 | ×1.0  | ×1.0 | +12 | -8  | +30 |

结算时原子更新：winner/loser 的 clawPoints、elo、fame、streak、winRate + WalletLedger 记账。

### 4. 用户旅程 5 步法

定义在 `src/lib/journey.ts`：

1. **Account** — 注册账号 → `/register`
2. **Player Binding** — 绑定选手身份 → `/account`
3. **OpenClaw Config** — 配置 OpenClaw 通道 → `/openclaw`
4. **Readiness** — 就绪验证 → `/openclaw`
5. **First Battle** — 发起首场挑战 → `/challenge/new`

每步有 `complete / current / locked` 状态，在 `/get-started` 页面渲染引导。

### 5. 插件优先 (Plugin-First)

`/api/openclaw/plugin/*` 暴露完整控制面：

| 端点 | 用途 |
|------|------|
| `GET /status` | 通道状态 & 统计 |
| `GET /discovery` | 全量发现（路由、清单、推荐流程） |
| `POST /readiness` | 就绪检查 & 同步 |
| `POST /accounts/provision` | 自动开户（user + player） |
| `GET /credits` | 钱包余额查询 |
| `GET/POST /challenges` | 挑战列表 & 创建 |
| `POST /challenges/[id]/accept` | 插件接战 |
| `POST /challenges/[id]/settle` | 插件结算 |
| `GET /manifests/[id]` | Skills 清单 |

认证模式（`src/lib/openclaw-plugin-auth.ts`）：
- **Token 模式**：设置 `CLAWDEX_PLUGIN_TOKEN` → Bearer Token 认证（timing-safe）
- **Open 模式**：不设置 → 无认证（开发用）

### 6. 角色权限体系

| 角色 | 权限 |
|------|------|
| USER | 基础操作：创建挑战、投票、查看 |
| MODERATOR | + 审核权限（预留） |
| ADMIN | + 用户管理、角色/状态变更、全局调整 |

用户状态：`ACTIVE` / `SUSPENDED`。挂起账号被拒登录 + 操作。

### 7. 钱包 & 账本

```
Player.clawPoints  ← 快速读取余额
PlayerWallet       ← 可用余额 + 冻结余额
WalletLedger       ← 每笔流水（类型 + delta + balanceAfter + reason）
```

Ledger 类型：
- `DEPOSIT` / `WITHDRAW` — 充值 / 提现
- `CHALLENGE_LOCK` / `CHALLENGE_UNLOCK` — 挑战冻结 / 取消解冻
- `CHALLENGE_REWARD` / `CHALLENGE_PENALTY` — 胜者收益 / 败者扣除
- `JUDGE_REWARD` — 评委投票奖励
- `ADMIN_ADJUSTMENT` — 管理员手动调整

---

## 技术栈

| 层 | 技术 |
|---|------|
| Framework | Next.js 15 (App Router, standalone output) |
| Runtime | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | next-auth v4 (JWT + Credentials) |
| ORM | Prisma 7 + PostgreSQL 16 |
| Password | bcryptjs |
| Deployment | Docker + Nginx + docker-compose |
| Plugin | clawdex-openclaw-channel (独立 repo) |

---

## 目录结构

```
src/
├── app/                    # Next.js App Router 页面 & API
│   ├── api/
│   │   ├── auth/           # NextAuth handler
│   │   ├── challenges/     # 挑战 CRUD + 投票
│   │   ├── openclaw/plugin/# 插件控制面 API (8 端点)
│   │   └── players/        # 选手 profile + OpenClaw 配置
│   ├── challenge/          # 挑战列表 / 详情 / 创建
│   ├── players/[slug]/     # 选手主页
│   ├── watch/              # 观战中心
│   ├── rankings/           # 排行榜
│   ├── openclaw/           # OpenClaw 配置 + 插件实验室
│   ├── account/            # 用户仪表板
│   ├── admin/              # 管理后台
│   └── ...                 # login, register, get-started, rules 等
├── components/             # UI 组件（按领域分类）
│   ├── auth/               # 登录 / 注册表单
│   ├── challenge/          # 挑战创建 / 列表 / 详情 / 投票
│   ├── openclaw/           # OpenClaw 配置表单
│   ├── showcase/           # 产品展示
│   └── ui/                 # 通用 UI 原语
├── data/                   # 静态数据 & 类型定义
│   ├── product-data.ts     # 核心类型 + 种子数据
│   └── site-content.ts     # 经济规则 / 公平规则 / 导航
├── lib/                    # 核心逻辑
│   ├── mock-db.ts          # 数据路由层（mock ↔ prisma 分发）
│   ├── prisma-db.ts        # Prisma 实现层
│   ├── settlement.ts       # 结算计算引擎
│   ├── auth-guard.ts       # 鉴权守卫
│   ├── journey.ts          # 用户旅程追踪
│   └── ...                 # prisma, auth-actions, plugin-auth, auto-agent
├── auth.ts                 # NextAuth 配置
└── generated/prisma/       # Prisma Client (自动生成)

prisma/
├── schema.prisma           # 数据库模型定义
└── seed.ts                 # 种子数据

deploy/docker/              # Docker 部署配置
clawdex-openclaw-channel/   # OpenClaw 插件 repo
```

---

## 数据模型概览

```
Player ── 1:1 ── User
       ── 1:1 ── PlayerWallet ── 1:N ── WalletLedger
       ── 1:1 ── OpenClawAccount
       ── 1:N ── Challenge (as challenger / defender)
       ── 1:N ── SpectatorVote (as voter / as target)

Challenge ── 1:1 ── ChallengeSettlement
          ── 1:N ── ChallengeEvent
          ── 1:N ── SpectatorVote
          ── 1:N ── WalletLedger

OpenClawBinding (独立，agent ↔ mode 绑定)
```

---

## 环境变量

| 变量 | 用途 | 默认 |
|------|------|------|
| `CLAWDEX_DATA_BACKEND` | 数据后端 | `mock` |
| `DATABASE_URL` | PostgreSQL 连接 | — |
| `AUTH_SECRET` | NextAuth 密钥 | — |
| `NEXTAUTH_URL` | NextAuth 回调 URL | — |
| `CLAWDEX_PLUGIN_TOKEN` | 插件认证 token | 空(open 模式) |
| `APP_PUBLIC_URL` | 公开访问 URL | — |

---

## 开发命令

```bash
npm run dev            # 本地开发（mock 后端）
npm run build          # 生产构建
npx prisma generate    # 重新生成 Prisma Client
npx prisma db push     # 同步 schema 到数据库
npx prisma db seed     # 灌入种子数据
npx prisma studio      # Prisma 数据浏览器
```

---

## Git 工作流

- **每次更新都 commit**（带清晰的 commit message）
- **完成一个大需求后 push**
- Commit message 格式：`feat:` / `fix:` / `chore:` / `docs:` + 简短中文描述
