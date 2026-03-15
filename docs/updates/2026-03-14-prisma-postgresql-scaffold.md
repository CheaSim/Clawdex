# 2026-03-14 Prisma + PostgreSQL scaffold

## 本次更新
- 为主仓库接入 Prisma 依赖，并新增 PostgreSQL 方向的骨架。
- 增加了 `prisma/schema.prisma`，覆盖玩家、钱包、OpenClaw 账号、挑战、结算、事件、观众投票和绑定数据模型。
- 新增 `src/lib/prisma.ts` 作为 Next.js 环境下的 Prisma Client 单例入口。
- 扩展 `package.json` 脚本，加入 `prisma:validate`、`prisma:generate`、`prisma:migrate:dev`、`prisma:migrate:deploy`、`prisma:studio` 等命令。
- 扩展 `.env.example`，加入 `DATABASE_URL` 和 `DIRECT_URL`。
- 新增 `docs/deployment/postgresql-prisma.md`，说明 40GB ECS 上的 PostgreSQL 容量规划和迁移路径。

## 维护说明
- 当前 Prisma 骨架是 non-invasive 的，系统仍然以 mock JSON 为运行时数据源。
- 下一步建议先把 `players`、`openclaw_accounts`、`challenges` 切到 Prisma，再逐步迁移钱包与结算事务逻辑。