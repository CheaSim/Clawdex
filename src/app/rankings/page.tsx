import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { getPlayerLatestBattleMap } from "@/lib/challenge-insights";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const categoryLabels = ["综合 Elo", "内容热度", "胜率"];

export default async function RankingsPage() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const challengeMap = Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge]));
  const latestBattleMap = getPlayerLatestBattleMap(challenges);
  const sortedPlayers = [...players].sort((left, right) => right.elo - left.elo);
  const rankingLeaders = [
    [...players].sort((left, right) => right.elo - left.elo)[0],
    [...players].sort((left, right) => right.fame - left.fame)[0],
    [...players].sort((left, right) => Number.parseFloat(right.winRate) - Number.parseFloat(left.winRate))[0],
  ].filter(Boolean);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="联赛榜"
          title="这里不是资料表，而是整个战报站的人物主线。"
          description="排行榜按联赛榜的方式组织：领跑者、完整排名、最近对战和人物页入口都在同一个内容流里。"
        />

        <section>
          <div className="section-divider">
            <span className="media-eyebrow">Leaders</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {rankingLeaders.map((entry, index) => (
              <Link key={entry.slug} href={`/players/${entry.slug}`}>
                <SurfaceCard className="editorial-surface rounded-[1.9rem] p-6 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                  <p className="media-kicker">{categoryLabels[index]}</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="headline-card text-[#f7f4ed]">{entry.name}</h2>
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.title}</p>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(240,75,55,0.12)] font-[var(--headline-font)] text-3xl uppercase text-[#ffb9a9]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="mt-6 font-[var(--headline-font)] text-5xl uppercase text-[#f6bd4b]">
                    {index === 0 ? entry.elo : index === 1 ? entry.fame.toLocaleString() : entry.winRate}
                  </p>
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="section-divider">
            <span className="media-eyebrow">League Table</span>
          </div>
          <SurfaceCard className="mt-5 rounded-[2rem] p-6">
            <div className="grid gap-3">
              {sortedPlayers.map((player, index) => {
                const latestBattle = latestBattleMap[player.slug];
                const opponent = latestBattle ? playerMap[latestBattle.opponentSlug] : null;
                const latestBattleStatus = latestBattle ? challengeStatusMeta[latestBattle.status] : null;

                return (
                  <div
                    key={player.slug}
                    className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 xl:grid-cols-[0.35fr_1.2fr_0.8fr_0.8fr_0.8fr_1.7fr] xl:items-center"
                  >
                    <div className="font-[var(--headline-font)] text-3xl uppercase text-[#ffb9a9]">#{index + 1}</div>

                    <Link href={`/players/${player.slug}`} className="min-w-0 transition hover:text-[#ffd8c9]">
                      <p className="truncate text-lg font-semibold text-[#f7f4ed]">{player.name}</p>
                      <p className="truncate text-xs uppercase tracking-[0.12em] text-slate-400">{player.title}</p>
                    </Link>

                    <div>
                      <p className="media-kicker">Elo</p>
                      <p className="mt-2 text-sm text-slate-200">{player.elo}</p>
                    </div>

                    <div>
                      <p className="media-kicker">Fame</p>
                      <p className="mt-2 text-sm text-slate-200">{player.fame.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="media-kicker">Win Rate</p>
                      <p className="mt-2 text-sm text-slate-200">{player.winRate}</p>
                    </div>

                    <div className="min-w-0">
                      {latestBattle ? (
                        <Link
                          href={`/replay/${latestBattle.challengeId}`}
                          className="block rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3 transition hover:border-[rgba(240,75,55,0.28)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-[#f7f4ed]">{opponent?.name ?? latestBattle.opponentSlug}</p>
                            {latestBattleStatus ? (
                              <span className={`text-xs ${latestBattleStatus.tone}`}>{latestBattleStatus.label}</span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {getModeLabel(challengeMap[latestBattle.challengeId]?.mode ?? "public-arena")} · 最近结果{" "}
                            {latestBattle.result === "win" ? "胜" : latestBattle.result === "loss" ? "负" : "进行中"}
                          </p>
                        </Link>
                      ) : (
                        <div className="rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3 text-sm text-slate-500">
                          暂无最近对战
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
