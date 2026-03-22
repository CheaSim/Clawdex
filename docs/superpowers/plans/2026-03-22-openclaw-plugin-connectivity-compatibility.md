# OpenClaw Plugin Connectivity Compatibility Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a formal handshake, capability negotiation, compatibility routing, and structured diagnostics between the Clawdex control plane and the OpenClaw plugin.

**Architecture:** Extend the control plane discovery surface into a stable compatibility contract, then teach the plugin to route by action and capability instead of assuming specific battle endpoints. Add structured diagnostics and error classification so connectivity and downgrade behavior are explicit.

**Tech Stack:** Next.js 15 route handlers, TypeScript, mock/prisma dual backend, OpenClaw plugin TypeScript gateway methods, Node test runner with `tsx`

---

## Chunk 1: Contract Schema And Control Plane Discovery

### Task 1: Add handshake and diagnostics types

**Files:**
- Modify: `src/data/product-data.ts`
- Create: `tests/openclaw-handshake-contract.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that expect:

- a typed handshake payload shape
- capability entries with `supported`, `preferred`, `deprecated`, and `replacement`
- diagnostics checks with `id`, `status`, `message`, and `suggestion`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/openclaw-handshake-contract.test.ts`
Expected: FAIL because the contract types and builders do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add contract-oriented types for:

- protocol metadata
- capability descriptors
- compatibility metadata
- diagnostics checks
- status summaries

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/openclaw-handshake-contract.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/product-data.ts tests/openclaw-handshake-contract.test.ts
git commit -m "feat: add openclaw handshake contract types"
```

### Task 2: Upgrade discovery into a formal handshake contract

**Files:**
- Modify: `src/app/api/openclaw/plugin/discovery/route.ts`
- Modify: `src/app/api/openclaw/plugin/status/route.ts`
- Modify: `src/lib/mock-db.ts`
- Modify: `src/lib/prisma-db.ts`
- Test: `tests/openclaw-handshake-contract.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations that discovery/status return:

- `protocolVersion`
- `controlPlaneVersion`
- structured `capabilities`
- `replacementMap`
- diagnostics summary blocks

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/openclaw-handshake-contract.test.ts`
Expected: FAIL on missing fields or wrong shape.

- [ ] **Step 3: Write minimal implementation**

Update discovery/status to emit:

- handshake metadata
- compatibility metadata
- capability descriptors for manual battle, matchmaking, credits, readiness, debate
- diagnostics summary

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/openclaw-handshake-contract.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/openclaw/plugin/discovery/route.ts src/app/api/openclaw/plugin/status/route.ts src/lib/mock-db.ts src/lib/prisma-db.ts tests/openclaw-handshake-contract.test.ts
git commit -m "feat: formalize openclaw handshake discovery contract"
```

## Chunk 2: Plugin Capability Router

### Task 3: Add plugin-side contract parsing and action routing

**Files:**
- Modify: `clawdex-openclaw-channel/plugin.ts`
- Create: `clawdex-openclaw-channel/tests/compatibility-router.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests for:

- preferred matchmaking path on a platform that supports it
- fallback to legacy battle flow on a platform without matchmaking
- deprecated action detection exposing a warning
- unsupported action returning a structured unsupported result

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/compatibility-router.test.ts`
Expected: FAIL because the router does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add plugin-side helpers that:

- read the handshake contract
- resolve action-to-route mapping
- prefer capability-marked routes
- choose fallback routes when necessary

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/compatibility-router.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C clawdex-openclaw-channel add plugin.ts tests/compatibility-router.test.ts
git -C clawdex-openclaw-channel commit -m "feat: add plugin capability routing"
```

### Task 4: Route gateway methods through compatibility decisions

**Files:**
- Modify: `clawdex-openclaw-channel/plugin.ts`
- Test: `clawdex-openclaw-channel/tests/matchmaking-gateway.test.ts`
- Test: `clawdex-openclaw-channel/tests/compatibility-router.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage that gateway methods:

- use preferred matchmaking endpoints when available
- fall back to manual battle methods when contract requires it
- surface fallback mode in their response

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL in the plugin repo until gateway methods are routed through the new compatibility layer.

- [ ] **Step 3: Write minimal implementation**

Update gateway methods to:

- fetch/cache handshake data
- route through action decisions
- include compatibility warnings in responses

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd clawdex-openclaw-channel
npm test
npm run check
```

Expected:

- tests PASS
- typecheck PASS

- [ ] **Step 5: Commit**

```bash
git -C clawdex-openclaw-channel add plugin.ts tests/matchmaking-gateway.test.ts tests/compatibility-router.test.ts
git -C clawdex-openclaw-channel commit -m "feat: route plugin methods through compatibility contract"
```

## Chunk 3: Structured Diagnostics

### Task 5: Add structured error mapping on the control plane

**Files:**
- Create: `src/lib/openclaw-plugin-diagnostics.ts`
- Modify: `src/app/api/openclaw/plugin/discovery/route.ts`
- Modify: `src/app/api/openclaw/plugin/status/route.ts`
- Modify: selected plugin route handlers under `src/app/api/openclaw/plugin/`
- Test: `tests/openclaw-diagnostics.test.ts`

- [ ] **Step 1: Write the failing test**

Cover these categories:

- `NETWORK_UNREACHABLE`
- `AUTH_FAILED`
- `ENDPOINT_MISSING`
- `FEATURE_UNSUPPORTED`
- `CONFIG_INVALID`
- `UPSTREAM_5XX`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/openclaw-diagnostics.test.ts`
Expected: FAIL because diagnostics classification does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement:

- shared diagnostics builder
- shared error envelope
- check list builder for status/discovery

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/openclaw-diagnostics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/openclaw-plugin-diagnostics.ts src/app/api/openclaw/plugin/discovery/route.ts src/app/api/openclaw/plugin/status/route.ts tests/openclaw-diagnostics.test.ts
git commit -m "feat: add structured openclaw diagnostics"
```

### Task 6: Surface diagnostics in plugin status and docs

**Files:**
- Modify: `clawdex-openclaw-channel/plugin.ts`
- Modify: `clawdex-openclaw-channel/README.md`
- Test: `clawdex-openclaw-channel/tests/status-diagnostics.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that expect plugin status/docs to expose:

- connection state
- checks list
- capability availability
- recommended next actions
- fallback / deprecation warnings

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/status-diagnostics.test.ts`
Expected: FAIL because plugin status/docs do not yet expose structured diagnostics.

- [ ] **Step 3: Write minimal implementation**

Update plugin status/docs behavior to surface contract-aware diagnostics and remediation hints.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd clawdex-openclaw-channel
npm test
npm run check
```

Expected:

- tests PASS
- typecheck PASS

- [ ] **Step 5: Commit**

```bash
git -C clawdex-openclaw-channel add plugin.ts README.md tests/status-diagnostics.test.ts
git -C clawdex-openclaw-channel commit -m "feat: expose plugin diagnostics and fallback status"
```

## Chunk 4: Final Verification

### Task 7: End-to-end verification of connectivity contract

**Files:**
- Modify only as needed based on verification fixes

- [ ] **Step 1: Run main app verification**

Run:

```bash
npm test
npm run build
npx prisma validate
```

Expected:

- all tests PASS
- build PASS
- Prisma schema valid

- [ ] **Step 2: Run plugin verification**

Run:

```bash
cd clawdex-openclaw-channel
npm test
npm run check
```

Expected:

- all plugin tests PASS
- typecheck PASS

- [ ] **Step 3: Smoke-check handshake fields manually**

Run:

```bash
curl http://127.0.0.1:3000/api/openclaw/plugin/discovery
curl http://127.0.0.1:3000/api/openclaw/plugin/status
```

Expected:

- structured protocol metadata present
- capabilities present
- diagnostics present

- [ ] **Step 4: Commit final verification fixes**

```bash
git add .
git commit -m "fix: finalize plugin connectivity compatibility flow"
```
