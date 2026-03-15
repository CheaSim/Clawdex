---
name: clawdex-deploy
description: >
  Clawdex Docker 部署与运维技能。用于构建镜像、启动服务、数据库迁移、排查部署问题。
  触发条件：当用户提到部署、Docker、docker-compose、Nginx、数据库迁移、
  prisma db push/seed、容器日志、环境变量配置时使用。
  不要用于：本地开发调试（使用 clawdex-dev）。
---

# Clawdex 部署技能

## 架构

```
用户 → Nginx (:80) → Next.js App (:3000) → PostgreSQL (:5432)
```

三容器 Docker Compose 部署，配置在 `deploy/docker/`。

## 必要环境变量 (.env)

```env
NODE_ENV=production
CLAWDEX_DATA_BACKEND=prisma
AUTH_SECRET=<随机长字符串>
NEXTAUTH_URL=http://<你的域名或IP>
DATABASE_URL=postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public
POSTGRES_DB=clawdex
POSTGRES_USER=clawdex
POSTGRES_PASSWORD=change_me
```

**NEXTAUTH_URL 必须设置**，否则 Docker 中登录会报 "Server error"。

## 部署流程

```bash
# 1. 构建 Next.js
npm run build

# 2. 启动容器
cd deploy/docker
docker compose up -d --build

# 3. 初始化数据库
docker exec -it clawdex-app npx prisma db push
docker exec -it clawdex-app npx prisma db seed
```

## 更新部署

```bash
npm run build
cd deploy/docker
docker compose down
docker compose up -d --build
```

## 常见问题

### 登录报 "Server error"

确认 `.env` 中有 `NEXTAUTH_URL`，且值匹配用户访问的地址。

### 数据库连接失败

Docker 内用 `postgres:5432`（service name），本地用 `127.0.0.1:5432`。
docker-compose.yml 已自动覆盖 DATABASE_URL 为容器内地址。

### Prisma 操作失败

容器内 Prisma 命令需要 `docker exec`：
```bash
docker exec -it clawdex-app npx prisma db push
docker exec -it clawdex-app npx prisma db seed
docker exec -it clawdex-app npx prisma studio
```

### 查看日志

```bash
docker logs clawdex-app --tail 50
docker logs clawdex-nginx --tail 50
docker logs clawdex-postgres --tail 50
```

## 种子账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `frostclaw@clawdex.local` | `Clawdex123!` | USER |
| `nightpaw@clawdex.local` | `Clawdex123!` | USER |
| `ghosthook@clawdex.local` | `Clawdex123!` | USER |
| `crimsonkid@clawdex.local` | `Clawdex123!` | USER |
| `admin@clawdex.local` | `ClawdexAdmin!2026` | ADMIN |

## 文件结构

```
deploy/docker/
├── docker-compose.yml    # 三服务编排
├── nginx.conf            # 反向代理配置
└── .app-container.env    # 容器环境变量
Dockerfile                # 多阶段构建（项目根目录）
```
