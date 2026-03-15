# 2026-03-14 README OpenClaw 渠道定位更新

## 本次更新
- 重写 `README.md` 的产品定位，明确 Clawdex 不是单纯前端站点，而是面向 OpenClaw 的 battle channel / control plane。
- 参考公开 OpenClaw connector 的架构模式，补充了 `channel`、`bindings`、Gateway、readiness 这些核心概念在 Clawdex 中的对应关系。
- 区分了当前已实现能力与未来 connector/runtime 阶段能力，避免后续维护者误以为仓库已经具备真实 OpenClaw 插件注册能力。
- 新增概念性配置示例，帮助后续把 Clawdex 演进为真实 `clawdex-channel`。

## 维护说明
- 当前 README 中的 OpenClaw 配置片段是架构说明，不代表仓库已经存在可安装的 OpenClaw 插件。
- 后续如果开始实现真实 Connector，需要同步更新 README 中的 `Suggested Future OpenClaw Mapping`、Roadmap 和 Current Implementation Status。