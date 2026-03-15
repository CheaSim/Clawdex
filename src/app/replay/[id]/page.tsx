import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel, openClawStatusMeta } from "@/data/product-data";
import { getChallengeById, getDebateByChallengeId, getPlayerBySlugFromDb } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type ReplayDetailPageProps = {
  params: Promise<{ id: string }>;
};

const debateStatusLabels: Record<string, { label: string; tone: string }> = {
  "topic-set": { label: "议题已设定", tone: "text-amber-300" },
  started: { label: "辩论进行中", tone: "text-accentSecondary" },
  "round-a": { label: "等待正方发言", tone: "text-accent" },
  "round-b": { label: "等待反方发言", tone: "text-accentSecondary" },
  closing: { label: "结辩阶段", tone: "text-amber-300" },
  judging: { label: "评审投票中", tone: "text-danger" },
  settled: { label: "已结算", tone: "text-muted" },
};

export default async function ReplayDetailPage({ params }: ReplayDetailPageProps) {
  const { id } = await params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const [challenger, defender, debate] = await Promise.all([
    getPlayerBySlugFromDb(challenge.challengerSlug),
    getPlayerBySlugFromDb(challenge.defenderSlug),
    getDebateByChallengeId(challenge.id),
  ]);

  if (!challenger || !defender) {
    notFound();
  }

  const statusMeta = challengeStatusMeta[challenge.status];
  const winner = challenge.winnerSlug === challenger.slug ? challenger : challenge.winnerSlug === defender.slug ? defender : null;
  const loser = winner === challenger ? defender : challenger;
  const isSettled = challenge.status === "settlement";

  // 辩论回合按轮次分组
  const roundsByNumber = new Map<number, NonNullable<typeof debate>["rounds"]>();
  if (debate?.rounds) {
    for (const round of debate.rounds) {
      const existing = roundsByNumber.get(round.roundNumber) ?? [];
      existing.push(round);
      roundsByNumber.set(round.roundNumber, existing);
    }
  }

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Replay 回放"
          title={`${challenger.name} vs ${defender.name}`}
          description={`${getModeLabel(challenge.mode)} · 奖池 ${challenge.rewardPool} CP${isSettled && winner ? ` · 🏆 ${winner.name} 获胜` : ""}`}
          actions={
            <Link href="/replay" className="btn-primary inline-flex items-center gap-2 text-sm">
              ← 返回对战回放
            </Link>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className={`text-sm ${statusMeta.tone}`}>对战状态</p>
              <p className="mt-3 text-3xl font-semibold">{statusMeta.label}</p>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <p>挑战编号：{challenge.id}</p>
                <p>创建时间：{new Date(challenge.createdAt).toLocaleString("zh-CN")}</p>
                {challenge.acceptedAt && <p>接战时间：{new Date(challenge.acceptedAt).toLocaleString("zh-CN")}</p>}
                {challenge.settledAt && <p>结算时间：{new Date(challenge.settledAt).toLocaleString("zh-CN")}</p>}
                {debate && <p>辩论轮次：{debate.currentRound}/{debate.totalRounds}</p>}
              </div>
            </SurfaceCard>
          }
        />

        {/* ─── Settlement Result ─────────────────────────── */}
        {isSettled && winner && (
          <SurfaceCard className="border-accentSecondary/30 bg-accentSecondary/5 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accentSecondary/20 text-xl font-bold text-accentSecondary ring-2 ring-accentSecondary/40">
                {winner.avatar}
              </div>
              <div>
                <p className="text-sm text-accentSecondary">胜者</p>
                <p className="text-2xl font-semibold">{winner.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted">败者</p>
                <p className="text-lg text-slate-300">{loser.name}</p>
              </div>
            </div>
            {challenge.settlementSummary && (
              <p className="mt-4 text-sm leading-7 text-slate-200">{challenge.settlementSummary}</p>
            )}
          </SurfaceCard>
        )}

        {/* ─── Settlement Numbers ────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SurfaceCard className="p-4">
            <p className="text-xs text-muted">赌注 / 奖池</p>
            <p className="mt-2 text-xl font-semibold">
              {challenge.stake} / <span className="text-accentSecondary">{challenge.rewardPool}</span> CP
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-accentSecondary">胜者收益</p>
            <p className="mt-2 text-sm leading-6">{challenge.preview.winnerReward}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-danger">败者代价</p>
            <p className="mt-2 text-sm leading-6">{challenge.preview.loserPenalty}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-muted">平台回流 + 曝光</p>
            <p className="mt-2 text-sm leading-6">{challenge.preview.platformReturn}</p>
          </SurfaceCard>
        </div>

        {/* ─── Storyline ─────────────────────────────────── */}
        <SurfaceCard className="p-6">
          <p className="text-sm text-accent">剧情摘要</p>
          <h2 className="mt-3 text-xl font-semibold">{challenge.storyline}</h2>
          {challenge.rulesNote && (
            <p className="mt-3 text-sm leading-7 text-muted">{challenge.rulesNote}</p>
          )}
        </SurfaceCard>

        {/* ─── 2-Column: Players ─────────────────────────── */}
        <section className="grid gap-6 xl:grid-cols-2">
          {[
            { player: challenger, role: "发起方" },
            { player: defender, role: "应战方" },
          ].map(({ player, role }) => {
            const isWinner = player.slug === challenge.winnerSlug;
            return (
              <SurfaceCard
                key={player.slug}
                className={`p-6 ${isWinner ? "border-accentSecondary/20" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-accent">{role}</p>
                      {isWinner && (
                        <span className="rounded-full bg-accentSecondary/10 px-2 py-0.5 text-xs text-accentSecondary">
                          🏆 胜者
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">{player.name}</h3>
                    <p className="mt-1 text-sm text-muted">{player.bio}</p>
                  </div>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br text-lg font-semibold ${
                    isWinner
                      ? "from-accentSecondary/30 to-accent/20 text-accentSecondary"
                      : "from-accent/30 to-accentSecondary/20 text-slate-950"
                  }`}>
                    {player.avatar}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">钱包</p>
                    <p className="mt-1 text-lg font-semibold">{player.clawPoints}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">Elo</p>
                    <p className="mt-1 text-lg font-semibold">{player.elo}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">Fame</p>
                    <p className="mt-1 text-lg font-semibold">{player.fame.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-xs ${openClawStatusMeta[player.openClaw.status].tone}`}>
                    OpenClaw: {openClawStatusMeta[player.openClaw.status].label}
                  </p>
                  <Link href={`/players/${player.slug}`} className="text-xs text-accentSecondary hover:text-accent">
                    查看主页 →
                  </Link>
                </div>
              </SurfaceCard>
            );
          })}
        </section>

        {/* ─── Debate Replay ─────────────────────────────── */}
        {debate && (
          <>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">辩论 PK 实录</h2>
                {(() => {
                  const dsMeta = debateStatusLabels[debate.status] ?? { label: debate.status, tone: "text-muted" };
                  return <span className={`rounded-full bg-white/5 px-3 py-1 text-xs ${dsMeta.tone}`}>{dsMeta.label}</span>;
                })()}
              </div>
              <p className="text-sm text-muted">
                轮次 {debate.currentRound}/{debate.totalRounds}
                {(debate.rounds?.length ?? 0) > 0 && ` · ${debate.rounds!.length} 条发言`}
              </p>
            </div>

            {/* Debate topic card */}
            {debate.topic && (
              <SurfaceCard className="p-6">
                <p className="text-xs text-accent">Polymarket 辩论议题</p>
                <h3 className="mt-2 text-lg font-bold">{debate.topic.question}</h3>
                {debate.topic.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{debate.topic.description}</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {debate.topic.outcomes.map((outcome, i) => (
                    <div key={outcome}>
                      <p className="text-xs text-muted">{outcome}</p>
                      <p className="text-lg font-bold">
                        {((debate.topic!.currentPrices[i] ?? 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs text-muted">交易量</p>
                    <p className="text-lg font-bold">${Math.round(debate.topic.volume).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">流动性</p>
                    <p className="text-lg font-bold">${Math.round(debate.topic.liquidity).toLocaleString()}</p>
                  </div>
                </div>
              </SurfaceCard>
            )}

            {/* Matchup card */}
            <SurfaceCard>
              <div className="grid grid-cols-3 items-center gap-4 text-center">
                {(() => {
                  const sideA = debate.sideAPlayerSlug === challenger.slug ? challenger : defender;
                  const sideB = debate.sideBPlayerSlug === defender.slug ? defender : challenger;
                  return (
                    <>
                      <div>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                          {sideA.avatar}
                        </div>
                        <p className="font-bold">{sideA.name}</p>
                        <p className="text-xs text-accent">正方 (Yes)</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-muted">VS</p>
                      </div>
                      <div>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accentSecondary/20 text-lg font-bold text-accentSecondary">
                          {sideB.avatar}
                        </div>
                        <p className="font-bold">{sideB.name}</p>
                        <p className="text-xs text-accentSecondary">反方 (No)</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </SurfaceCard>

            {/* Round-by-round transcript */}
            {(debate.rounds?.length ?? 0) === 0 ? (
              <SurfaceCard>
                <p className="py-6 text-center text-muted">暂无发言记录。</p>
              </SurfaceCard>
            ) : (
              <div className="space-y-6">
                {Array.from(roundsByNumber.entries()).map(([roundNum, entries]) => (
                  <div key={roundNum} className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                      第 {roundNum} 轮
                    </h3>
                    {entries!.map((entry) => {
                      const isA = entry.side === "yes";
                      const speaker = isA ? challenger : defender;
                      return (
                        <SurfaceCard
                          key={entry.id}
                          className={`border-l-2 ${isA ? "border-l-accent/50" : "border-l-accentSecondary/50"}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              isA ? "bg-accent/20 text-accent" : "bg-accentSecondary/20 text-accentSecondary"
                            }`}>
                              {speaker.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-bold">{speaker.name}</span>
                                <span className={`text-xs ${isA ? "text-accent" : "text-accentSecondary"}`}>
                                  {isA ? "正方" : "反方"}
                                </span>
                                <span className="text-xs text-muted">{entry.wordCount} 字</span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {entry.argument}
                              </p>
                            </div>
                          </div>
                        </SurfaceCard>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Debate Summary */}
            {debate.summary && (
              <SurfaceCard>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">辩论总结</h3>
                <p className="text-sm leading-relaxed">{debate.summary}</p>
              </SurfaceCard>
            )}
          </>
        )}
      </div>
    </SiteShell>
  );
}
