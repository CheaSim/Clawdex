# 2026-03-14 Local Prisma-ready stack

## 本次更新
- 新增 `CLAWDEX_DATA_BACKEND` 开关，允许在 `mock` 和 `prisma` 两个数据后端之间切换。
- 增加了 Prisma 数据层实现 `src/lib/prisma-db.ts`，覆盖玩家、挑战、OpenClaw 接入、插件 accept / settle 等核心读取与写入能力。
- 增加 `prisma/seed.ts`，可将现有 seed 数据写入 PostgreSQL。
- 新增 `/database` 页面，便于本地检查当前数据库后端、连接健康度和基础数据数量。
- `deploy/docker/docker-compose.yml` 新增 PostgreSQL 服务，使本地测试可以一键带数据库启动。

## 维护说明
- 当前仍保留 mock JSON 流程，默认 `CLAWDEX_DATA_BACKEND=mock`，避免无数据库时阻塞开发。
- 当切到 `prisma` 时，请先执行 `npm run prisma:db:push` 与 `npm run prisma:seed`。
- 下一阶段可以继续把钱包流水和结算一致性逻辑从 mock 写法进一步强化为 PostgreSQL 事务。