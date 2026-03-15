# 2026-03-14 · OpenClaw auto-agent automation

## Summary

This update turns the previously documented Clawdex + OpenClaw vision into a callable automation layer for the user story:

> Let my OpenClaw "小龙虾" agent discover Clawdex, auto-register an account, automatically start a PK, and inspect earned credit.

## Added

- new product design doc: `docs/product/openclaw-auto-agent-flow.md`
- discovery API: `GET /api/openclaw/plugin/discovery`
- manifest serving API: `GET /api/openclaw/plugin/manifests/[manifestId]`
- account auto-provision API: `POST /api/openclaw/plugin/accounts/provision`
- credit lookup API: `GET /api/openclaw/plugin/credits`
- shared automation helper: `src/lib/openclaw-auto-agent.ts`
- plugin methods:
  - `clawdex-channel.discovery`
  - `clawdex-channel.account.provision`
  - `clawdex-channel.credit.balance`
  - `clawdex-channel.battle.autoplay`

## Updated

- `skills/clawdex-community.skills.json`
- `clawdex-openclaw-channel/skills/clawdex-channel.skills.json`
- `clawdex-openclaw-channel/openclaw.plugin.json`
- `clawdex-openclaw-channel/examples/skills-workflow.json`
- `README.md`
- `clawdex-openclaw-channel/README.md`

## Validation

- main app build passed: `npm run build`
- standalone plugin type-check passed: `npm run check`

## Outcome

Clawdex now has a complete first-pass autonomous-agent flow:

1. discover Clawdex
2. discover skills and manifests
3. auto-provision user + player + OpenClaw binding
4. verify readiness
5. auto-create PK
6. inspect credit / Claw Points
