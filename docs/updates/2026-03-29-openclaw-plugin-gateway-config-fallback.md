# 2026-03-29 OpenClaw 插件 gateway 配置回退修复

## 背景

在 `openclaw` CLI、gateway 与 `clawdex-channel` 插件重新安装完成后，HTTP 直连控制面自测已经通过，但通过 OpenClaw runtime 调插件 gateway methods 仍存在异常：

- `openclaw gateway call clawdex-channel.docs --json` 返回 `configured: false`
- `openclaw gateway call clawdex-channel.status --json` 返回 `GatewayClientRequestError: unknown error`
- `openclaw gateway call clawdex-channel.selftest.quick --json` 返回 `GatewayClientRequestError: unknown error`

这说明插件已经被 OpenClaw 加载，但运行时方法调用链路与直接 HTTP 自测链路存在配置读取差异。

## 根因

问题不在 Clawdex 控制面 API，也不在插件安装本身，而在插件的 gateway method 配置读取方式：

- `clawdex-openclaw-channel/plugin.ts` 中多个 `registerGatewayMethod` handler 直接从 handler 参数里读取 `cfg`
- OpenClaw 的 gateway handler 实际上下文并不会稳定提供这个 `cfg` 字段
- 结果是插件在 runtime 中执行 `getConfig(cfg)` 时读到的是空对象
- `docs` 因此误判为 `configured: false`
- `status`、`selftest.quick`、`selftest.full` 随后因为拿不到 `controlPlaneBaseUrl` 而失败

换句话说，插件此前兼容了“静态配置对象”与“局部 channel 配置对象”，但没有真正兼容 OpenClaw runtime 的 gateway method 执行环境。

## 本次优化

### 1. 补齐运行时配置回退链

在 `clawdex-openclaw-channel/plugin.ts` 中新增运行时配置解析逻辑，按以下顺序取配置：

1. 优先使用 handler 显式传入的 `cfg`
2. 若缺失，则回退到插件注册期可获得的 root config
3. 若仍缺失，则从 OpenClaw runtime 动态读取当前配置快照
   - `getRuntimeConfigSnapshot()`
   - `loadConfig()`

这样可以覆盖：

- 全局 root config 调用
- 局部 channel config 调用
- OpenClaw gateway method 的真实运行态调用

### 2. 保持插件仓库的独立可检查性

由于 `clawdex-openclaw-channel` 作为独立插件仓库并不直接声明 `openclaw/plugin-sdk/config-runtime` 的类型依赖，本次修复没有使用静态导入，而是改为运行时动态加载，以保证：

- `npm run check` 仍可通过
- 单独发布插件时不引入额外 TypeScript 解析错误

### 3. 补充回归测试

主仓测试 `tests/clawdex-plugin-bindings.test.ts` 新增了配置读取相关覆盖：

- 从完整 OpenClaw root config 读取
- 从局部 channel config 读取
- 在 gateway method 无 `cfg` 时回退到 root config

## 验证结果

修复后，以下检查已通过：

```bash
node --import tsx --test tests/clawdex-plugin-bindings.test.ts
cd clawdex-openclaw-channel && npm run check
openclaw gateway call clawdex-channel.docs --json
openclaw gateway call clawdex-channel.status --json
openclaw gateway call clawdex-channel.selftest.quick --json
openclaw gateway call clawdex-channel.selftest.full --json
```

关键结果：

- `docs.configured` 由 `false` 变为 `true`
- `status.ok` 为 `true`
- `selftest.quick` 通过
- `selftest.full` 完整通过：
  - discovery
  - provision challenger / defender
  - readiness
  - create battle
  - accept battle
  - settle battle
  - credit snapshot

## 影响

本次修复之后：

- `clawdex-channel` 的 OpenClaw runtime 调用链与 HTTP 自测链一致
- `clawdex-channel.docs` 能正确反映插件配置状态
- 插件不再依赖 gateway handler 是否注入 `cfg`
- 后续排查可以优先区分“插件未加载”和“控制面不可达”两类问题，而不是被配置读取误判干扰

## 相关提交

- 主仓测试提交：`843820e`
- 插件仓修复提交：`056eff9`
