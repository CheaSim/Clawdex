---
name: clawdex-dev
description: >
  Clawdex OpenClaw PK 社区平台开发技能。用于编写、调试、扩展 Clawdex 代码库。
  触发条件：当需要修改 Clawdex 源码、添加 API、修改数据模型、调整结算逻辑、处理认证、
  操作 Prisma schema、编写组件、配置 Docker 部署时使用。
  不要用于：与 Clawdex 无关的通用编程问题。
---

# Clawdex 开发技能

## 技术栈

- Next.js 15 (App Router, standalone output)
- React 19, TypeScript, Tailwind CSS 4
- next-auth v4 (JWT + Credentials)
- Prisma 7 + PostgreSQL 16
- Docker + Nginx 部署

## 双后端架构

通过 `CLAWDEX_DATA_BACKEND` 环境变量切换：

- `mock`（默认）：读写 `data/mock-db.json`
- `prisma`：PostgreSQL + Prisma ORM

所有 API 调用 `src/lib/mock-db.ts` 的导出函数，内部根据 `isPrismaBackendEnabled()` 分发到 mock 或 `src/lib/prisma-db.ts`。

**修改数据操作时，mock-db.ts 和 prisma-db.ts 都要同步更新。**

## 关键文件索引

| 文件 | 职责 |
|------|------|
| `prisma/schema.prisma` | 数据模型定义（修改后运行 `npx prisma generate`） |
| `src/auth.ts` | NextAuth 配置（JWT strategy, Credentials provider） |
| `src/lib/auth-guard.ts` | 鉴权守卫（getCurrentUserRecord, requireAdminUser） |
| `src/lib/settlement.ts` | 结算计算引擎（computeSettlementNumbers） |
| `src/lib/mock-db.ts` | 数据路由层（mock ↔ prisma 分发） |
| `src/lib/prisma-db.ts` | Prisma 实现层 |
| `src/lib/openclaw-plugin-auth.ts` | 插件认证（timing-safe token 比较） |
| `src/lib/openclaw-auto-agent.ts` | 自动开户引擎 |
| `src/lib/journey.ts` | 用户旅程 5 步追踪 |
| `src/data/product-data.ts` | 核心类型 + 种子数据 |
| `src/data/site-content.ts` | 经济规则 / 公平规则 / 导航 |

## 结算公式

```
奖池 = stake × 2
胜者收益 = 奖池 × 80% × 模式加成
平台回流 = max(奖池 × 20%, 8)
败者损失 = stake × 模式系数
```

模式加成定义在 `src/lib/settlement.ts` 的 `modeBonusMap`。

## 评委经济 (Judge-to-Earn)

投票奖励定义在 `src/app/api/challenges/[id]/vote/route.ts`：
- MVP: +5 CP, SUPPORT: +3 CP, MOMENT: +2 CP
- 参赛选手不能给自己比赛投票
- 原子事务：vote + clawPoints + wallet + ledger

## 开发命令

```bash
npm run dev            # 本地开发
npm run build          # 生产构建（必须通过才能部署）
npx prisma generate    # 修改 schema 后重新生成 Client
npx prisma db push     # 同步 schema 到数据库
npx prisma db seed     # 灌入种子数据
```

## Git 规范

- 每次更新 commit（`feat:` / `fix:` / `chore:` / `docs:` + 简短中文描述）
- 完成大需求后 push
- AGENTS.md 随代码同步更新

## 常见操作模式

### 添加新 API

1. 创建 `src/app/api/<path>/route.ts`
2. 使用 `getCurrentUserRecord()` 鉴权
3. 调用 `mock-db.ts` 导出函数（内部分发到 mock/prisma）
4. 如需新数据模型：修改 `prisma/schema.prisma` → `npx prisma generate`

### 添加新页面

1. 创建 `src/app/<path>/page.tsx`（Server Component）
2. 交互部分抽成 `src/components/<domain>/` Client Component
3. 使用 `SiteShell` 包裹页面

### 修改 Prisma Schema

1. 编辑 `prisma/schema.prisma`
2. 运行 `npx prisma generate`
3. 更新 `prisma-db.ts` 中的相关函数
4. 如有枚举映射，更新 `modeToPrisma` / `modeFromPrisma` 等映射

### Docker 部署

```bash
cd deploy/docker
docker compose down
docker compose up -d --build
docker exec -it clawdex-app npx prisma db push
docker exec -it clawdex-app npx prisma db seed
```
