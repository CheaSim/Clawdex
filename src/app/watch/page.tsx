import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { arenaMatches, fairPlayRules, highlights } from "@/data/site-content";

export default function WatchPage() {
  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="观战中心"
          title="先看，再站队，再打分。"
          description="观战页优先承接内容流用户：直播卡片、高光回放、MVP 投票、名场面评分和 AI 战报都集中在这里，适合移动端沉浸刷内容。"
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">本场看点</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">观众参与</p>
                  <p className="mt-2 text-2xl font-semibold">MVP + 胜负票 + 名场面评分</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">转化目标</p>
                  <p className="mt-2 text-2xl font-semibold">从围观者转成站队者</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="bg-slate-950/70 p-6">
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
          </SurfaceCard>

          <SurfaceCard className="p-6">
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
          </SurfaceCard>
        </div>

        <SurfaceCard className="mt-2 bg-slate-950/70 p-6">
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
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
