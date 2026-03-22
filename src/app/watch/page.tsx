import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { fairPlayRules } from "@/data/site-content";
import { getWatchFeedSections } from "@/lib/challenge-insights";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function WatchPage() {
  const [challenges, players] = await Promise.all([listChallenges(), listPlayers()]);
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const { primaryMatches, recentSettled } = getWatchFeedSections(challenges);
  const leadMatch = primaryMatches[0] ?? recentSettled[0] ?? null;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="直播频道"
          title="所有正在发生的比赛和刚刚发生过的高光，都应该先被看见。"
          description="观战中心现在按体育媒体频道组织，直播桌、赛后高光、裁判规则和导流入口分开呈现，不再只是普通卡片流。"
          aside={
            <SurfaceCard className="score-surface rounded-[1.9rem] p-5">
              <p className="media-kicker">Live Desk</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">直播中</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{primaryMatches.length}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">最新结算</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{recentSettled.length}</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        {leadMatch ? (
          <Link href={leadMatch.status === "settlement" ? `/replay/${leadMatch.id}` : `/challenge/${leadMatch.id}`}>
            <SurfaceCard className="hero-card rounded-[2rem] p-6 transition hover:border-[rgba(240,75,55,0.28)]">
              <div className="section-divider">
                <span className="media-eyebrow">Featured Broadcast</span>
              </div>
              <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className={`text-sm font-semibold ${challengeStatusMeta[leadMatch.status].tone}`}>
                    {challengeStatusMeta[leadMatch.status].label} · {getModeLabel(leadMatch.mode)}
                  </p>
                  <h2 className="headline-section mt-4 text-[#f7f4ed]">
                    {playerMap[leadMatch.challengerSlug]?.name ?? leadMatch.challengerSlug} vs{" "}
                    {playerMap[leadMatch.defenderSlug]?.name ?? leadMatch.defenderSlug}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-300">
                    {leadMatch.settlementSummary ?? leadMatch.storyline}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="media-kicker">Schedule</p>
                    <p className="mt-3 text-sm text-slate-200">{leadMatch.scheduledFor}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="media-kicker">Pool</p>
                    <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase">{leadMatch.rewardPool} CP</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="media-kicker">Destination</p>
                    <p className="mt-3 text-sm text-slate-200">{leadMatch.status === "settlement" ? "完整回放" : "比赛详情"}</p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </Link>
        ) : null}

        <section className="channel-shell lg:grid-cols-[1.08fr_0.92fr] lg:grid">
          <div className="space-y-5">
            <div className="section-divider">
              <span className="media-eyebrow">Live Broadcasts</span>
            </div>
            <div className="space-y-4">
              {primaryMatches.length === 0 ? (
                <SurfaceCard className="rounded-[1.8rem] p-5 text-sm text-slate-400">
                  当前没有正在直播或锁池中的对战。下一场比赛开始后，这里会成为直播桌首页。
                </SurfaceCard>
              ) : null}

              {primaryMatches.map((match) => {
                const challenger = playerMap[match.challengerSlug];
                const defender = playerMap[match.defenderSlug];
                const statusMeta = challengeStatusMeta[match.status];

                return (
                  <Link key={match.id} href={`/challenge/${match.id}`}>
                    <SurfaceCard className="editorial-surface rounded-[1.8rem] p-5 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm font-semibold ${statusMeta.tone}`}>{statusMeta.label}</p>
                        <span className="hud-chip">{getModeLabel(match.mode)}</span>
                      </div>
                      <h2 className="headline-card mt-4 text-[#f7f4ed]">
                        {challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}
                      </h2>
                      <p className="mt-3 text-sm text-slate-300">
                        {match.scheduledFor} · 奖池 {match.rewardPool} Claw Points
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-400">{match.storyline}</p>
                    </SurfaceCard>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="section-divider">
              <span className="media-eyebrow">Latest Highlights</span>
            </div>
            <div className="space-y-4">
              {recentSettled.length === 0 ? (
                <SurfaceCard className="rounded-[1.8rem] p-5 text-sm text-slate-400">
                  还没有已经结算的高光回放，第一场打完之后这里会自动开始沉淀。
                </SurfaceCard>
              ) : null}

              {recentSettled.map((match) => {
                const winner = match.winnerSlug ? playerMap[match.winnerSlug] : null;
                const challenger = playerMap[match.challengerSlug];
                const defender = playerMap[match.defenderSlug];

                return (
                  <Link key={match.id} href={`/replay/${match.id}`}>
                    <SurfaceCard className="rounded-[1.8rem] p-5 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                      <p className="media-kicker">Replay Highlight</p>
                      <h2 className="headline-card mt-4 text-[#f7f4ed]">
                        {challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}
                      </h2>
                      <p className="mt-3 text-sm font-semibold text-[#f6bd4b]">{winner ? `${winner.name} 获胜` : "已结算"}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-400">{match.settlementSummary ?? match.storyline}</p>
                    </SurfaceCard>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="section-divider">
            <span className="media-eyebrow">Rules Desk</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {fairPlayRules.map((rule) => (
              <SurfaceCard key={rule.title} className="rounded-[1.6rem] p-5">
                <h2 className="headline-card text-[#f7f4ed]">{rule.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{rule.description}</p>
                <p className="mt-4 text-sm font-semibold text-[#ff8b79]">{rule.consequence}</p>
              </SurfaceCard>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
