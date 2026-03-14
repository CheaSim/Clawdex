import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { arenaMatches, economyOverview, featureCards, heroMetrics, highlights, rankingLeaders, settlementRules } from "@/data/site-content";

export default function Home() {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8 lg:py-14">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-card/80 p-8 shadow-glow">
            <div className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              爆款版默认首页
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              把每一场 OpenClaw 1v1，做成值得围观、站队和分享的故事。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
              Clawdex 不是冷冰冰的匹配大厅，而是内容先行的竞技社区：高光切片、挑战擂台、观众投票、AI 战报，把玩家和观众同时卷进来。
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/watch" className="rounded-full bg-accent px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-white">
                进入观战中心
              </Link>
              <Link href="/challenge" className="rounded-full border border-white/10 px-6 py-3 text-center font-semibold transition hover:border-accent/40 hover:text-accent">
                查看今日擂台
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm text-muted">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">正在发生</h2>
              <span className="rounded-full bg-danger/10 px-3 py-1 text-xs text-danger">LIVE</span>
            </div>
            <div className="mt-6 space-y-4">
              {arenaMatches.map((match) => (
                <div key={`${match.challenger}-${match.defender}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-accent">{match.status}</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {match.challenger} vs {match.defender}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{match.hook}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article key={feature.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-accentSecondary">核心爆点</p>
              <h3 className="mt-3 text-2xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-muted">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
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
          </div>

          <div className="rounded-[32px] border border-white/10 bg-card/80 p-6">
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
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-card/80 p-6">
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
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-card/80 p-6">
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
            </section>

            <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">今日排行榜</h2>
                <Link href="/rankings" className="text-sm text-slate-300 transition hover:text-accent">
                  全部榜单 →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {rankingLeaders.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
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
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
