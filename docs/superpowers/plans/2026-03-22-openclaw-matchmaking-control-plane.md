# OpenClaw Matchmaking Control Plane Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal OpenClaw-first matchmaking flow that creates and settles real Clawdex challenges through new plugin control-plane APIs.

**Architecture:** Introduce a lightweight matchmaking queue layer above the existing challenge lifecycle. OpenClaw drives queue actions through plugin endpoints, while Clawdex matches players, creates and accepts challenges, and reuses the current settlement pipeline.

**Tech Stack:** Next.js 15 App Router, TypeScript, existing mock/prisma dual backend, Next.js route handlers, Node test runner with `tsx`

---

## Chunk 1: Queue Model And Tests

### Task 1: Add queue domain types

**Files:**
- Modify: `src/data/product-data.ts`

- [ ] Step 1: Add `MatchmakingStatus`, `MatchmakingQueueEntry`, and request payload types.
- [ ] Step 2: Export response-friendly types for queue status and feed summaries.
- [ ] Step 3: Keep the types additive and compatible with existing challenge code.
- [ ] Step 4: Commit.

### Task 2: Write failing queue tests

**Files:**
- Create: `tests/openclaw-matchmaking.test.ts`

- [ ] Step 1: Add a test for queue join without available opponent.
- [ ] Step 2: Add a test for successful match creation within Elo threshold.
- [ ] Step 3: Add a test for mismatch outside Elo threshold.
- [ ] Step 4: Add a test for queue leave.
- [ ] Step 5: Add a test for challenge ready and result reporting.
- [ ] Step 6: Run `npm test -- tests/openclaw-matchmaking.test.ts` and verify failure.
- [ ] Step 7: Commit.

## Chunk 2: Data Layer

### Task 3: Extend mock backend

**Files:**
- Modify: `src/lib/mock-db.ts`
- Modify: `data/mock-db.json` only if a shape migration is required

- [ ] Step 1: Add queue storage initialization and normalization.
- [ ] Step 2: Implement `joinMatchmakingQueueRecord`.
- [ ] Step 3: Implement `leaveMatchmakingQueueRecord`.
- [ ] Step 4: Implement `getMatchmakingStatusRecord`.
- [ ] Step 5: Implement `getMatchmakingFeedRecord`.
- [ ] Step 6: Implement `markChallengeReadyFromPluginRecord`.
- [ ] Step 7: Implement `reportChallengeResultFromPluginRecord`.
- [ ] Step 8: Run the focused test file and make it pass under the mock backend.
- [ ] Step 9: Commit.

### Task 4: Mirror the queue API in Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma-db.ts`

- [ ] Step 1: Add Prisma model(s) for matchmaking queue entries with clear lifecycle fields.
- [ ] Step 2: Run `npx prisma generate`.
- [ ] Step 3: Implement Prisma equivalents for the new public mock-db functions.
- [ ] Step 4: Keep function signatures aligned with `mock-db.ts`.
- [ ] Step 5: Run relevant tests and Prisma validation.
- [ ] Step 6: Commit.

## Chunk 3: Plugin Routes

### Task 5: Add matchmaking plugin route handlers

**Files:**
- Create: `src/app/api/openclaw/plugin/matchmaking/join/route.ts`
- Create: `src/app/api/openclaw/plugin/matchmaking/leave/route.ts`
- Create: `src/app/api/openclaw/plugin/matchmaking/status/route.ts`
- Create: `src/app/api/openclaw/plugin/matchmaking/feed/route.ts`

- [ ] Step 1: Wire `join` to the new queue function.
- [ ] Step 2: Wire `leave` to the leave function.
- [ ] Step 3: Wire `status` to the status function.
- [ ] Step 4: Wire `feed` to the feed function.
- [ ] Step 5: Revalidate affected challenge and player paths only where needed.
- [ ] Step 6: Commit.

### Task 6: Add challenge operation route handlers

**Files:**
- Create: `src/app/api/openclaw/plugin/challenges/[id]/ready/route.ts`
- Create: `src/app/api/openclaw/plugin/challenges/[id]/report-result/route.ts`

- [ ] Step 1: Add the `ready` route and call the data-layer ready function.
- [ ] Step 2: Add the `report-result` route and call the new result-report wrapper.
- [ ] Step 3: Return challenge snapshot plus replay link where applicable.
- [ ] Step 4: Commit.

## Chunk 4: Discovery And Verification

### Task 7: Update plugin discovery contract

**Files:**
- Modify: `src/app/api/openclaw/plugin/discovery/route.ts`

- [ ] Step 1: Add the new matchmaking routes to the discovery response.
- [ ] Step 2: Update recommended flow to include queue-based matching.
- [ ] Step 3: Keep old challenge routes visible for backwards compatibility.
- [ ] Step 4: Commit.

### Task 8: Final verification

**Files:**
- Modify only as needed based on verification fixes

- [ ] Step 1: Run `npm test`.
- [ ] Step 2: Run `npm run build`.
- [ ] Step 3: Run `npx prisma validate`.
- [ ] Step 4: Fix any regressions.
- [ ] Step 5: Commit the final implementation changes.
