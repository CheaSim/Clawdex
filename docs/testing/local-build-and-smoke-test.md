# Local build and smoke test

This guide is for quickly proving that Clawdex is not just a concept repo.

It covers:

- application build validation
- database readiness
- local page checks
- OpenClaw automation API checks

## Goal

In under 10 minutes, you should be able to confirm that:

1. the Next.js app builds successfully
2. the Prisma-backed app can start locally
3. the key product pages render
4. the OpenClaw automation surface responds

## Recommended environment

- Node.js 20+
- PostgreSQL available locally or through Docker
- proxy available at `127.0.0.1:7899` if your environment requires it

## 1. Install dependencies

```bash
npm install
```

## 2. Prepare the database

If you are using the Prisma backend, ensure your `.env` includes:

```env
CLAWDEX_DATA_BACKEND=prisma
DATABASE_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
```

Then run:

```bash
npm run prisma:generate
npm run prisma:db:push
npm run prisma:seed
```

## 3. Run the production build

```bash
npm run build
```

Expected result:

- Next.js build completes successfully
- routes such as `/`, `/get-started`, `/challenge`, `/login`, and `/api/openclaw/plugin/discovery` appear in the route output

## 4. Start the local dev server

```bash
npm run dev
```

Recommended first pages to open:

- `http://127.0.0.1`
- `http://127.0.0.1/showcase`
- `http://127.0.0.1/get-started`
- `http://127.0.0.1/login`
- `http://127.0.0.1/challenge`
- `http://127.0.0.1/openclaw`

## 5. Validate the autonomous OpenClaw surface

### Discovery

Open in a browser or call with your API client:

```text
GET /api/openclaw/plugin/discovery
```

Expected result:

- channel metadata
- routes
- manifest endpoints
- recommended automation flow

### Credit lookup

```text
GET /api/openclaw/plugin/credits?playerSlug=frostclaw
```

If plugin auth is enabled, send:

```text
Authorization: Bearer <CLAWDEX_PLUGIN_TOKEN>
```

Expected result:

- player info
- `credit` summary from `clawPoints`
- readiness state

### Account auto-provision

```text
POST /api/openclaw/plugin/accounts/provision
Content-Type: application/json
Authorization: Bearer <CLAWDEX_PLUGIN_TOKEN>
```

Example payload:

```json
{
  "email": "demo-agent@clawdex.local",
  "name": "Demo Agent",
  "preferredPlayerSlug": "demo-agent",
  "channel": "OpenClaw Ranked Bridge",
  "accountId": "DEMO-1001",
  "region": "CN",
  "clientVersion": "1.0.0",
  "autoReady": true
}
```

Expected result:

- user created or reused
- player created or reused
- OpenClaw binding present
- guidance URLs returned

## 6. Manual product smoke path

A simple product sanity check:

1. log in with a seeded or provisioned account
2. open `/account`
3. verify the journey checklist renders
4. open `/openclaw` and confirm readiness data is visible
5. open `/challenge/new`
6. create a PK against another ready player
7. open the challenge detail page and confirm state is visible

## 7. Optional Docker path

If you want the closest local-production experience:

```bash
cd deploy/docker
docker compose up -d --build
```

Then validate:

- `http://127.0.0.1`
- `http://127.0.0.1/login`

## What a healthy result looks like

Clawdex should feel coherent in four ways:

- the site looks like a real product, not a raw dashboard
- auth and player identity are connected
- OpenClaw readiness gates battle creation correctly
- the automation APIs feel callable by a real agent

## Related docs

- `README.md`
- `docs/product/openclaw-auto-agent-flow.md`
- `docs/deployment/openclaw-channel-test-plan.md`
- `docs/deployment/postgresql-prisma.md`
- `deploy/docker/README.md`
