# Experience Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Clawdex's watch, replay, player, debate, and rankings surfaces behave like one connected product while adding a real automated testing foothold.

**Architecture:** Add a pure shared challenge-derivation module under `src/lib/`, cover it with root automated tests first, then refactor the affected pages to consume those helpers. Keep backend contracts unchanged and use the same test foundation to cover one important plugin helper.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing mock/prisma routing layer, OpenClaw plugin TypeScript package

---

## Chunk 1: Test Foundation And Shared Derivations

### Task 1: Add Root Test Runner

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write the failing test entry expectation**

Create the first spec file that imports a not-yet-created helper module so the suite fails on missing module resolution.

```ts
import { describe, expect, it } from "vitest";
import { getWatchFeedSections } from "@/lib/challenge-insights";

describe("challenge insights", () => {
  it("exposes watch feed helpers", () => {
    expect(typeof getWatchFeedSections).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL because `@/lib/challenge-insights` does not exist yet.

- [ ] **Step 3: Add test runner plumbing**

Add:

- `test` and `test:run` scripts to root `package.json`
- `vitest` and `vite-tsconfig-paths` dev dependencies
- a `vitest.config.ts` using `vite-tsconfig-paths` and `environment: "node"`

- [ ] **Step 4: Run test to verify module-not-found failure still occurs under the new runner**

Run: `npm test -- --run`
Expected: FAIL for missing helper module, proving the runner is wired correctly.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add root vitest harness"
```

### Task 2: Add Shared Challenge Insight Helpers

**Files:**
- Create: `src/lib/challenge-insights.ts`
- Create: `tests/challenge-insights.test.ts`

- [ ] **Step 1: Write failing behavior tests**

Cover these behaviors with one focused test each:

- watch feed excludes settled matches from the primary list
- player history marks win/loss/in-progress correctly and links settled matches to replay
- adjacent challenges resolve previous and next by descending activity timestamp
- latest replay cards only include settled matches
- rankings recent battle summaries return the latest challenge per player

Example shape:

```ts
it("keeps settled matches out of the watch primary feed", () => {
  const result = getWatchFeedSections(challenges);
  expect(result.primaryMatches.map((item) => item.id)).toEqual(["live-1", "accepted-1"]);
  expect(result.recentSettled.map((item) => item.id)).toEqual(["settled-2", "settled-1"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/challenge-insights.test.ts`
Expected: FAIL because helper implementations do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement pure helpers in `src/lib/challenge-insights.ts` for:

- activity timestamp resolution
- watch sections
- player history rows
- adjacent challenge lookup
- latest replay cards
- latest player battle summary map

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/challenge-insights.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor**

Refine names and keep output types small and explicit if the initial implementation feels muddy.

- [ ] **Step 6: Commit**

```bash
git add src/lib/challenge-insights.ts tests/challenge-insights.test.ts
git commit -m "test: cover shared challenge insight helpers"
```

## Chunk 2: Main Site Experience Pages

### Task 3: Refactor Watch, Home, Rankings, Player, And Replay Pages Onto Shared Helpers

**Files:**
- Modify: `src/app/watch/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/rankings/page.tsx`
- Modify: `src/app/replay/page.tsx`
- Modify: `src/app/replay/[id]/page.tsx`
- Modify: `src/app/players/[slug]/page.tsx`

- [ ] **Step 1: Write failing tests for any new helper behavior needed by pages**

If page work needs extra derivation helpers beyond Task 2, add those tests first in `tests/challenge-insights.test.ts`.

- [ ] **Step 2: Run the focused test file to verify red**

Run: `npm test -- --run tests/challenge-insights.test.ts`
Expected: FAIL on the newly added case.

- [ ] **Step 3: Implement minimal helper additions**

Extend `src/lib/challenge-insights.ts` only as needed for:

- homepage latest replay cards
- rankings recent battle summaries
- replay previous/next links

- [ ] **Step 4: Update pages to consume the helpers**

Page requirements:

- `/watch`: use `primaryMatches` plus separate `recentSettled` highlights
- `/`: add latest replay recommendation section
- `/rankings`: show a recent battle detail for each highlighted player
- `/players/[slug]`: replace the generic related matches block with battle history rows
- `/replay`: keep filters but lean on shared settled/live subsets
- `/replay/[id]`: add previous/next navigation using helper output

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test -- --run tests/challenge-insights.test.ts
npm run build
```

Expected:

- tests PASS
- Next.js build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/app/watch/page.tsx src/app/page.tsx src/app/rankings/page.tsx src/app/replay/page.tsx src/app/replay/[id]/page.tsx src/app/players/[slug]/page.tsx src/lib/challenge-insights.ts tests/challenge-insights.test.ts
git commit -m "feat: connect replay and player experience surfaces"
```

### Task 4: Add Debate And Challenge Cross-Navigation Plus Replay Metadata

**Files:**
- Modify: `src/app/challenge/[id]/page.tsx`
- Modify: `src/app/debate/[id]/page.tsx`
- Modify: `src/app/replay/page.tsx`
- Modify: `src/app/replay/[id]/page.tsx`

- [ ] **Step 1: Write failing tests for any new helper behavior**

Only add tests if metadata text or navigation depends on a new pure helper. If not, skip helper tests and keep this task page-only.

- [ ] **Step 2: Implement page changes**

Requirements:

- `/challenge/[id]`: show a debate entry card when a related debate exists
- `/debate/[id]`: add replay breadcrumb/back nav and a replay CTA at the bottom
- `/replay` and `/replay/[id]`: export metadata / `generateMetadata`

- [ ] **Step 3: Run build verification**

Run: `npm run build`
Expected: PASS with route generation including replay pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/challenge/[id]/page.tsx src/app/debate/[id]/page.tsx src/app/replay/page.tsx src/app/replay/[id]/page.tsx
git commit -m "feat: improve debate replay navigation and metadata"
```

## Chunk 3: Plugin Coverage And Final Verification

### Task 5: Add Plugin Helper Coverage

**Files:**
- Create: `tests/clawdex-plugin-bindings.test.ts`

- [ ] **Step 1: Write failing plugin helper tests**

Test `resolveAgentIdByBindings` for:

- exact mode match
- wildcard match
- default agent fallback
- ranked fallback when no binding exists

Example:

```ts
it("prefers an exact binding over the fallback agent", () => {
  expect(resolveAgentIdByBindings(cfg, { mode: "public-arena" })).toBe("arena-agent");
});
```

- [ ] **Step 2: Run test to verify it fails if expectations do not match current behavior**

Run: `npm test -- --run tests/clawdex-plugin-bindings.test.ts`
Expected: either FAIL on expectation mismatch or PASS if current behavior already satisfies the spec. If it passes immediately, adjust the test set so it covers a missing edge case before any production change.

- [ ] **Step 3: Make the minimal production change only if a failing test proves a gap**

Potential file:

- Modify: `clawdex-openclaw-channel/plugin.ts`

If no production change is required, keep this as a coverage-only task.

- [ ] **Step 4: Run full focused suite**

Run:

```bash
npm test -- --run
npm run build
cd clawdex-openclaw-channel && npm run check
```

Expected:

- all Vitest tests PASS
- site build PASS
- plugin typecheck PASS

- [ ] **Step 5: Commit**

```bash
git add tests/clawdex-plugin-bindings.test.ts clawdex-openclaw-channel/plugin.ts
git commit -m "test: cover plugin binding resolution"
```

## Execution Notes

- Keep page refactors narrow and data-contract compatible.
- Prefer helper extraction over adding more inline page conditionals.
- Do not refactor the plugin broadly in this phase.
- Use fresh verification before any completion claim.

Plan complete and saved to `docs/superpowers/plans/2026-03-15-experience-foundation.md`. Ready to execute.
