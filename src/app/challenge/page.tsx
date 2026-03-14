import { SiteShell } from "@/components/site-shell";
import { arenaMatches, fairPlayRules, settlementRules } from "@/data/site-content";

export default function ChallengePage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <section className="rounded-[32px] border border-white/10 bg-card/80 p-8">
          <p className="text-sm text-accent">挑战擂台</p>
          <h1 className="mt-3 text-4xl font-semibold">守擂、复仇、爆冷，才是最容易出圈的 1v1。</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            这里不是简单的房间列表，而是剧情化的对战入口。每个挑战都带着 stakes：榜单变动、连胜纪录、宿敌关系和观众站队。
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">公开擂台</h2>
            <p className="mt-3 leading-7 text-muted">适合做爆点内容，默认支持观众投票与赛后评分。</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">宿敌挑战</h2>
            <p className="mt-3 leading-7 text-muted">持续沉淀角色关系，让回访围绕人而不是围绕房间。</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">赛季冲榜</h2>
            <p className="mt-3 leading-7 text-muted">给高水平玩家明确荣誉路径，也为观众创造稳定追更对象。</p>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-card/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">今日对战列表</h2>
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950">创建挑战</button>
          </div>
          <div className="mt-6 space-y-4">
            {arenaMatches.map((match) => (
              <div key={match.hook} className="rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-accent">{match.status}</p>
                  <h3 className="mt-2 text-xl font-semibold">{match.challenger} vs {match.defender}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{match.hook}</p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                  <button className="rounded-full border border-white/10 px-4 py-2 text-sm">围观</button>
                  <button className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">发起挑战</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-accent">赛后结算说明</p>
            <div className="mt-5 space-y-4">
              {settlementRules.map((rule) => (
                <article key={rule.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xl font-semibold">{rule.title}</h3>
                  <p className="mt-3 text-sm text-accentSecondary">{rule.reward}</p>
                  <p className="mt-2 text-sm text-danger">{rule.penalty}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-card/80 p-6">
            <p className="text-sm text-accent">公平竞赛</p>
            <div className="mt-5 space-y-4">
              {fairPlayRules.map((rule) => (
                <article key={rule.title} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
                  <h3 className="text-xl font-semibold">{rule.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{rule.description}</p>
                  <p className="mt-3 text-sm text-danger">{rule.consequence}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
