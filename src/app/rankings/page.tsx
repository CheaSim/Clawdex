import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { getPlayerLatestBattleMap } from "@/lib/challenge-insights";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const categoryLabels = ["综合 Elo", "内容热度", "观众支持率"];

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
          eyebrow="排行榜"
          title="竞技强度和内容热度一起算，才更像一个会持续增长的社区。"
          description="这里既看 Elo，也看 Fame 和胜率。更重要的是，每位选手最近一场对战都可以直接点进回放继续追剧情。"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {rankingLeaders.map((entry, index) => (
            <Link key={entry.slug} href={`/players/${entry.slug}`}>
              <SurfaceCard className="relative overflow-hidden bg-slate-950/70 p-6 transition hover:-translate-y-1">
                <div className="absolute right-[-1rem] top-[-1rem] h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
                <p className="text-sm text-muted">{categoryLabels[index]}</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-xl font-semibold text-accent">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{entry.name}</h2>
                    <p className="text-sm text-muted">{entry.title}</p>
                  </div>
                </div>
                <p className="mt-6 text-3xl font-semibold text-accentSecondary">
                  {index === 0 ? `${entry.elo} Elo` : index === 1 ? `${entry.fame.toLocaleString()} Fame` : entry.winRate}
                </p>
              </SurfaceCard>
            </Link>
          ))}
        </div>

        <SurfaceCard className="bg-slate-950/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-accent">完整榜单</p>
              <h2 className="mt-2 text-2xl font-semibold">每位选手最近一场对战都会在这里继续带出回放流量</h2>
            </div>
            <span className="pill-muted text-sm text-slate-200">{sortedPlayers.length} 位选手</span>
          </div>

          <div className="mt-6 space-y-3">
            {sortedPlayers.map((player, index) => {
              const latestBattle = latestBattleMap[player.slug];
              const opponent = latestBattle ? playerMap[latestBattle.opponentSlug] : null;
              const latestBattleStatus = latestBattle ? challengeStatusMeta[latestBattle.status] : null;

              return (
                <div
                  key={player.slug}
                  className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 lg:grid-cols-[0.4fr_1.2fr_0.7fr_0.7fr_0.8fr_1.6fr] lg:items-center"
                >
                  <div className="text-sm font-semibold text-accentSecondary">#{index + 1}</div>

                  <Link href={`/players/${player.slug}`} className="min-w-0 transition hover:text-accent">
                    <p className="truncate text-lg font-semibold">{player.name}</p>
                    <p className="truncate text-sm text-muted">{player.title}</p>
                  </Link>

                  <div>
                    <p className="text-xs text-muted">Elo</p>
                    <p className="mt-1 text-sm font-semibold">{player.elo}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Fame</p>
                    <p className="mt-1 text-sm font-semibold">{player.fame.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">胜率</p>
                    <p className="mt-1 text-sm font-semibold">{player.winRate}</p>
                  </div>

                  <div className="min-w-0">
                    {latestBattle ? (
                      <Link
                        href={`/replay/${latestBattle.challengeId}`}
                        className="block rounded-[18px] border border-white/10 bg-slate-950/55 p-3 transition hover:border-accent/30 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold">{opponent?.name ?? latestBattle.opponentSlug}</p>
                          {latestBattleStatus ? (
                            <span className={`text-xs ${latestBattleStatus.tone}`}>{latestBattleStatus.label}</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs text-muted">
                          {getModeLabel(
                            challengeMap[latestBattle.challengeId]?.mode ?? "public-arena",
                          )}{" "}
                          · 结果 {latestBattle.result === "win" ? "胜" : latestBattle.result === "loss" ? "负" : "进行中"}
                        </p>
                        <p className="mt-2 text-xs text-accentSecondary">查看最近对战回放 →</p>
                      </Link>
                    ) : (
                      <div className="rounded-[18px] border border-white/10 bg-slate-950/55 p-3 text-sm text-muted">
                        暂无最近对战
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
