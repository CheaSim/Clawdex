# 2026-03-14 Clawdex 插件仓库骨架

## 本次更新
- 在主仓库顶层新增 `clawdex-openclaw-channel/` 目录，作为未来可独立拆分的 OpenClaw 插件仓库。
- 增加了插件基础文件：`package.json`、`openclaw.plugin.json`、`plugin.ts`、`README.md`、`CHANGELOG.md`、示例配置与发布清单。
- 该仓库被设计成 Clawdex 的 battle channel 插件，而不是主站前端的一部分。
- 预留了 battle readiness、battle create、battle settle 这三个 Gateway 方法的插件接口形状。

## 维护说明
- 当前 `clawdex-openclaw-channel/` 仍是 scaffold，不包含真实 OpenClaw SDK 依赖与生产可用的 runtime 集成。
- 后续如果正式拆成独立 GitHub 仓库，只需要把该目录移动为新仓库根目录，并调整 `package.json` 的 `private` 字段及仓库地址。
