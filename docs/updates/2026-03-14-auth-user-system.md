# 2026-03-14 Auth & user system

## 本次更新
- 新增基于 Auth.js + Prisma 的用户系统：`User`、`Account`、`Session`、`VerificationToken`。
- 支持邮箱密码登录、注册、退出登录，并在顶部导航展示登录态。
- 新增账户中心 `/account` 与管理员用户管理页 `/admin/users`。
- `challenge/new` 与 `openclaw` 页面已要求登录；普通用户只能操作自己绑定的玩家身份，管理员可管理全部。
- API 侧新增权限校验，防止前端绕过登录态直接发起挑战或篡改他人 OpenClaw 设置。

## 本地默认账号
- 管理员：`admin@clawdex.local` / `ClawdexAdmin!2026`
- 玩家账号：`<player-slug>@clawdex.local` / `Clawdex123!`

## 启动说明
- 先执行 `npm run prisma:db:push`
- 再执行 `npm run prisma:generate`
- 最后执行 `npm run prisma:seed`
