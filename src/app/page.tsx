import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { arenaMatches, economyOverview, featureCards, heroMetrics, highlights, rankingLeaders, settlementRules } from "@/data/site-content";
import { players } from "@/data/product-data";

export default function Home() {
  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="爆款版默认首页"
          title="把每一场 OpenClaw 1v1，做成值得围观、站队和分享的故事。"
          description="Clawdex 不是冷冰冰的匹配大厅，而是内容先行的竞技社区：高光切片、挑战擂台、观众投票、AI 战报，把玩家和观众同时卷进来。"
          actions={
            <>
              <Link href="/watch" className="btn-primary text-center">
                进入观战中心
              </Link>
              <Link href="/challenge" className="btn-secondary text-center">
                查看今日擂台
              </Link>
              <Link href="/challenge/new" className="btn-secondary text-center">
                创建挑战
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/50 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">正在发生</h2>
                <span className="pill-accent bg-danger/10 text-danger">LIVE</span>
              </div>
              <div className="mt-5 space-y-3">
                {arenaMatches.map((match) => (
                  <div key={`${match.challenger}-${match.defender}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-accent">{match.status}</p>
                    <h3 className="mt-2 text-lg font-semibold">{match.challenger} vs {match.defender}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{match.hook}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          {heroMetrics.map((metric) => (
            <SurfaceCard key={metric.label} className="relative overflow-hidden bg-slate-950/55 p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
              <p className="relative text-sm text-muted">{metric.label}</p>
              <p className="relative mt-2 text-3xl font-semibold">{metric.value}</p>
              <p className="relative mt-2 text-sm text-slate-300">{metric.detail}</p>
            </SurfaceCard>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <SurfaceCard key={feature.title} className="group relative overflow-hidden bg-white/5 p-6 transition hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accentSecondary to-accent opacity-70" />
              <p className="text-sm text-accentSecondary">核心爆点</p>
              <h3 className="mt-3 text-2xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-muted">{feature.description}</p>
            </SurfaceCard>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-accent">胜负必须有后果</p>
            <h2 className="mt-2 text-3xl font-semibold">奖励与惩罚系统</h2>
            <p className="mt-3 leading-7 text-muted">
              每场 1v1 都有押注、积分、热度与曝光结算。赢的人拿奖励，输的人承担真实代价，才能让社区故事持续发生。
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {economyOverview.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-accentSecondary">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.hint}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">赛后结算</p>
                <h2 className="mt-2 text-3xl font-semibold">不同对战，不同 stakes</h2>
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
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">可刷内容流</p>
                <h2 className="mt-2 text-3xl font-semibold">热门高光</h2>
              </div>
              <Link href="/watch" className="text-sm text-slate-300 transition hover:text-accent">
                查看更多 →
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {highlights.map((highlight) => (
                <article key={highlight.title} className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 transition hover:border-accent/30 hover:bg-slate-950/75">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">{highlight.tag}</span>
                    <span className="text-slate-300">{highlight.viewers}</span>
                    <span className="text-accentSecondary">{highlight.score}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">{highlight.title}</h3>
                  <p className="mt-3 max-w-3xl leading-7 text-muted">{highlight.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 px-3 py-1">投 MVP</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">打分名场面</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">分享战报</span>
                    <Link href={`/players/${players[Math.min(1, players.length - 1)]?.slug ?? "nightpaw"}`} className="rounded-full border border-accent/20 px-3 py-1 text-accent">
                      查看选手
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <p className="text-sm text-accent">爆款玩法</p>
              <h2 className="mt-2 text-3xl font-semibold">挑战擂台</h2>
              <p className="mt-3 leading-7 text-muted">
                用守擂、复仇、爆冷和连胜打造连续剧情，让每一场 1v1 都不止是一条记录，而是一段可追更的内容线。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm">守擂奖励</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm">宿敌标签</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm">周榜冲刺</span>
              </div>
            </SurfaceCard>

            <SurfaceCard className="bg-slate-950/70 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">今日排行榜</h2>
                <Link href="/rankings" className="text-sm text-slate-300 transition hover:text-accent">
                  全部榜单 →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {rankingLeaders.map((entry, index) => (
                  <Link key={entry.name} href={`/players/${players[index]?.slug ?? players[0]?.slug ?? "frostclaw"}`} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-accent/30 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-lg font-semibold text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.name}</p>
                        <p className="text-sm text-muted">{entry.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-accentSecondary">{entry.value}</p>
                  </Link>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
