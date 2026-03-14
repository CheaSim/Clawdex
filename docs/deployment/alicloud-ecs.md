# Alibaba Cloud ECS deployment

This guide deploys the main Clawdex Next.js app to an Alibaba Cloud ECS Ubuntu server using Node.js, PM2, and Nginx.

## Recommended topology

- `www.cheasim.com` → GitHub Pages showcase
- `app.cheasim.com` → ECS-hosted Next.js app

## Assumptions

- OS: Ubuntu 22.04 LTS
- Repo path on server: `/var/www/clawdex/current`
- App port: `3000`
- Domain for app: `app.cheasim.com`

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
- This works on a single ECS instance, but is not ideal for multi-instance deployments.
- For production scale, replace it with a real database.

## Quick copy-paste deployment flow

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
