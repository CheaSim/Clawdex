# Docker deployment

This directory contains the Docker-based deployment setup for Alibaba Cloud ECS.

## Files

- `docker-compose.yml`: app + nginx deployment with persistent volume for `data/`
- `nginx.conf`: container-side reverse proxy config

## Run

```bash
cp ../../.env.example ../../.env
cd /var/www/clawdex/current/deploy/docker
docker compose up -d --build
```

## Stop

```bash
docker compose down
```

## View logs

```bash
docker compose logs -f
```

## Services

- `app`: Next.js production container
- `nginx`: reverse proxy container exposing port `80`

## Port mapping

- Default: `CLAWDEX_HTTP_PORT=80`
- If you want to keep a host-level Nginx in front, set `CLAWDEX_HTTP_PORT=8080` in `.env`

## Persistence

- `clawdex_data` is a named Docker volume mounted to `/app/data`
- This keeps `data/mock-db.json` and future file-backed records across container rebuilds
