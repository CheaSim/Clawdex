# Alibaba Cloud ECS deployment

This guide deploys the main Clawdex Next.js app to an Alibaba Cloud ECS Ubuntu server.

Recommended priority:

1. Docker + Docker Compose + Nginx
2. PM2 + Node + Nginx

For the current project, Docker is more reliable because it gives you:

- reproducible runtime environment
- simpler rollback and rebuild flow
- cleaner dependency management on ECS
- easier migration to future CI/CD or container platforms

## Recommended topology

- `www.cheasim.com` → GitHub Pages showcase
- `app.cheasim.com` → ECS-hosted Next.js app

## Assumptions

- OS: Ubuntu 22.04 LTS
- Repo path on server: `/var/www/clawdex/current`
- App port: `3000`
- Domain for app: `app.cheasim.com`

## Recommended: Docker deployment

### 1. Connect to the server

```bash
ssh root@<your-server-ip>
```

### 2. Install Docker and Nginx

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git nginx
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
	"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
	$(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
docker --version
docker compose version
```

### 3. Pull the project

```bash
mkdir -p /var/www/clawdex
cd /var/www/clawdex
git clone https://github.com/CheaSim/Clawdex.git current
cd current
```

For later updates:

```bash
cd /var/www/clawdex/current
git pull origin main
```

### 4. Build and start the container

```bash
cd /var/www/clawdex/current/deploy/docker
docker compose up -d --build
```

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

### 5. Configure Nginx on the host

```bash
cp /var/www/clawdex/current/deploy/nginx/clawdex.conf /etc/nginx/sites-available/clawdex.conf
ln -s /etc/nginx/sites-available/clawdex.conf /etc/nginx/sites-enabled/clawdex.conf
nginx -t
systemctl reload nginx
```

### 6. Open security group / firewall

Allow in Alibaba Cloud ECS security group:

- `22`
- `80`
- `443`

If `ufw` is enabled:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 7. Point domain to ECS

Create DNS record:

- `A` record for `app.cheasim.com` → ECS public IP

### 8. Enable HTTPS

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.cheasim.com
```

### 9. Updating later

```bash
cd /var/www/clawdex/current
git pull origin main
cd deploy/docker
docker compose up -d --build
```

## Alternative: PM2 deployment

If you do not want Docker yet, you can still deploy with Node + PM2 + Nginx.

## 1. Connect to the server

```bash
ssh root@<your-server-ip>
```

If you use a non-root user:

```bash
ssh <your-user>@<your-server-ip>
```

## 2. Install system dependencies

```bash
apt update && apt upgrade -y
apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pm2
```

Verify:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 3. Prepare application directory

```bash
mkdir -p /var/www/clawdex
cd /var/www/clawdex
git clone https://github.com/CheaSim/Clawdex.git current
cd current
```

If the repo already exists and you are updating:

```bash
cd /var/www/clawdex/current
git pull origin main
```

## 4. Install dependencies and build

```bash
cd /var/www/clawdex/current
npm ci
npm run build
```

## 5. Start the app with PM2

Use the repo's PM2 config:

```bash
cd /var/www/clawdex/current
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

After `pm2 startup`, copy and run the command PM2 prints.

Useful PM2 commands:

```bash
pm2 status
pm2 logs clawdex
pm2 restart clawdex
pm2 stop clawdex
```

## 6. Configure Nginx reverse proxy

Copy the sample config:

```bash
cp /var/www/clawdex/current/deploy/nginx/clawdex.conf /etc/nginx/sites-available/clawdex.conf
```

Edit the domain if needed:

```bash
nano /etc/nginx/sites-available/clawdex.conf
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/clawdex.conf /etc/nginx/sites-enabled/clawdex.conf
nginx -t
systemctl reload nginx
```

## 7. Open firewall / security group

In Alibaba Cloud ECS security group, allow:

- `22` for SSH
- `80` for HTTP
- `443` for HTTPS

If Ubuntu firewall is enabled:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

## 8. Point domain to the server

In your DNS provider, create:

- `A` record for `app.cheasim.com` → your ECS public IP

After DNS resolves, test:

```bash
curl -I http://app.cheasim.com
```

## 9. Enable HTTPS

Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

Request certificate:

```bash
certbot --nginx -d app.cheasim.com
```

Then verify renewal:

```bash
systemctl status certbot.timer
```

## 10. Updating the app later

```bash
cd /var/www/clawdex/current
git pull origin main
npm ci
npm run build
pm2 restart clawdex
```

## Notes for current project

- The app currently stores mutable data in `data/mock-db.json`.
- In Docker mode, `deploy/docker/docker-compose.yml` mounts `/app/data` into a named volume so container rebuilds do not wipe current mock data.
- This still only fits a single ECS instance well, and is not ideal for multi-instance deployments.
- For production scale, replace it with a real database.

## Quick copy-paste Docker deployment flow

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git nginx
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
mkdir -p /var/www/clawdex
cd /var/www/clawdex
git clone https://github.com/CheaSim/Clawdex.git current
cd /var/www/clawdex/current/deploy/docker
docker compose up -d --build
cp /var/www/clawdex/current/deploy/nginx/clawdex.conf /etc/nginx/sites-available/clawdex.conf
ln -s /etc/nginx/sites-available/clawdex.conf /etc/nginx/sites-enabled/clawdex.conf
nginx -t && systemctl reload nginx
```

## Quick copy-paste PM2 deployment flow

```bash
apt update && apt upgrade -y
apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pm2
mkdir -p /var/www/clawdex
cd /var/www/clawdex
git clone https://github.com/CheaSim/Clawdex.git current
cd /var/www/clawdex/current
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
cp deploy/nginx/clawdex.conf /etc/nginx/sites-available/clawdex.conf
ln -s /etc/nginx/sites-available/clawdex.conf /etc/nginx/sites-enabled/clawdex.conf
nginx -t && systemctl reload nginx
```
