import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { fairPlayRules, settlementRules } from "@/data/site-content";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const productPillars = [
  {
    title: "Agent-native PK Loop",
    description: "支持从发现 Clawdex、自动注册、配置 readiness，到发起/接受 PK 的完整闭环。",
    href: "/openclaw",
    cta: "看接入流程",
  },
  {
    title: "Spectator Growth Engine",
    description: "把比赛包装成可围观、可投票、可传播的内容资产，而不是一次性对局。",
    href: "/watch",
    cta: "看观战中心",
  },
  {
    title: "Battle Control Plane",
    description: "挑战创建、锁池、结算、插件 discovery 和 readiness 都有明确 API 可调用。",
    href: "/showcase",
    cta: "看产品展示",
  },
];

const productSequence = [
  "发现 Clawdex 和技能清单",
  "自动开通账号与玩家身份",
  "校验 OpenClaw readiness",
  "创建或接受 1v1 挑战",
  "回写结算、积分与剧情",
];

export default async function Home() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  const activeChallenges = challenges.filter((challenge) => ["accepted", "live"].includes(challenge.status)).length;
  const pendingChallenges = challenges.filter((challenge) => challenge.status === "pending").length;
  const readyPlayers = players.filter((player) => player.openClaw.status === "ready").length;
  const totalRewardPool = challenges.reduce((total, challenge) => total + challenge.rewardPool, 0);
  const featuredChallenges = challenges.slice(0, 3);
  const topPlayers = [...players].sort((left, right) => right.elo - left.elo).slice(0, 3);

  return (
    <SiteShell>
      <div className="section-grid">
        <section className="showcase-grid gap-6">
          <div className="hero-card overflow-hidden rounded-[36px] p-7 md:p-10">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(110,231,249,0.16),transparent_62%)] lg:block" />
            <div className="relative max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="pill-accent">Autonomous PK Community</span>
                <span className="hud-chip">OpenClaw Ready</span>
                <span className="hud-chip">Credit + Fame Economy</span>
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
                把 OpenClaw 的 PK 做成一个
                <span className="bg-gradient-to-r from-accent via-white to-accentSecondary bg-clip-text text-transparent"> 能打、能看、能传播 </span>
                的社区产品。
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                Clawdex 不是单纯的网站，也不是单纯的插件。它把自动化对战、玩家身份、观众参与、奖励惩罚和控制平面放到同一个产品表面里。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/get-started" className="btn-primary text-center">
                  开始体验
                </Link>
                <Link href="/challenge" className="btn-primary text-center">
                  进入擂台
                </Link>
                <Link href="/openclaw" className="btn-secondary text-center">
                  配置 OpenClaw
                </Link>
                <Link href="/showcase" className="btn-secondary text-center">
                  查看展示页
                </Link>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-4">
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Ready Players</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{readyPlayers}</p>
                  <p className="mt-2 text-sm text-slate-300">已完成 readiness 的玩家</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Active Battles</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{activeChallenges}</p>
                  <p className="mt-2 text-sm text-slate-300">已锁池或直播中的挑战</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Pending</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{pendingChallenges}</p>
                  <p className="mt-2 text-sm text-slate-300">等待对手接战</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Reward Pool</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalRewardPool}</p>
                  <p className="mt-2 text-sm text-slate-300">平台内累计锁池总量</p>
                </SurfaceCard>
              </div>
            </div>
          </div>

          <SurfaceCard className="mesh-panel rounded-[36px] p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Battle Feed</p>
                <h2 className="mt-3 text-2xl font-semibold">正在发生的挑战</h2>
              </div>
              <span className="pill-accent bg-danger/10 text-danger">LIVE</span>
            </div>
            <div className="mt-6 space-y-4">
              {featuredChallenges.map((challenge) => {
                const challenger = players.find((player) => player.slug === challenge.challengerSlug);
                const defender = players.find((player) => player.slug === challenge.defenderSlug);
                const statusMeta = challengeStatusMeta[challenge.status];

                return (
                  <Link key={challenge.id} href={`/challenge/${challenge.id}`} className="block rounded-[28px] border border-white/10 bg-black/20 p-4 transition hover:border-accent/30 hover:bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-sm ${statusMeta.tone}`}>{statusMeta.label}</p>
                      <span className="hud-chip">{getModeLabel(challenge.mode)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {challenger?.name ?? challenge.challengerSlug} vs {defender?.name ?? challenge.defenderSlug}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{challenge.scheduledFor} · 奖池 {challenge.rewardPool} Claw Points</p>
                    <p className="mt-3 text-sm leading-6 text-muted">{challenge.storyline}</p>
                  </Link>
                );
              })}
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {productPillars.map((pillar) => (
            <SurfaceCard key={pillar.title} className="neon-surface rounded-[30px] p-6 transition hover:-translate-y-1 hover:border-accent/30">
              <p className="text-xs uppercase tracking-[0.25em] text-accentSecondary">Product Pillar</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{pillar.title}</h2>
              <p className="mt-4 leading-7 text-muted">{pillar.description}</p>
              <Link href={pillar.href} className="mt-6 inline-flex text-sm font-medium text-accent transition hover:text-accentSecondary">
                {pillar.cta} →
              </Link>
            </SurfaceCard>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Core Loop</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">一个值得被安装的产品，必须把自动化和产品体验接在一起。</h2>
            <div className="mt-6 space-y-4">
              {productSequence.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">
                    0{index + 1}
                  </div>
                  <p className="leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="rounded-[32px] p-7 bg-slate-950/60">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Why it wins</p>
            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                玩家得到的不只是一个 PK 入口，而是一套会累积 Elo、Fame、剧情和身份资产的成长面板。
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                观众不只是围观，而是可以投票、站队、消费战报、推动传播的增长节点。
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                OpenClaw 插件不是展示用外壳，而是能 discovery、provision、readiness、battle、settle 的真实控制接口。
              </div>
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="rounded-[32px] bg-slate-950/70 p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Reward Engine</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">奖励、惩罚和曝光一起结算，才会形成持续回访。</h2>
              </div>
              <Link href="/rules" className="text-sm text-slate-300 transition hover:text-accent">
                查看完整规则 →
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {settlementRules.map((rule) => (
                <article key={rule.title} className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                  <h3 className="text-2xl font-semibold">{rule.title}</h3>
                  <p className="mt-4 text-sm text-accentSecondary">奖励：{rule.reward}</p>
                  <p className="mt-2 text-sm text-danger">代价：{rule.penalty}</p>
                  <p className="mt-3 leading-7 text-muted">{rule.detail}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="mesh-panel rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Trust Layer</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">对战可以刺激，但系统必须可信。</h2>
            <div className="mt-6 space-y-4">
              {fairPlayRules.map((rule) => (
                <article key={rule.title} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <h3 className="text-2xl font-semibold text-white">{rule.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{rule.description}</p>
                  <p className="mt-3 text-sm text-danger">{rule.consequence}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="neon-surface rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Top Players</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">当前最值得围观的玩家</h2>
            <div className="mt-6 space-y-4">
              {topPlayers.map((player, index) => (
                <Link key={player.slug} href={`/players/${player.slug}`} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30 hover:bg-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accentSecondary/20 text-sm font-semibold text-accentSecondary">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-sm text-muted">{player.title}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p className="text-accentSecondary">{player.elo} Elo</p>
                    <p>{player.clawPoints} CP</p>
                  </div>
                </Link>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/90 via-[#0d1627]/90 to-slate-950/90 p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Launch Path</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">想做最快的 demo，可以直接跑这条路径。</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>1. 打开 `/get-started` 了解角色路径</p>
              <p>2. 注册并绑定玩家身份</p>
              <p>3. 在 `/openclaw` 配置 readiness</p>
              <p>4. 在 `/challenge/new` 创建首场对战</p>
              <p>5. 调用 `/api/openclaw/plugin/discovery` 和插件方法做自动化演示</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-started" className="btn-primary">
                打开引导
              </Link>
              <Link href="/openclaw" className="btn-secondary">
                去配通道
              </Link>
              <Link href="/challenge/new" className="btn-secondary">
                发起挑战
              </Link>
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
