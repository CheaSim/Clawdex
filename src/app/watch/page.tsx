import { SiteShell } from "@/components/site-shell";
import { arenaMatches, fairPlayRules, highlights } from "@/data/site-content";

export default function WatchPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <section className="rounded-[32px] border border-white/10 bg-card/80 p-8">
          <p className="text-sm text-accent">观战中心</p>
          <h1 className="mt-3 text-4xl font-semibold">先看，再站队，再打分。</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            观战页优先承接内容流用户：直播卡片、高光回放、MVP 投票、名场面评分和 AI 战报都集中在这里，适合移动端沉浸刷内容。
          </p>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">直播与回放</h2>
              <span className="rounded-full bg-danger/10 px-3 py-1 text-xs text-danger">实时更新</span>
            </div>
            <div className="mt-6 space-y-4">
              {arenaMatches.map((match) => (
                <div key={match.hook} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-accent">{match.status}</p>
                  <h3 className="mt-2 text-xl font-semibold">{match.challenger} vs {match.defender}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{match.hook}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-white/10 px-3 py-1">胜负预测</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">MVP 投票</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">AI 战报</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-card/80 p-6">
            <h2 className="text-2xl font-semibold">热门高光切片</h2>
            <div className="mt-6 space-y-4">
              {highlights.map((highlight) => (
                <div key={highlight.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-accentSecondary">{highlight.score}</p>
                  <h3 className="mt-2 text-xl font-semibold">{highlight.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{highlight.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">观战判罚面板</h2>
            <span className="text-sm text-muted">观众和裁判共同维护公信力</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {fairPlayRules.map((rule) => (
              <article key={rule.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold">{rule.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{rule.description}</p>
                <p className="mt-3 text-sm text-danger">{rule.consequence}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
