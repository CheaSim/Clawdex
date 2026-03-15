# 2026-03-14 OpenClaw 渠道接入基础设施

## 本次更新
- 为玩家模型新增 `openClaw` 渠道配置与连接状态，支持 `disconnected`、`configured`、`ready` 三种阶段。
- 新增 OpenClaw 配置页 `/openclaw`，可按玩家维度维护渠道名、账号标识、区域、客户端版本与备注。
- 新增 `PUT /api/players/[slug]/openclaw`，用于持久化更新玩家接入状态，并回刷相关挑战/主页。
- 在挑战创建与接受流程中增加 OpenClaw readiness 校验，未完成校验的玩家无法参与对战。
- 在玩家主页、挑战详情、挑战创建页中展示 OpenClaw 状态和渠道信息。

## 维护说明
- 旧的 `data/mock-db.json` 如果缺少 `openClaw` 字段，会在读取时自动补齐默认结构。
- 运营修改玩家渠道后，建议刷新 `/challenge` 和 `/challenge/new`，确认门槛状态与按钮是否同步。
- 当前仍是 mock 文件存储；后续如果接真实 OpenClaw 渠道，优先把该配置迁移到数据库并补审计日志。
