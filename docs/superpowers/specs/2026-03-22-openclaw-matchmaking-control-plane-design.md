# Clawdex OpenClaw Matchmaking Control Plane Design

## Scope

This spec defines the first implementation slice for making OpenClaw the primary user-facing battle entrypoint while Clawdex remains the source of truth for matchmaking, challenge records, wallet rules, settlement, and community replay surfaces.

The focus is intentionally narrow:

- OpenClaw-first queue and match flow
- minimal new plugin control-plane APIs
- compatibility with the existing `challenge` lifecycle
- no full lobby UI rebuild inside Clawdex yet

## Product Direction

The intended user experience is closer to Pokemon Showdown than a manual challenge board:

- users primarily stay inside OpenClaw
- they bind a Clawdex account once
- they enter matchmaking instead of creating a visible manual challenge
- Clawdex finds an opponent and creates the real challenge record only after a match is formed
- OpenClaw executes the battle and reports the outcome back to Clawdex

This keeps Clawdex important without requiring users to care about the website before they care about the battle.

## Current Context

The repository already has:

- account provisioning for OpenClaw plugin flows
- readiness checks
- plugin challenge create / accept / settle routes
- challenge wallet locking and settlement logic
- replay, rankings, player, and watch pages that already consume `challenge` records

This means the shortest path is not inventing a second battle domain. It is adding a lightweight matchmaking layer that feeds the existing `challenge` entity.

## Approaches Considered

### Approach A: Reuse manual challenge creation as matchmaking

Queue requests would create pending challenges immediately and later pair them.

Pros:

- minimal new model work

Cons:

- pollutes challenge history with abandoned queue attempts
- makes wallet locking and status transitions messy
- leaks implementation details into user-facing battle history

### Approach B: Add a small matchmaking queue layer above challenges

Queue entries are temporary. A real challenge is created only after a successful match.

Pros:

- clean mental model
- minimal disruption to settlement and replay logic
- easier cancellation and timeout handling
- keeps challenge history meaningful

Cons:

- requires one new data structure and a few new routes

### Approach C: Let OpenClaw fully own matching and only call Clawdex after a match is ready

Pros:

- simplest Clawdex API surface

Cons:

- loses single source of truth
- hard to keep fairness, Elo policy, and analytics consistent
- creates future sync problems

## Recommendation

Use Approach B.

OpenClaw remains the operational front-end, but Clawdex owns the queue state, the match decision, the challenge record, and the settlement ledger. This preserves a clean control plane without forcing users into the website.

## First Slice

The first implementation slice should stay deliberately simple.

### Included

- strong requirement that players are already provisioned and bound
- queue join / leave / status / feed plugin endpoints
- a simple server-side matchmaking rule based on `mode + readiness + Elo range`
- automatic challenge creation after a match is found
- a minimal plugin-ready confirmation endpoint
- a minimal result-report endpoint that wraps existing settlement behavior
- mock and Prisma data-layer support
- automated tests for the new queue logic

### Deferred

- websocket or push delivery
- dynamic expanding Elo windows over time
- party or friend matching
- region or latency-aware pairing
- hidden MMR or anti-smurf logic
- website-side interactive matchmaking UI

## Architecture

### Core principle

OpenClaw is the front door. Clawdex is the battle control plane.

### New domain layer

Add a lightweight matchmaking record distinct from `challenge`.

Suggested record shape:

- `id`
- `playerSlug`
- `mode`
- `status`: `queued | matched | cancelled`
- `createdAt`
- `matchedAt?`
- `cancelledAt?`
- `challengeId?`

This record is short-lived and operational. It should never replace `challenge`.

### Relationship to challenges

- queue entry is created when a player starts matchmaking
- once a compatible opponent is found, both queue entries become `matched`
- Clawdex creates one real `challenge`
- the created challenge should start in the existing accepted path as early as possible so replay and watch surfaces can continue to work with little or no structural change

For the first slice, the simplest compatible mapping is:

- create the challenge using the existing create function
- immediately accept it through the existing accept flow
- then mark it ready for OpenClaw battle start through a plugin endpoint

This is slightly mechanical internally, but it reuses wallet lock and settlement behavior instead of reimplementing them.

## Matchmaking Rules

First version matching policy:

- same `mode`
- both players must pass existing OpenClaw readiness rules
- both players must not already have an active queue entry
- Elo difference must be within a fixed configurable threshold

Recommendation for v1 threshold:

- `300` Elo

Why:

- wide enough to avoid empty queues in an early community
- narrow enough to preserve the feeling of fair competition

If no opponent is available, the user remains queued.

## Plugin API Surface

Add these endpoints under `/api/openclaw/plugin/matchmaking`:

- `POST /join`
- `POST /leave`
- `GET /status`
- `GET /feed`

Add these challenge-adjacent endpoints:

- `POST /api/openclaw/plugin/challenges/[id]/ready`
- `POST /api/openclaw/plugin/challenges/[id]/report-result`

### Endpoint intent

`join`
- validates bound player
- validates readiness
- validates enough balance for the selected stake
- creates or refreshes queue intent
- tries immediate matchmaking

`leave`
- cancels an outstanding queue entry if present

`status`
- returns current queue state and linked challenge if matched

`feed`
- returns recommended modes, queue counts, and lightweight wait estimates

`ready`
- records that OpenClaw has confirmed the battle can start
- may move an accepted challenge to `live` for the first slice

`report-result`
- validates participant relationship
- calls the existing settlement flow
- returns the latest challenge snapshot and replay link

## Data Flow

### Queue join

1. OpenClaw plugin calls `join`
2. Clawdex validates player binding, readiness, and funds
3. Clawdex inserts or updates queue state
4. Clawdex looks for the best compatible opponent in queue
5. If no match exists, response remains `queued`
6. If a match exists, Clawdex creates and accepts a real challenge
7. Response returns `matched` plus challenge metadata

### Battle start

1. OpenClaw receives matched challenge info
2. plugin calls challenge `ready`
3. Clawdex marks the challenge operationally ready for battle
4. OpenClaw starts the actual battle

### Result sync

1. OpenClaw calls `report-result`
2. Clawdex validates winner and challenge state
3. Clawdex runs existing settlement logic
4. response returns settled challenge data and replay path

## Error Handling

First slice should explicitly handle:

- player not provisioned or not bound
- player not ready
- insufficient balance
- duplicate queue join
- player already in active challenge
- no valid opponent found
- stale or cancelled queue item
- invalid winner slug
- duplicate settlement report

Responses should be operationally useful to the plugin. Avoid generic messages when a concrete reason exists.

## Testing Strategy

Test the new behavior with pure and integration-lean unit tests around the mock data layer:

- join creates a queue entry when no opponent exists
- join matches two compatible players and returns a challenge
- players outside Elo range do not match
- leave cancels a queue entry
- status returns queue or challenge state correctly
- ready transitions the matched challenge for battle start
- report-result settles a challenge through the new endpoint contract

The goal is confidence in the state transitions, not browser coverage.

## Risks And Controls

- Risk: queue records drift from challenge records
  Control: queue records only exist before and immediately after matching; challenge stays the long-lived source of truth

- Risk: acceptance logic is too coupled to manual challenge creation
  Control: reuse existing create and accept functions first, then refactor only if tests expose a real problem

- Risk: players can queue multiple times
  Control: add an explicit uniqueness rule per active player queue record

- Risk: Prisma and mock diverge
  Control: add the queue flow in `mock-db.ts` and `prisma-db.ts` together, with mirrored public functions

## Expected Outcome

After this slice:

- OpenClaw can act as the primary battle entrypoint
- users can enter a simple matchmaking flow without manual challenge browsing
- Clawdex still owns battle truth, wallet logic, ranking effects, and replay history
- the repo is positioned for a later Showdown-style lobby without throwing away the first implementation
