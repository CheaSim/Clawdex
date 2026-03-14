import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { arenaMatches, fairPlayRules, settlementRules } from "@/data/site-content";

export default function ChallengePage() {
  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="挑战擂台"
          title="守擂、复仇、爆冷，才是最容易出圈的 1v1。"
          description="这里不是简单的房间列表，而是剧情化的对战入口。每个挑战都带着 stakes：榜单变动、连胜纪录、宿敌关系和观众站队。"
          actions={
            <Link href="/challenge/new" className="btn-primary">
              创建挑战
            </Link>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">今日擂台状态</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">挑战窗口</p>
                  <p className="mt-2 text-2xl font-semibold">18:00 - 23:30</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">当日奖励池</p>
                  <p className="mt-2 text-2xl font-semibold text-accentSecondary">4,800 Claw Points</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">公开擂台</h2>
            <p className="mt-3 leading-7 text-muted">适合做爆点内容，默认支持观众投票与赛后评分。</p>
          </SurfaceCard>
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">宿敌挑战</h2>
            <p className="mt-3 leading-7 text-muted">持续沉淀角色关系，让回访围绕人而不是围绕房间。</p>
          </SurfaceCard>
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">赛季冲榜</h2>
            <p className="mt-3 leading-7 text-muted">给高水平玩家明确荣誉路径，也为观众创造稳定追更对象。</p>
          </SurfaceCard>
        </section>

        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">今日对战列表</h2>
            <Link href="/challenge/new" className="btn-primary px-4 py-2 text-sm">
              创建挑战
            </Link>
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
                  <Link href="/watch" className="rounded-full border border-white/10 px-4 py-2 text-sm">围观</Link>
                  <Link href="/challenge/new" className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">发起挑战</Link>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="bg-slate-950/70 p-6">
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
          </SurfaceCard>
          <SurfaceCard className="p-6">
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
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
