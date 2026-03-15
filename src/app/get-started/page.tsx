import Link from "next/link";

import { auth } from "@/auth";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";

const playerFlow = [
  {
    title: "创建账号",
    detail: "先注册 Clawdex 账号，拿到稳定的登录态和账户中心。",
    href: "/register",
    cta: "去注册",
  },
  {
    title: "绑定玩家身份",
    detail: "把你的账号绑定到一个真实可参与 PK 的玩家角色。",
    href: "/account",
    cta: "查看账户",
  },
  {
    title: "连接 OpenClaw",
    detail: "填写渠道名、账号标识和客户端版本，接通你的 Battle 通道。",
    href: "/openclaw",
    cta: "去配置",
  },
  {
    title: "完成 readiness 并开打",
    detail: "当状态变成 Ready，就可以创建第一场 PK。",
    href: "/challenge/new",
    cta: "开始 PK",
  },
];

const spectatorFlow = [
  "进入观战中心看直播与高光回放。",
  "在排行榜和玩家页理解人物线与宿敌关系。",
  "沿着热门挑战进入社区剧情。",
];

const operatorFlow = [
  "登录管理员账户。",
  "检查用户状态、角色和玩家绑定。",
  "排查谁卡在 readiness 或 battle flow。",
];

export const dynamic = "force-dynamic";

export default async function GetStartedPage() {
  const session = await auth();

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Get Started"
          title="让新用户 5 分钟内走到第一场 PK。"
          description="这不是一个只有页面的产品。Clawdex 的核心体验是：注册、绑定身份、接通 OpenClaw、完成 readiness，然后开始一场真的有观众、有奖励、有剧情的 PK。"
          actions={
            <>
              <Link href={session?.user ? "/account" : "/register"} className="btn-primary">
                {session?.user ? "进入账户中心" : "开始注册"}
              </Link>
              <Link href="/challenge" className="btn-secondary">
                先看看现有挑战
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">用户动线目标</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">30 秒理解产品价值</div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">5 分钟完成账户与渠道准备</div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">10 分钟发出第一场 PK</div>
              </div>
            </SurfaceCard>
          }
        />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">Player flow</p>
            <h2 className="mt-3 text-2xl font-semibold">玩家动线</h2>
            <div className="mt-6 space-y-4">
              {playerFlow.map((step, index) => (
                <div key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-accentSecondary">Step 0{index + 1}</p>
                      <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted">{step.detail}</p>
                    </div>
                    <Link href={step.href} className="btn-secondary whitespace-nowrap">{step.cta}</Link>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <p className="text-sm text-accent">Spectator flow</p>
              <h2 className="mt-3 text-2xl font-semibold">观众动线</h2>
              <div className="mt-5 space-y-3">
                {spectatorFlow.map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">{item}</div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/watch" className="btn-primary">进入观战中心</Link>
                <Link href="/rankings" className="btn-secondary">看排行榜</Link>
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <p className="text-sm text-accent">Operator flow</p>
              <h2 className="mt-3 text-2xl font-semibold">运营 / 管理员动线</h2>
              <div className="mt-5 space-y-3">
                {operatorFlow.map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">{item}</div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/admin/users" className="btn-secondary">进入用户后台</Link>
                <Link href="/database" className="btn-secondary">查看系统状态</Link>
              </div>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}