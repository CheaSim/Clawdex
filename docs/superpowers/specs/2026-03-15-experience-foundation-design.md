# Clawdex Experience Foundation Design

> Scope note: the user explicitly authorized autonomous execution without approval checkpoints. This spec records the assumptions and recommended direction for the first sub-project in a larger improvement program.

## Program Decomposition

The full request covers multiple independent systems and should not be implemented as one undifferentiated batch:

1. Core product experience
   Main site journeys, replay/watch/player/debate cohesion, navigation, metadata, and visible polish.
2. Plugin trust surface
   OpenClaw channel usability, helper correctness, self-test reliability, and docs/tooling clarity.
3. Quality and performance
   Automated tests, reusable derivation logic, build confidence, and targeted performance cleanup.

This document defines the first sub-project only:

- Name: Experience foundation
- Goal: make the site feel like one connected product around battles, replays, debates, and player identity while introducing a real automated test foothold

## Current Context

The repository already has:

- a functioning Next.js App Router product shell
- challenge, replay, debate, watch, player, ranking, and homepage routes
- a separate OpenClaw channel plugin repository
- working production builds for the site and plugin typecheck

The main problems are product coherence and quality confidence:

- challenge-derived UI logic is duplicated across pages
- replay/watch/player flows are missing key cross-links and chronology helpers
- several TODO items remain open on the content surfaces
- automated tests are effectively absent, so regressions are caught by manual smoke checks and builds only

## Approaches Considered

### Approach A: Patch each page directly

Update each route independently to satisfy the TODO list.

Pros:

- fastest visible wins
- low upfront design work

Cons:

- duplicates sorting, filtering, and adjacency logic across pages
- makes future performance and test work harder
- increases chance of inconsistent battle states between pages

### Approach B: Add a shared challenge insights layer, then refactor pages onto it

Create a small pure helper module that derives watch feeds, replay chronology, player history, homepage replay cards, and ranking snippets from existing challenge data. Add automated tests for those helpers first, then update pages to consume them.

Pros:

- best leverage for both product and quality
- enables TDD with pure functions
- keeps changes incremental instead of requiring a full data-layer rewrite
- lowers risk of inconsistent UI behavior

Cons:

- slightly more upfront work than page patching
- does not fully solve deeper data-loading inefficiencies yet

### Approach C: Larger domain refactor with new components and server actions

Restructure major page modules, shared components, and route data access in one sweep.

Pros:

- strongest long-term architecture cleanup

Cons:

- too much scope for the first pass
- higher regression risk
- slows visible delivery

## Recommendation

Use Approach B.

It gives the highest ratio of product improvement to risk. We get a reusable derivation layer, first-class tests, and enough page refactoring to make the product feel more complete without pausing the roadmap for a large rewrite.

## First-Phase Scope

### Included

- dedupe settled matches from the `/watch` primary feed
- add richer player battle history on `/players/[slug]`
- add challenge-to-debate and debate-to-replay cross-navigation
- add replay previous/next navigation
- add homepage latest replay recommendations
- add rankings recent battle context
- add replay metadata for list and detail pages
- introduce root automated tests for shared battle-derivation helpers
- include plugin helper coverage in the same quality pass where practical

### Deferred

- major visual redesign of the whole site
- full plugin architectural split from `plugin.ts`
- end-to-end browser tests
- database query optimization beyond what the first helper layer needs
- bundle-level performance profiling and caching strategy

## Architecture

### Shared derivation layer

Add a pure helper module in `src/lib/` responsible for transforming `MatchListing[]` into view models needed by content surfaces. This module should not read files, call Prisma, or depend on React.

Responsibilities:

- watch feed sections
- settled replay subsets
- player battle history rows
- previous/next challenge lookup
- latest replay cards
- per-player latest battle summary for rankings

This creates one source of truth for battle chronology and presentation-oriented aggregation.

### Page integration

Keep existing page routes server-rendered, but replace inline filtering/sorting logic with helper calls. Pages stay responsible for:

- fetching raw entities
- building player maps
- rendering route-specific layout

Helpers own:

- ordering
- deduplication
- result-state derivation
- adjacent navigation decisions

### Plugin quality touchpoint

The plugin already exposes a useful pure helper, `resolveAgentIdByBindings`. Instead of attempting a risky plugin refactor in this phase, we cover its core binding-resolution behavior with tests as part of the shared quality foundation.

## Data Flow

1. Pages fetch `listChallenges()`, `listPlayers()`, and related debate data as they do now.
2. Pages pass raw challenge arrays into shared pure helper functions.
3. Helpers return stable derived collections.
4. Pages map slugs to players locally and render richer navigation and summaries.

This keeps backend contracts unchanged while improving product behavior.

## Testing Strategy

Introduce a lightweight root test runner for pure TypeScript logic.

Primary targets:

- watch feed deduplication
- replay adjacency ordering
- player history result derivation
- homepage latest replay selection
- rankings recent battle selection
- plugin binding resolution

The test suite should focus on real inputs and outputs, not mocked UI internals.

## Risks and Controls

- Risk: page behavior drifts from existing expectations
  Control: centralize derivation logic and test the shared helpers first

- Risk: replay adjacency behaves unexpectedly for unsettled battles
  Control: define ordering explicitly by activity timestamp and test edge cases

- Risk: plugin coverage remains shallow
  Control: start with pure helper tests in this phase, reserve transport and self-test flow expansion for the next plugin-focused phase

## Expected Outcome

After this phase:

- the watch, replay, player, challenge, and debate surfaces will feel linked together
- the TODO items around replay/player/debate navigation will largely be closed
- the project will have a reusable battle-derivation module instead of page-local duplication
- the repo will have a real automated test entry point, not just `build` and manual smoke checks
