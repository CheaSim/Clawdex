import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { listChallenges, listDebates, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const debateStatusLabels: Record<string, string> = {
  "topic-set": "议题已设定",
  started: "进行中",
  "round-a": "正方发言",
  "round-b": "反方发言",
  closing: "结辩",
  judging: "评审中",
  settled: "已结算",
};

export default async function ReplayPage() {
  const [challenges, debates, players] = await Promise.all([
    listChallenges(),
    listDebates(),
    listPlayers(),
  ]);
  const playerMap = Object.fromEntries(players.map((p) => [p.slug, p]));
  const debateMap = Object.fromEntries(debates.map((d) => [d.challengeId, d]));

  // 已结算的 challenge 优先展示、其次是 live / accepted
  const settled = challenges.filter((c) => c.status === "settlement");
  const liveOrAccepted = challenges.filter((c) => ["accepted", "live"].includes(c.status));
  const pending = challenges.filter((c) => c.status === "pending");
  const allSorted = [...settled, ...liveOrAccepted, ...pending];

  const totalSettled = settled.length;
  const totalDebateRounds = debates.reduce((s, d) => s + (d.rounds?.length ?? 0), 0);
  const totalRewardPool = settled.reduce((s, c) => s + c.rewardPool, 0);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Replay 战绩回顾"
          title="每场对战，都是一段可重播的故事。"
          description="所有挑战和辩论的完整历史——对阵、剧情、结算、回合实录全部沉淀在这里，供观众复盘和选手学习。"
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">历史统计</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">已结算对战</p>
                  <p className="mt-2 text-2xl font-semibold">{totalSettled} 场</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">累计辩论发言</p>
                  <p className="mt-2 text-2xl font-semibold">{totalDebateRounds} 条</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-muted">累计结算奖池</p>
                  <p className="mt-2 text-2xl font-semibold text-accentSecondary">{totalRewardPool.toLocaleString()} CP</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        {/* ─── Filter Tabs ──────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            全部 ({allSorted.length})
          </span>
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
            已结算 ({settled.length})
          </span>
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
            进行中 ({liveOrAccepted.length})
          </span>
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
            含辩论 ({debates.length})
          </span>
        </div>

        {/* ─── Timeline ─────────────────────────────────── */}
        {allSorted.length === 0 ? (
          <SurfaceCard>
            <p className="py-12 text-center text-muted">
              暂无对战记录。<Link href="/challenge/new" className="text-accent hover:underline">去创建第一场挑战</Link> 吧。
            </p>
          </SurfaceCard>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 hidden h-full w-px bg-white/10 md:block" />

            {allSorted.map((match, idx) => {
              const challenger = playerMap[match.challengerSlug];
              const defender = playerMap[match.defenderSlug];
              const winner = match.winnerSlug ? playerMap[match.winnerSlug] : null;
              const loserSlug = match.winnerSlug === match.challengerSlug ? match.defenderSlug : match.challengerSlug;
              const loser = playerMap[loserSlug];
              const statusMeta = challengeStatusMeta[match.status];
              const debate = debateMap[match.id];
              const isSettled = match.status === "settlement";

              return (
                <div key={match.id} className="relative md:pl-14">
                  {/* Timeline dot */}
                  <div className={`absolute left-3.5 top-6 hidden h-3 w-3 rounded-full md:block ${
                    isSettled
                      ? "bg-accentSecondary shadow-[0_0_8px_rgba(var(--color-accentSecondary),0.4)]"
                      : match.status === "live"
                        ? "bg-danger animate-pulse"
                        : "bg-white/30"
                  }`} />

                  <Link href={debate ? `/debate/${debate.id}` : `/challenge/${match.id}`}>
                    <SurfaceCard className="mb-4 transition hover:border-accent/30 hover:bg-white/[0.04]">
                      {/* Header row */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${statusMeta.tone}`}>{statusMeta.label}</span>
                          <span className="pill-muted text-xs">{getModeLabel(match.mode)}</span>
                          {debate && (
                            <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-xs text-accent">
                              辩论 PK
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted">
                          {new Date(match.settledAt ?? match.acceptedAt ?? match.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>

                      {/* Matchup */}
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            match.winnerSlug === match.challengerSlug
                              ? "bg-accentSecondary/20 text-accentSecondary ring-2 ring-accentSecondary/40"
                              : "bg-white/10 text-slate-300"
                          }`}>
                            {challenger?.avatar ?? "?"}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${match.winnerSlug === match.challengerSlug ? "text-accentSecondary" : ""}`}>
                              {challenger?.name ?? match.challengerSlug}
                            </p>
                            <p className="text-xs text-muted">Elo {challenger?.elo ?? "?"}</p>
                          </div>
                        </div>

                        <div className="px-3">
                          <span className="text-lg font-black text-muted">VS</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            match.winnerSlug === match.defenderSlug
                              ? "bg-accentSecondary/20 text-accentSecondary ring-2 ring-accentSecondary/40"
                              : "bg-white/10 text-slate-300"
                          }`}>
                            {defender?.avatar ?? "?"}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${match.winnerSlug === match.defenderSlug ? "text-accentSecondary" : ""}`}>
                              {defender?.name ?? match.defenderSlug}
                            </p>
                            <p className="text-xs text-muted">Elo {defender?.elo ?? "?"}</p>
                          </div>
                        </div>

                        {/* Reward Pool badge */}
                        <div className="ml-auto text-right">
                          <p className="text-lg font-bold">{match.rewardPool}</p>
                          <p className="text-xs text-muted">CP 奖池</p>
                        </div>
                      </div>

                      {/* Storyline / Settlement */}
                      <div className="mt-4 space-y-2">
                        {isSettled && winner ? (
                          <div className="flex items-center gap-2 rounded-2xl border border-accentSecondary/20 bg-accentSecondary/5 px-4 py-2.5">
                            <span className="text-sm">🏆</span>
                            <span className="text-sm font-semibold text-accentSecondary">{winner.name} 获胜</span>
                            {match.settlementSummary && (
                              <span className="text-sm text-muted">— {match.settlementSummary}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed text-muted">{match.storyline}</p>
                        )}
                      </div>

                      {/* Debate preview (if associated) */}
                      {debate && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-accent">辩论议题</p>
                              <p className="mt-1 text-sm font-semibold">{debate.topic?.question ?? "未知议题"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted">{debateStatusLabels[debate.status] ?? debate.status}</p>
                              <p className="mt-1 text-xs text-muted">
                                {debate.currentRound}/{debate.totalRounds} 轮
                                {(debate.rounds?.length ?? 0) > 0 && ` · ${debate.rounds!.length} 条发言`}
                              </p>
                            </div>
                          </div>

                          {/* Mini transcript preview — last 2 rounds */}
                          {debate.rounds && debate.rounds.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {debate.rounds.slice(-2).map((round) => {
                                const isA = round.side === "yes";
                                const speaker = isA
                                  ? playerMap[debate.sideAPlayerSlug]
                                  : playerMap[debate.sideBPlayerSlug];
                                return (
                                  <div
                                    key={round.id}
                                    className={`flex items-start gap-2 rounded-xl px-3 py-2 ${
                                      isA ? "border-l-2 border-l-accent/40 bg-accent/5" : "border-l-2 border-l-accentSecondary/40 bg-accentSecondary/5"
                                    }`}
                                  >
                                    <span className={`shrink-0 text-xs font-bold ${isA ? "text-accent" : "text-accentSecondary"}`}>
                                      {speaker?.name ?? round.playerSlug}
                                    </span>
                                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">
                                      {round.argument}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Polymarket odds */}
                          {debate.topic && (
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                              <span>Polymarket:</span>
                              {debate.topic.outcomes.map((outcome, i) => (
                                <span key={outcome}>
                                  {outcome} {((debate.topic!.currentPrices[i] ?? 0) * 100).toFixed(0)}%
                                </span>
                              ))}
                              <span className="ml-auto">Vol ${Math.round(debate.topic.volume).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Settlement preview */}
                      {isSettled && (
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                            <p className="text-xs text-muted">胜者收益</p>
                            <p className="mt-1 text-xs text-accentSecondary">{match.preview.winnerReward}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                            <p className="text-xs text-muted">败者代价</p>
                            <p className="mt-1 text-xs text-danger">{match.preview.loserPenalty}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                            <p className="text-xs text-muted">平台回流</p>
                            <p className="mt-1 text-xs">{match.preview.platformReturn}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                            <p className="text-xs text-muted">曝光加成</p>
                            <p className="mt-1 text-xs">{match.preview.exposureBonus}</p>
                          </div>
                        </div>
                      )}
                    </SurfaceCard>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
