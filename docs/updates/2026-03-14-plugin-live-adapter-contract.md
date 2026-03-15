# 2026-03-14 插件真实 Adapter 合约接通

## 本次更新
- 为主站新增 `/api/openclaw/plugin/*` control-plane API，包含状态探测、玩家 readiness、挑战创建、结算回写。
- 新增 `CLAWDEX_PLUGIN_TOKEN` 环境变量，用于保护插件到 Clawdex 主站的 API 调用。
- 将 `clawdex-openclaw-channel` 从 placeholder 插件升级为真实 HTTP adapter：网关方法已能调用主站 API，而不是只返回占位结果。
- 新增插件侧的 `battle.accept` 能力，并补上主站 `/api/openclaw/plugin/challenges/[id]/accept` 对应路由。
- 新增第一版 bindings 解析与 `agent.resolve` 方法，支持按 mode / scope / peer 上下文路由 agent。
- 扩展挑战数据结构，支持记录 `winnerSlug`、`settledAt`、`settlementSummary`、`sourceChannel` 等回写信息。
- 插件包元数据已升级到更接近 npm 发布状态，包含 `publishConfig`、仓库地址、`prepublishOnly` 检查与 Node 版本要求。

## 维护说明
- 当前插件仍未集成真实 OpenClaw SDK runtime，但已经具备“插件 → Clawdex control plane”的第一条真实链路。
- 生产部署时建议为主站配置 `CLAWDEX_PLUGIN_TOKEN`，并在插件配置中同步设置 `controlPlaneToken`。
- 下一阶段最重要的是把当前轻量 bindings 解析器替换成更完整的 OpenClaw config/runtime 绑定机制，并补自动化测试。
