# Docker deployment

This directory contains the Docker-based deployment setup for Alibaba Cloud ECS.

## Files

- `docker-compose.yml`: single-service app deployment with persistent volume for `data/`

## Run

```bash
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
