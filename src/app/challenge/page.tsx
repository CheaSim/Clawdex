import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { fairPlayRules, settlementRules } from "@/data/site-content";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function ChallengePage() {
  const [challengeRecords, playerRecords] = await Promise.all([listChallenges(), listPlayers()]);
  const playerMap = Object.fromEntries(playerRecords.map((player) => [player.slug, player]));
  const spotlightChallenges = challengeRecords.slice(0, 6);

  const activeBattles = challengeRecords.filter((c) => ["accepted", "live"].includes(c.status)).length;
  const dailyPool = challengeRecords
    .filter((c) => c.status !== "settlement")
    .reduce((sum, c) => sum + c.rewardPool, 0);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="挑战擂台"
          title="守擂、复仇、爆冷，才是最容易出圈的 1v1。"
          description="这里不是房间列表，而是剧情化的对战入口。每场挑战都牵动奖池、榜单、连胜纪录和观众站队。"
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
                  <p className="text-xs text-muted">进行中对战</p>
                  <p className="mt-2 text-2xl font-semibold">{activeBattles} 场</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">当前锁池总量</p>
                  <p className="mt-2 text-2xl font-semibold text-accentSecondary">{dailyPool.toLocaleString()} Claw Points</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">公开擂台</h2>
            <p className="mt-3 leading-7 text-muted">最适合做爆点内容，天然适配观众投票、赛后评分和首页推荐。</p>
          </SurfaceCard>
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">宿敌对决</h2>
            <p className="mt-3 leading-7 text-muted">持续沉淀人物关系，让用户回访是为了追角色，而不是追房间号。</p>
          </SurfaceCard>
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-muted">模式</p>
            <h2 className="mt-3 text-2xl font-semibold">排位冲榜</h2>
            <p className="mt-3 leading-7 text-muted">给高水平玩家明确的荣誉路径，也给观众稳定的关注对象。</p>
          </SurfaceCard>
        </section>

        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">当前挑战列表</h2>
            <Link href="/challenge/new" className="btn-primary px-4 py-2 text-sm">
              创建挑战
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {spotlightChallenges.map((match) => {
              const challenger = playerMap[match.challengerSlug];
              const defender = playerMap[match.defenderSlug];
              const statusMeta = challengeStatusMeta[match.status];

              return (
                <div key={match.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex md:items-center md:justify-between">
                  <div>
                    <p className={`text-sm ${statusMeta.tone}`}>{statusMeta.label}</p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{getModeLabel(match.mode)} · {match.scheduledFor} · 奖池 {match.rewardPool} Claw Points</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{match.storyline}</p>
                  </div>
                  <div className="mt-4 flex gap-3 md:mt-0">
                    <Link href={`/challenge/${match.id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm">查看详情</Link>
                    <Link href="/challenge/new" className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">发起挑战</Link>
                  </div>
                </div>
              );
            })}
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
                  <p className="mt-2 text-sm leading-6 text-muted">{rule.detail}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">公平竞技</p>
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
