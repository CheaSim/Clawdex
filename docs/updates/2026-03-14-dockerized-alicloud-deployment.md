# 2026-03-14 - Dockerized Alibaba Cloud deployment

## Summary
- Added a multi-stage Dockerfile optimized for deploying the Next.js app as a production container.
- Enabled Next.js `standalone` output to reduce container runtime footprint and make Docker deployment cleaner.
- Added a Docker Compose setup with a persistent volume for the app's `data/` directory so mock challenge data survives container rebuilds.
- Upgraded the Alibaba Cloud ECS deployment guide to recommend Docker + Docker Compose + Nginx as the primary deployment path.

## Files
- `next.config.ts`
- `Dockerfile`
- `.dockerignore`
- `deploy/docker/docker-compose.yml`
- `deploy/docker/README.md`
- `docs/deployment/alicloud-ecs.md`
- `README.md`

## Validation
- `npm run build` ✅
- Docker/deployment files checked for editor errors ✅

## Follow-up
- Build and test the container directly on an ECS host with Docker installed.
- Add environment variable support and secrets management once external services are introduced.
- Replace file-backed persistence with a database before scaling past a single server.
