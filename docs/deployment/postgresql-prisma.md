# PostgreSQL + Prisma rollout for Clawdex

This document defines the recommended PostgreSQL design for Clawdex and explains how to use Prisma as the migration path away from `data/mock-db.json`.

## Recommendation

Use:

- PostgreSQL as the primary transactional database
- Prisma as the schema, migration, and type-safe access layer
- Redis later for cache, ranking hot paths, and short-lived battle coordination

For the current stage of Clawdex, PostgreSQL is the right choice because challenge creation, acceptance, wallet locking, readiness gating, and settlement are all strong-consistency flows.

## Why PostgreSQL fits this product

Clawdex is no longer a simple content site. The core domain is transactional:

- players have battle eligibility
- wallets lock value during challenge creation
- defenders accept and pools change state
- OpenClaw plugin callbacks update battle lifecycle
- settlements must be persisted safely

This is a much better fit for PostgreSQL than a document-first database.

## Prisma scaffold added to the repo

The project now includes:

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/lib/prisma.ts`
- package scripts for `prisma validate`, `generate`, `migrate`, and `studio`
- `.env.example` entries for `DATABASE_URL` and `DIRECT_URL`

This scaffold is intentionally non-invasive: the app still uses the mock JSON database today, while Prisma becomes the next migration step.

## Proposed data model

The Prisma schema now covers the first real relational backbone:

- `Player`
- `PlayerWallet`
- `WalletLedger`
- `OpenClawAccount`
- `OpenClawBinding`
- `Challenge`
- `ChallengeSettlement`
- `ChallengeEvent`
- `SpectatorVote`

### Why this shape

- `Player` stores product identity and growth metrics
- `PlayerWallet` + `WalletLedger` separate balance snapshot from auditable financial history
- `OpenClawAccount` stores per-player channel readiness and account metadata
- `OpenClawBinding` stores future routing/bindings data for the plugin layer
- `Challenge` stores the main battle object
- `ChallengeSettlement` stores final outcome payloads cleanly instead of overloading the challenge row
- `ChallengeEvent` creates an append-only history useful for audits, debugging, and feeds
- `SpectatorVote` gives a place for audience scoring and later ranking signals

## ECS 40GB storage guidance

If your ECS instance only has **40GB total disk**, you can still run the first PostgreSQL deployment on the same machine, but you need to be conservative.

### Recommended 40GB budget

- 8GB to 10GB: Ubuntu + system packages + swap/log headroom
- 6GB to 8GB: Docker images / build cache / Node app artifacts
- 10GB to 12GB: PostgreSQL data volume for MVP stage
- 4GB to 6GB: PostgreSQL WAL / temporary growth buffer
- 4GB to 6GB: backup exports / dumps
- 4GB to 6GB: safety margin

### Practical recommendation

For MVP:

- app + nginx + PostgreSQL on the same ECS host is acceptable
- keep the database volume capped operationally around **10GB to 12GB usable**
- prune old Docker images regularly
- ship app logs carefully and avoid unbounded local log growth

For scale-up:

- move PostgreSQL to Alibaba Cloud RDS as soon as battle volume and event logs start to grow materially

## Suggested PostgreSQL deployment choices

### Option A: same ECS host

Good for:

- early product validation
- low write volume
- cheapest setup

Trade-offs:

- app and DB compete for the same 40GB disk
- less fault isolation
- backup discipline becomes critical

### Option B: Alibaba Cloud RDS PostgreSQL

Good for:

- production reliability
- easier backup and restore
- cleaner scaling path

Trade-offs:

- more monthly cost
- slightly more ops configuration up front

If budget allows, RDS is the better production destination.

## Environment variables

Use values like this:

```dotenv
DATABASE_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
DIRECT_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
```

Notes:

- `DATABASE_URL` is the normal Prisma runtime connection string
- `DIRECT_URL` is reserved in case you later separate runtime and migration connections

## Prisma 7 note

This scaffold targets Prisma ORM 7 behavior:

- connection URLs live in `prisma.config.ts`, not in `schema.prisma`
- the client is generated into `src/generated/prisma`
- the runtime client uses PostgreSQL via the `@prisma/adapter-pg` adapter

## Suggested migration plan

### Phase 1: schema ready, app still mock-backed

- keep `mock-db.ts` as the active data source
- validate Prisma schema and generate the client
- prepare PostgreSQL locally or on ECS

### Phase 2: dual-write or admin-only migration scripts

- move `players`
- move `openclaw_accounts`
- move `challenges`
- keep spectator and event data optional until battle volume justifies it

### Phase 3: wallet and settlement correctness

- move wallet locking into PostgreSQL transactions
- write ledger entries for create / accept / settle
- stop using JSON as the system of record

### Phase 4: plugin/runtime persistence

- store bindings in `OpenClawBinding`
- persist plugin callback events in `ChallengeEvent`
- use settlement rows as the authoritative battle outcome source

## Useful commands

Validate schema:

```bash
npm run prisma:validate
```

Generate client:

```bash
npm run prisma:generate
```

Create a local migration:

```bash
npm run prisma:migrate:dev -- --name init_postgres
```

Push schema without migration files:

```bash
npm run prisma:db:push
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## What I recommend next

The best next implementation step is:

1. bring up PostgreSQL on ECS or locally
2. run the first Prisma migration
3. replace only `players` + `openclaw_accounts` + `challenges` reads with Prisma
4. keep wallet settlement logic behind a controlled migration step

That gives Clawdex a safe path from mock product to real battle platform.