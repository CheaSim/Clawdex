# Docker deployment

This directory contains the Docker-based deployment setup for Alibaba Cloud ECS.

## Files

- `docker-compose.yml`: postgres + app + nginx deployment with persistent volumes
- `nginx.conf`: container-side reverse proxy config

## Run

```bash
cp ../../.env.example ../../.env
cd /var/www/clawdex/current/deploy/docker
docker compose up -d --build
```

## Local PostgreSQL-ready flow

If you want the app to run against Prisma/PostgreSQL locally, set this in `.env` first:

```bash
CLAWDEX_DATA_BACKEND=prisma
DATABASE_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
DIRECT_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
POSTGRES_DB=clawdex
POSTGRES_USER=clawdex
POSTGRES_PASSWORD=change_me
DOCKER_HTTP_PROXY=http://host.docker.internal:7899
DOCKER_HTTPS_PROXY=http://host.docker.internal:7899
DOCKER_ALL_PROXY=http://host.docker.internal:7899
DOCKER_NO_PROXY=localhost,127.0.0.1,postgres,app,nginx
```

`host.docker.internal` is used here because `127.0.0.1:7899` inside Docker points to the container itself, not your Windows host.

Then run:

```bash
cd ../../
npm install
npm run build
npm run prisma:db:push
npm run prisma:seed
cd deploy/docker
docker compose up -d --build
```

Current Docker packaging mode uses the locally prepared `.next` output and installed `node_modules` directly, so `npm install` and `npm run build` should be completed before `docker compose up -d --build`.

## Stop

```bash
docker compose down
```

## View logs

```bash
docker compose logs -f
```

## Services

- `postgres`: local PostgreSQL for Prisma-backed data
- `app`: Next.js production container
- `nginx`: reverse proxy container exposing port `80`

## Port mapping

- Default: `CLAWDEX_HTTP_PORT=80`
- If you want to keep a host-level Nginx in front, set `CLAWDEX_HTTP_PORT=8080` in `.env`

## Persistence

- `clawdex_data` is a named Docker volume mounted to `/app/data`
- This keeps `data/mock-db.json` and future file-backed records across container rebuilds
- `clawdex_postgres` stores the PostgreSQL database files for local testing
