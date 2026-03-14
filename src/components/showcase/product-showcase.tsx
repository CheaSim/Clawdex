import Link from "next/link";

import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import type { MatchListing, PlayerProfile } from "@/data/product-data";

type ProductShowcaseProps = {
  players: PlayerProfile[];
  challenges: MatchListing[];
};

const pillars = [
  {
    title: "Arena Economy",
    description: "每场挑战先冻结 stake，再由对手接战锁池，让胜负自然长出奖金池、风险和情绪张力。",
  },
  {
    title: "Spectator Network",
    description: "观众通过投票、评分、AI 战报和高光传播参与内容分发，形成更强社区扩散。",
  },
  {
    title: "Player Reputation",
    description: "Elo、Fame、钱包余额与宿敌关系共同组成玩家身份资产，而不只是一个用户名。",
  },
];

const roadmap = [
  "Persistent challenge ledger 已落地，可创建、查看详情、接受挑战。",
  "接下来进入 settlement 完成、奖励分发和战后资产流转。",
  "之后可接入真实登录、数据库和更强的观战互动模块。",
];

export function ProductShowcase({ players, challenges }: ProductShowcaseProps) {
  const topPlayers = [...players].sort((left, right) => right.fame - left.fame).slice(0, 4);
  const featuredChallenges = challenges.slice(0, 4);
  const lockedPool = challenges.reduce((sum, challenge) => sum + challenge.rewardPool, 0);
  const acceptedCount = challenges.filter((challenge) => challenge.status === "accepted" || challenge.status === "live").length;

  return (
    <div className="section-grid">
      <section className="showcase-grid gap-6">
        <div className="hero-card overflow-hidden rounded-[40px] p-8 md:p-10 lg:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(83,92,255,0.18),transparent_60%)] lg:block" />
          <div className="relative max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill-accent">Clawdex Showcase</span>
              <span className="hud-chip">Stand-alone Presentation Page</span>
              <span className="hud-chip">Web3-inspired Arena Brand</span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.02]">
              一个单独可分享的展示页，专门用来讲清楚 <span className="bg-gradient-to-r from-accent via-white to-accentSecondary bg-clip-text text-transparent">Clawdex 为什么有爆发潜力</span>。
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
              这不是用户第一次进入产品时的功能首页，而是给外部用户、合作方、社区和 GitHub 访客看的产品门面：
              它负责讲定位、讲增长、讲玩法、讲状态。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/challenge/new" className="btn-primary">
                Start A Match
              </Link>
              <Link href="/challenge" className="btn-secondary">
                Open Arena
              </Link>
              <Link href="/" className="btn-secondary">
                返回首页
              </Link>
            </div>
          </div>
        </div>

        <SurfaceCard className="mesh-panel rounded-[40px] p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Live Snapshot</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="neon-surface rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Locked Pool</p>
              <p className="mt-3 text-3xl font-semibold text-white">{lockedPool}</p>
              <p className="mt-2 text-sm text-slate-300">Claw Points 已进入挑战经济层</p>
            </div>
            <div className="neon-surface rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Accepted / Live</p>
              <p className="mt-3 text-3xl font-semibold text-white">{acceptedCount}</p>
              <p className="mt-2 text-sm text-slate-300">当前已锁池或进行中的高 stakes 对战</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {featuredChallenges.map((challenge) => {
              const challenger = players.find((player) => player.slug === challenge.challengerSlug);
              const defender = players.find((player) => player.slug === challenge.defenderSlug);
              const statusMeta = challengeStatusMeta[challenge.status];

              return (
                <Link key={challenge.id} href={`/challenge/${challenge.id}`} className="block rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-accent/30 hover:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm ${statusMeta.tone}`}>{statusMeta.label}</p>
                    <span className="hud-chip">{getModeLabel(challenge.mode)}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-white">
                    {challenger?.name ?? challenge.challengerSlug} vs {defender?.name ?? challenge.defenderSlug}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">{challenge.scheduledFor} · {challenge.rewardPool} CP Pool</p>
                </Link>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <SurfaceCard key={pillar.title} className="neon-surface rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-accentSecondary">Core Pillar</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{pillar.title}</h2>
            <p className="mt-4 leading-7 text-muted">{pillar.description}</p>
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard className="rounded-[34px] bg-slate-950/70 p-7 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Why it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">我们不是把对战做成工具，而是把它包装成一种值得传播的资产体验。</h2>
          <div className="mt-8 space-y-4">
            {[
              "stake 让每场挑战拥有真实风险和讨论价值。",
              "观众投票与战报让流量不只停在直播页，而是继续扩散。",
              "玩家身份页沉淀了长期价值，推动持续回访。",
              "规则、惩罚与声望体系让平台像一个治理明确的竞技协议。",
            ].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">
                  0{index + 1}
                </div>
                <p className="leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="mesh-panel rounded-[34px] p-7 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Roadmap</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">当前阶段与后续演进</h2>
          <div className="mt-8 space-y-4">
            {roadmap.map((item, index) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-accentSecondary">Phase 0{index + 1}</p>
                <p className="mt-2 leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950/90 via-[#0e182b]/90 to-slate-950/90 p-7 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Top identities</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">玩家是内容引擎，不是匿名匹配对象。</h2>
            <div className="mt-6 space-y-4">
              {topPlayers.map((player) => (
                <Link key={player.slug} href={`/players/${player.slug}`} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30 hover:bg-white/10">
                  <div>
                    <p className="font-semibold text-white">{player.name}</p>
                    <p className="text-sm text-muted">{player.title}</p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p>{player.fame.toLocaleString()} Fame</p>
                    <p className="text-accentSecondary">{player.clawPoints} CP</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Share-ready routes</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">这个展示页可以独立发出去，真实产品路由继续承接深度体验。</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["/showcase", "独立产品展示页"],
                ["/challenge", "挑战擂台"],
                ["/challenge/new", "创建挑战"],
                ["/watch", "观战中心"],
                ["/rankings", "排行榜"],
                ["/rules", "规则中心"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30 hover:bg-white/10">
                  <p className="font-medium text-white">{href}</p>
                  <p className="mt-1 text-sm text-muted">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
