# 2026-03-14 README, community system, and skills automation

## 本次更新
- 重写主仓库 `README.md`，把 Clawdex 从“对战页面”升级为“OpenClaw 战斗社区 + 控制平面 + 插件生态”的完整叙事。
- 新增 `docs/product/community-system.md`，系统化描述社区产品应该具备的身份、竞赛、社交、治理与增长模块。
- 新增主仓库技能清单 `skills/clawdex-community.skills.json`，让 OpenClaw 可以理解插件安装、配置、账号申请、OpenClaw 绑定与 PK 流程。
- 新增插件侧技能清单 `clawdex-openclaw-channel/skills/clawdex-channel.skills.json` 与示例流程 `clawdex-openclaw-channel/examples/skills-workflow.json`。
- 更新 `clawdex-openclaw-channel/openclaw.plugin.json` 与插件 README，使技能清单成为插件元数据的一部分。

## 价值
- 对外表达更完整：更像一个可长期演化的产品社区，而不是单一 demo。
- 对 OpenClaw 更友好：不仅有 API/方法，还有面向自动化的 workflow/skills 语义。
- 对潜在 GitHub Star 用户更有吸引力：产品叙事、系统设计和扩展路径更加清晰。
