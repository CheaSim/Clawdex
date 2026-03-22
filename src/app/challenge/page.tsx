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
  const fixtureCards = challengeRecords.slice(0, 8);
  const activeBattles = challengeRecords.filter((c) => ["accepted", "live"].includes(c.status)).length;
  const pendingBattles = challengeRecords.filter((c) => c.status === "pending").length;
  const dailyPool = challengeRecords.filter((c) => c.status !== "settlement").reduce((sum, c) => sum + c.rewardPool, 0);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="今日赛程"
          title="这里不是随机匹配列表，而是整站的对阵版与赛程页。"
          description="所有挑战会以赛程、焦点战、模式分区和赛后结算的形式出现。功能入口还在，但不再占据第一视觉。"
          actions={
            <>
              <Link href="/challenge/new" className="btn-primary">
                提交一场新对决
              </Link>
              <Link href="/watch" className="btn-secondary">
                返回直播频道
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="score-surface rounded-[1.9rem] p-5">
              <p className="media-kicker">Match Desk</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">直播 / 锁池</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{activeBattles}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">待接战</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{pendingBattles}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">锁池总量</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{dailyPool}</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <section>
          <div className="section-divider">
            <span className="media-eyebrow">Fixtures</span>
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {fixtureCards.map((match) => {
              const challenger = playerMap[match.challengerSlug];
              const defender = playerMap[match.defenderSlug];
              const statusMeta = challengeStatusMeta[match.status];

              return (
                <Link key={match.id} href={`/challenge/${match.id}`}>
                  <SurfaceCard className="editorial-surface rounded-[1.9rem] p-5 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-semibold ${statusMeta.tone}`}>{statusMeta.label}</p>
                      <span className="hud-chip">{getModeLabel(match.mode)}</span>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-[var(--headline-font)] text-xl text-[#f7f4ed]">
                          {challenger?.avatar ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-[#f7f4ed]">{challenger?.name ?? match.challengerSlug}</p>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{challenger?.title ?? "Player"}</p>
                        </div>
                      </div>

                      <div className="px-2 font-[var(--headline-font)] text-3xl uppercase text-slate-500">VS</div>

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-[var(--headline-font)] text-xl text-[#f7f4ed]">
                          {defender?.avatar ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-[#f7f4ed]">{defender?.name ?? match.defenderSlug}</p>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{defender?.title ?? "Player"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3">
                        <p className="media-kicker">Time</p>
                        <p className="mt-2 text-sm text-slate-200">{match.scheduledFor}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3">
                        <p className="media-kicker">Pool</p>
                        <p className="mt-2 font-[var(--headline-font)] text-3xl uppercase">{match.rewardPool}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3">
                        <p className="media-kicker">Entry</p>
                        <p className="mt-2 text-sm text-slate-200">查看对阵详情</p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-400">{match.storyline}</p>
                  </SurfaceCard>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="channel-shell lg:grid-cols-[1fr_1fr] lg:grid">
          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Settlement Notes</span>
            </div>
            <div className="mt-5 space-y-3">
              {settlementRules.map((rule) => (
                <article key={rule.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <h2 className="headline-card text-[#f7f4ed]">{rule.title}</h2>
                  <p className="mt-3 text-sm font-semibold text-[#f6bd4b]">{rule.reward}</p>
                  <p className="mt-2 text-sm font-semibold text-[#ff8b79]">{rule.penalty}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{rule.detail}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Discipline Desk</span>
            </div>
            <div className="mt-5 space-y-3">
              {fairPlayRules.map((rule) => (
                <article key={rule.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <h2 className="headline-card text-[#f7f4ed]">{rule.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{rule.description}</p>
                  <p className="mt-3 text-sm font-semibold text-[#ff8b79]">{rule.consequence}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
