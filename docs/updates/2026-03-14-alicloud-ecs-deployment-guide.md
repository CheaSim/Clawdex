# 2026-03-14 - Alibaba Cloud ECS deployment guide

## Summary
- Added a PM2 process config for running the Next.js app on a server.
- Added an Nginx reverse-proxy sample for exposing the app through a domain on Alibaba Cloud ECS.
- Added a step-by-step ECS deployment guide with exact terminal commands for Ubuntu servers.
- Linked the deployment materials from the main README.

## Files
- `ecosystem.config.cjs`
- `deploy/nginx/clawdex.conf`
- `docs/deployment/alicloud-ecs.md`
- `README.md`

## Validation
- `npm run build` ✅
- Deployment files checked for editor errors ✅

## Follow-up
- Replace the mock JSON persistence with a real database before scaling beyond a single ECS instance.
- Add a Docker deployment option if the server setup later needs containerization.
- Add environment variable management once auth, storage, or external services are introduced.
