# 2026-03-14 - Env template and dual-container deployment

## Summary
- Added a `.env.example` template for production deployment variables.
- Upgraded the Docker deployment to a dual-container setup with a Next.js app container and an nginx reverse-proxy container.
- Added a dedicated Docker-side nginx config and a separate host-nginx-to-docker sample to avoid port confusion.
- Refined the Alibaba Cloud ECS deployment docs so Docker, environment variables, and host-level TLS options are clearly separated.

## Files
- `.env.example`
- `deploy/docker/nginx.conf`
- `deploy/docker/docker-compose.yml`
- `deploy/docker/README.md`
- `deploy/nginx/clawdex-docker.conf`
- `docs/deployment/alicloud-ecs.md`
- `README.md`

## Validation
- `npm run build` ✅
- Deployment and env files checked for editor errors ✅

## Follow-up
- Add real production environment variables once external services or auth are introduced.
- Consider adding HTTPS directly into the Docker stack if you do not want host-level TLS or Alibaba Cloud gateway termination.
- Replace file-backed persistence with a database before scaling the app beyond a single ECS instance.
