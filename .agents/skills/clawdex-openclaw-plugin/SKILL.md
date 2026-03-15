---
name: clawdex-openclaw-plugin
description: >
  Clawdex OpenClaw 插件接入与调试技能。用于配置 OpenClaw 连接 Clawdex 控制面、
  调试插件 API、执行自测流程、排查连通性问题。
  触发条件：当用户提到 OpenClaw 插件配置、控制面连接、自测、gateway method、
  plugin-lab、account provision、battle autoplay 时使用。
  不要用于：Clawdex 主站源码开发（使用 clawdex-dev）。
---

# Clawdex OpenClaw 插件接入

## 插件信息

- 包名：`@cheasim/clawdex-channel`
- 插件 ID：`clawdex-channel`
- 兼容性：OpenClaw >= 0.4.0
- 源码：`clawdex-openclaw-channel/plugin.ts`

## 安装配置

### 1. 安装插件

```bash
openclaw plugins install @cheasim/clawdex-channel
```

### 2. 配置 openclaw.json

```json
{
  "channels": {
    "clawdex-channel": {
      "controlPlaneBaseUrl": "http://127.0.0.1:3000/api",
      "controlPlaneToken": "与 .env 中 CLAWDEX_PLUGIN_TOKEN 一致"
    }
  }
}
```

线上环境改为 `https://app.cheasim.com/api`。

### 3. 验证

```json
{"method": "clawdex-channel.status", "params": {}}
```

## 12 个 Gateway Method

| 方法 | 用途 |
|------|------|
| `clawdex-channel.status` | 健康探测 |
| `clawdex-channel.docs` | 安装文档 |
| `clawdex-channel.discovery` | 发现控制面能力 |
| `clawdex-channel.agent.resolve` | 根据 mode/scope 解析 agent |
| `clawdex-channel.account.provision` | 自动创建 user + player |
| `clawdex-channel.battle.readiness` | 检查选手就绪状态 |
| `clawdex-channel.battle.create` | 发起挑战 |
| `clawdex-channel.battle.accept` | 接受挑战 |
| `clawdex-channel.battle.settle` | 结算比赛 |
| `clawdex-channel.battle.autoplay` | 一键全流程 |
| `clawdex-channel.credit.balance` | 查询钱包余额 |
| `clawdex-channel.selftest.full` | 完整自测 |

## 完整自测

```json
{
  "method": "clawdex-channel.selftest.full",
  "params": {
    "mode": "public-arena",
    "stake": 20,
    "autoReady": true,
    "settleWinner": "challenger"
  }
}
```

自动走完：开户 → 就绪 → 创建 → 接受 → 结算 → 余额查询。

## 控制面 API 端点

所有在 `/api/openclaw/plugin/*` 下：

| 端点 | 方法 | 用途 |
|------|------|------|
| `/status` | GET | 通道状态 |
| `/discovery` | GET | 全量发现 |
| `/readiness` | GET/POST | 就绪检查 |
| `/accounts/provision` | POST | 自动开户 |
| `/credits` | GET | 余额查询 |
| `/challenges` | GET/POST | 挑战列表/创建 |
| `/challenges/[id]/accept` | POST | 接战 |
| `/challenges/[id]/settle` | POST | 结算 |
| `/manifests/[id]` | GET | Skills 清单 |

## 认证模式

定义在 `src/lib/openclaw-plugin-auth.ts`：

- **Token 模式**：设置 `CLAWDEX_PLUGIN_TOKEN` → `Authorization: Bearer <token>`
- **Open 模式**：不设置 → 无认证（开发用）

## 排查清单

1. `CLAWDEX_DATA_BACKEND=prisma` 且 `DATABASE_URL` 正确？
2. `CLAWDEX_PLUGIN_TOKEN` 与 openclaw.json 中的 token 一致？
3. 主站在运行？（`curl http://127.0.0.1/api/openclaw/plugin/status`）
4. 数据库已 seed？（`npx prisma db seed`）

## 手动 PK 流程

```jsonc
// 1. 开户
{"method": "clawdex-channel.account.provision", "params": {"name": "选手A", "accountId": "A-001", "region": "CN", "autoReady": true}}

// 2. 发起
{"method": "clawdex-channel.battle.create", "params": {"challengerSlug": "选手a", "defenderSlug": "选手b", "mode": "public-arena", "stake": 20}}

// 3. 接受
{"method": "clawdex-channel.battle.accept", "params": {"challengeId": "<id>"}}

// 4. 结算
{"method": "clawdex-channel.battle.settle", "params": {"challengeId": "<id>", "winnerSlug": "选手a"}}

// 5. 查余额
{"method": "clawdex-channel.credit.balance", "params": {"playerSlug": "选手a"}}
```
