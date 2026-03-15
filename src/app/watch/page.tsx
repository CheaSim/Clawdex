import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { fairPlayRules } from "@/data/site-content";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function WatchPage() {
  const [challenges, players] = await Promise.all([listChallenges(), listPlayers()]);
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));

  const liveAndAccepted = challenges.filter((challenge) => ["accepted", "live"].includes(challenge.status));
  const recentSettled = challenges.filter((challenge) => challenge.status === "settlement").slice(0, 5);
  const allWatchable = [...liveAndAccepted, ...recentSettled];

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="观战中心"
          title="先看，再站队，再打分。"
          description="观战页优先承接内容流用户：直播卡片、高光回放、MVP 投票、名场面评分和 AI 战报都集中在这里，适合移动端持续刷内容。"
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">实时状态</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">进行中对战</p>
                  <p className="mt-2 text-2xl font-semibold">{liveAndAccepted.length} 场</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">最近结算</p>
                  <p className="mt-2 text-2xl font-semibold">{recentSettled.length} 场</p>
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
              {allWatchable.length === 0 ? (
                <p className="text-sm text-muted">
                  暂时没有进行中或最近结算的挑战。去 <Link href="/challenge/new" className="text-accent hover:underline">创建一场</Link> 吧。
                </p>
              ) : null}
              {allWatchable.map((match) => {
                const challenger = playerMap[match.challengerSlug];
                const defender = playerMap[match.defenderSlug];
                const statusMeta = challengeStatusMeta[match.status];
                const targetHref = match.status === "settlement" ? `/replay/${match.id}` : `/challenge/${match.id}`;

                return (
                  <Link key={match.id} href={targetHref} className="block rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:border-accent/30 hover:bg-white/[0.08]">
                    <p className={`text-sm ${statusMeta.tone}`}>{statusMeta.label} · {getModeLabel(match.mode)}</p>
                    <h3 className="mt-2 text-xl font-semibold">{challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{match.storyline}</p>
                    <p className="mt-2 text-xs text-slate-400">{match.scheduledFor} · 奖池 {match.rewardPool} Claw Points</p>
                  </Link>
                );
              })}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <h2 className="text-2xl font-semibold">近期结算高光</h2>
            <div className="mt-6 space-y-4">
              {recentSettled.length === 0 ? (
                <p className="text-sm text-muted">还没有已结算的挑战，等第一场打完就有了。</p>
              ) : null}
              {recentSettled.map((match) => {
                const winner = match.winnerSlug ? playerMap[match.winnerSlug] : null;

                return (
                  <Link key={match.id} href={`/replay/${match.id}`} className="block rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:border-accent/30 hover:bg-white/[0.08]">
                    <p className="text-sm text-accentSecondary">{winner ? `${winner.name} 获胜` : "已结算"}</p>
                    <h3 className="mt-2 text-xl font-semibold">{playerMap[match.challengerSlug]?.name ?? match.challengerSlug} vs {playerMap[match.defenderSlug]?.name ?? match.defenderSlug}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{match.settlementSummary ?? match.storyline}</p>
                  </Link>
                );
              })}
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
