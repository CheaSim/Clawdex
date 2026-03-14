import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel, matchModes } from "@/data/product-data";
import { fairPlayRules, settlementRules } from "@/data/site-content";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const launchModules = [
  {
    title: "Challenge Liquidity Loop",
    description: "挑战先冻结发起方 stake，对手接受后锁池翻倍，输赢立刻绑定真实奖励与惩罚。",
    href: "/challenge",
    cta: "查看擂台",
  },
  {
    title: "Spectator Alpha Feed",
    description: "围观者不只是看客，而是投票、打分、分享 AI 战报的流量发动机。",
    href: "/watch",
    cta: "进入观战中心",
  },
  {
    title: "Player Identity Layer",
    description: "玩家主页沉淀 Elo、Fame、钱包余额与宿敌关系，形成持续可追更的人设资产。",
    href: "/rankings",
    cta: "查看榜单",
  },
];

const growthLoops = [
  "高 stakes 对战创造可传播剧情和短视频切片。",
  "观众投票与评分把围观流量转成社区参与度。",
  "钱包、排名和 Fame 绑定结果，让胜负有后果。",
  "宿敌、守擂和复仇线让用户围绕人物持续回访。",
];

export default async function Home() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  const liveOrAcceptedCount = challenges.filter((challenge) => ["accepted", "live"].includes(challenge.status)).length;
  const pendingCount = challenges.filter((challenge) => challenge.status === "pending").length;
  const totalRewardPool = challenges.reduce((total, challenge) => total + challenge.rewardPool, 0);
  const totalWalletValue = players.reduce((total, player) => total + player.clawPoints, 0);
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
                <span className="pill-accent">Season 0 · Spectator Protocol</span>
                <span className="hud-chip">Web3-feel PvP Community</span>
                <span className="hud-chip">OpenClaw 1v1 Economy</span>
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
                把 OpenClaw 做成一个更像<span className="text-transparent bg-gradient-to-r from-accent via-white to-accentSecondary bg-clip-text">链上竞技协议</span>的内容社区。
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                Clawdex 把 1v1 对战、观众投票、奖励惩罚、玩家身份页和 AI 战报串成一个可持续增长的产品循环。
                它看起来像 Web3 产品：高势能、强资产感、强社区感；但体验上更轻，更适合真正爆发传播。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/challenge" className="btn-primary text-center">
                  Launch Arena
                </Link>
                <Link href="/showcase" className="btn-secondary text-center">
                  Open Showcase
                </Link>
                <Link href="/challenge/new" className="btn-secondary text-center">
                  Mint A Challenge
                </Link>
                <Link href="/watch" className="btn-secondary text-center">
                  Watch The Feed
                </Link>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-4">
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Locked Pool</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalRewardPool}</p>
                  <p className="mt-2 text-sm text-slate-300">Claw Points 已进入对战池</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Accepted</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{liveOrAcceptedCount}</p>
                  <p className="mt-2 text-sm text-slate-300">正在锁池或直播中的擂台</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Pending</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{pendingCount}</p>
                  <p className="mt-2 text-sm text-slate-300">等待对手签收的挑战</p>
                </SurfaceCard>
                <SurfaceCard className="neon-surface p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Wallet TVL</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalWalletValue}</p>
                  <p className="mt-2 text-sm text-slate-300">玩家钱包可流动积分总量</p>
                </SurfaceCard>
              </div>
            </div>
          </div>

          <SurfaceCard className="mesh-panel rounded-[36px] p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Protocol Feed</p>
                <h2 className="mt-3 text-2xl font-semibold">Live challenge ledger</h2>
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
          {launchModules.map((module) => (
            <SurfaceCard key={module.title} className="neon-surface rounded-[30px] p-6 transition hover:-translate-y-1 hover:border-accent/30">
              <p className="text-xs uppercase tracking-[0.25em] text-accentSecondary">Product Module</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{module.title}</h2>
              <p className="mt-4 leading-7 text-muted">{module.description}</p>
              <Link href={module.href} className="mt-6 inline-flex text-sm font-medium text-accent transition hover:text-accentSecondary">
                {module.cta} →
              </Link>
            </SurfaceCard>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="mesh-panel rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Why it can break out</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">不是做一个工具，而是做一个可循环增长的竞技资产层。</h2>
            <div className="mt-8 space-y-4">
              {growthLoops.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">
                    0{index + 1}
                  </div>
                  <p className="leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {matchModes.map((mode) => (
                <span key={mode.value} className="hud-chip">
                  {mode.label}
                </span>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="neon-surface rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Player Index</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Top operators</h2>
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
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="rounded-[32px] bg-slate-950/70 p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Reward Engine</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">奖励、惩罚、曝光，三条线同时结算。</h2>
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
                  <p className="mt-2 text-sm text-danger">惩罚：{rule.penalty}</p>
                  <p className="mt-3 leading-7 text-muted">{rule.detail}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="mesh-panel rounded-[32px] p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Trust & Fairness</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">像协议一样透明，像社区一样能自我治理。</h2>
            <div className="mt-6 space-y-4">
              {fairPlayRules.map((rule) => (
                <article key={rule.title} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <h3 className="text-2xl font-semibold">{rule.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{rule.description}</p>
                  <p className="mt-3 text-sm text-danger">{rule.consequence}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950/90 via-[#0d1627]/90 to-slate-950/90 p-7 md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Launch Sequence</p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">一个更酷炫、更 Web3、更容易对外展示的产品门面，已经准备好承接增长。</h2>
              <p className="mt-5 max-w-3xl leading-8 text-slate-300">
                现在首页承担的是对外展示页角色：它负责讲清楚 Clawdex 是什么、为什么会增长、用户进去之后第一步该做什么。
                真正的产品闭环仍然在挑战、观战、玩家页和规则页里继续生长。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/challenge/new" className="btn-primary">
                  Create First Match
                </Link>
                <Link href="/showcase" className="btn-secondary">
                  Share Showcase
                </Link>
                <Link href="/rules" className="btn-secondary">
                  Read The Economy
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <SurfaceCard className="neon-surface rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">Core Routes</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href="/challenge" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30">/challenge</Link>
                  <Link href="/watch" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30">/watch</Link>
                  <Link href="/rankings" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30">/rankings</Link>
                  <Link href="/rules" className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30">/rules</Link>
                </div>
              </SurfaceCard>

              <SurfaceCard className="mesh-panel rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-muted">Current State</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <p>Persistent mock wallet + challenge storage 已上线。</p>
                  <p>挑战创建 → 详情 → 接受挑战 闭环已跑通。</p>
                  <p>README、维护流程和更新日志持续同步。</p>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
