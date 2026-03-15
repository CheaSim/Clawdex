# Clawdex OpenClaw channel test plan

This document defines a practical testing strategy for the first real adapter path between:

- the main Clawdex control plane
- the standalone `clawdex-openclaw-channel` plugin repository

## Goals

We want confidence in four layers:

1. control-plane API correctness
2. plugin adapter correctness
3. contract compatibility between both sides
4. operator-friendly end-to-end validation

## Test layers

### 1. Main app build validation

Purpose:

- catch route/type regressions quickly

Command:

```bash
npm run build
```

Pass criteria:

- all `/api/openclaw/plugin/*` routes compile
- challenge and player routes still build

### 2. Plugin type validation

Purpose:

- catch adapter signature drift in the standalone plugin repo

Command:

```bash
./node_modules/.bin/tsc -p ./clawdex-openclaw-channel/tsconfig.json --noEmit
```

Pass criteria:

- `plugin.ts` has no type errors
- docs/config changes do not break package metadata assumptions

### 3. Control-plane API contract checks

Purpose:

- validate the main app endpoints that the plugin depends on

Endpoints to verify:

- `GET /api/openclaw/plugin/status`
- `GET /api/openclaw/plugin/readiness?playerSlug=frostclaw`
- `POST /api/openclaw/plugin/challenges`
- `POST /api/openclaw/plugin/challenges/:id/accept`
- `POST /api/openclaw/plugin/challenges/:id/settle`

Recommended manual checks:

1. Call `status` and confirm the channel name and auth mode.
2. Call `readiness` for a ready player and a disconnected player.
3. Create a challenge through the plugin API.
4. Accept that challenge through the plugin API.
5. Settle that challenge through the plugin API.
6. Verify challenge state changed in the UI and persisted in `data/mock-db.json`.

### 4. Plugin method contract checks

Purpose:

- verify that plugin methods wrap the correct control-plane endpoints

Methods to cover:

- `clawdex-channel.status`
- `clawdex-channel.agent.resolve`
- `clawdex-channel.battle.readiness`
- `clawdex-channel.battle.create`
- `clawdex-channel.battle.accept`
- `clawdex-channel.battle.settle`

Recommended automated approach:

- add a future lightweight test harness that mocks `fetch`
- assert request path, HTTP method, headers, and body
- assert error propagation for `401`, `404`, and validation errors

### 5. Bindings resolution checks

Purpose:

- ensure the plugin chooses the expected `agentId`

Recommended cases:

1. exact mode match → returns mode-specific agent
2. peer kind `group` wildcard → returns group agent
3. explicit `agentId` in method params → overrides bindings
4. no bindings match → falls back to `defaultAgentId`
5. no bindings and no `defaultAgentId` → falls back to built-in default

## Suggested manual scenario set

### Scenario A: happy path

1. ensure `frostclaw` and `nightpaw` are OpenClaw-ready
2. create a challenge via plugin API
3. accept the challenge via plugin API
4. settle the challenge via plugin API
5. confirm the challenge detail page reflects acceptance + settlement fields

### Scenario B: readiness block

1. switch one player's OpenClaw status to `configured`
2. call plugin `battle.create`
3. verify the control plane rejects creation

### Scenario C: token enforcement

1. set `CLAWDEX_PLUGIN_TOKEN`
2. call plugin endpoint without token
3. expect `401`
4. call again with `Authorization: Bearer <token>`
5. expect success

### Scenario D: routing sanity

1. configure bindings for `public-arena`, `ranked-1v1`, and `group`
2. call `clawdex-channel.agent.resolve` with different payloads
3. verify expected `resolvedAgentId`

## Automation roadmap

### Phase 1

- keep `npm run build` for the app
- keep `tsc --noEmit` for the plugin
- use manual API checks for contract validation

### Phase 2

- add plugin unit tests around `fetch` mocking and bindings resolution
- add API route tests for `/api/openclaw/plugin/*`

### Phase 3

- add end-to-end test flow that creates → accepts → settles a challenge automatically
- add CI job covering both the app build and plugin package checks

## Minimum release gate

Before shipping the first public plugin release, require:

- app build passes
- plugin type check passes
- manual happy-path scenario passes
- token enforcement scenario passes
- bindings resolution sanity passes