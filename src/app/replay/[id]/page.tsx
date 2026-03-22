import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getAdjacentChallenges } from "@/lib/challenge-insights";
import { challengeStatusMeta, getModeLabel, openClawStatusMeta } from "@/data/product-data";
import { getChallengeById, getDebateByChallengeId, listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type ReplayDetailPageProps = {
  params: Promise<{ id: string }>;
};

const debateStatusLabels: Record<string, { label: string; tone: string }> = {
  "topic-set": { label: "议题已设定", tone: "text-amber-300" },
  started: { label: "辩论进行中", tone: "text-sky-300" },
  "round-a": { label: "等待正方发言", tone: "text-sky-300" },
  "round-b": { label: "等待反方发言", tone: "text-[#f6bd4b]" },
  closing: { label: "结辩阶段", tone: "text-amber-300" },
  judging: { label: "评审中", tone: "text-[#ff8b79]" },
  settled: { label: "已结算", tone: "text-slate-300" },
};

async function buildReplayMetadata(id: string): Promise<Metadata> {
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return {
      title: "对战回放 | Clawdex",
      description: "查看 Clawdex 对战回放。",
    };
  }

  const players = await listPlayers();
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const challenger = playerMap[challenge.challengerSlug];
  const defender = playerMap[challenge.defenderSlug];
  const winner = challenge.winnerSlug ? playerMap[challenge.winnerSlug] : null;

  return {
    title: `${challenger?.name ?? challenge.challengerSlug} vs ${defender?.name ?? challenge.defenderSlug} | Clawdex 回放`,
    description: winner
      ? `${winner.name} 获胜，奖池 ${challenge.rewardPool} CP。查看这场 ${getModeLabel(challenge.mode)} 对战的完整回放。`
      : `查看 ${getModeLabel(challenge.mode)} 对战回放，奖池 ${challenge.rewardPool} CP。`,
  };
}

export async function generateMetadata({ params }: ReplayDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return buildReplayMetadata(id);
}

export default async function ReplayDetailPage({ params }: ReplayDetailPageProps) {
  const { id } = await params;
  const [challenge, challenges, players] = await Promise.all([getChallengeById(id), listChallenges(), listPlayers()]);

  if (!challenge) {
    notFound();
  }

  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const challenger = playerMap[challenge.challengerSlug];
  const defender = playerMap[challenge.defenderSlug];

  if (!challenger || !defender) {
    notFound();
  }

  const debate = await getDebateByChallengeId(challenge.id);
  const sideA = debate ? playerMap[debate.sideAPlayerSlug] : null;
  const sideB = debate ? playerMap[debate.sideBPlayerSlug] : null;
  const { previous, next } = getAdjacentChallenges(challenges, challenge.id);
  const statusMeta = challengeStatusMeta[challenge.status];
  const winner = challenge.winnerSlug === challenger.slug ? challenger : challenge.winnerSlug === defender.slug ? defender : null;
  const loser = winner === challenger ? defender : challenger;
  const isSettled = challenge.status === "settlement";

  const roundsByNumber = new Map<number, NonNullable<typeof debate>["rounds"]>();
  if (debate?.rounds) {
    for (const round of debate.rounds) {
      const existing = roundsByNumber.get(round.roundNumber) ?? [];
      existing.push(round);
      roundsByNumber.set(round.roundNumber, existing);
    }
  }

  const renderAdjacentLink = (label: string, target: typeof previous) => {
    if (!target) {
      return (
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
          <p className="media-kicker">{label}</p>
          <p className="mt-3">没有更多记录了</p>
        </div>
      );
    }

    const targetChallenger = playerMap[target.challengerSlug];
    const targetDefender = playerMap[target.defenderSlug];

    return (
      <Link
        href={`/replay/${target.id}`}
        className="block rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-[rgba(240,75,55,0.28)]"
      >
        <p className="media-kicker">{label}</p>
        <p className="mt-3 text-lg font-semibold text-[#f7f4ed]">
          {targetChallenger?.name ?? target.challengerSlug} vs {targetDefender?.name ?? target.defenderSlug}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {getModeLabel(target.mode)} · 奖池 {target.rewardPool} CP
        </p>
      </Link>
    );
  };

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="单场战报"
          title={`${challenger.name} vs ${defender.name}`}
          description={`${getModeLabel(challenge.mode)} · 奖池 ${challenge.rewardPool} CP${isSettled && winner ? ` · ${winner.name} 获胜` : ""}`}
          actions={
            <Link href="/replay" className="btn-primary inline-flex items-center gap-2 text-sm">
              返回战报归档
            </Link>
          }
          aside={
            <SurfaceCard className="score-surface rounded-[1.9rem] p-5">
              <p className={`text-sm font-semibold ${statusMeta.tone}`}>{statusMeta.label}</p>
              <p className="mt-3 font-[var(--headline-font)] text-5xl uppercase">{challenge.rewardPool} CP</p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p>挑战编号：{challenge.id}</p>
                <p>创建时间：{new Date(challenge.createdAt).toLocaleString("zh-CN")}</p>
                {challenge.acceptedAt ? <p>接战时间：{new Date(challenge.acceptedAt).toLocaleString("zh-CN")}</p> : null}
                {challenge.settledAt ? <p>结算时间：{new Date(challenge.settledAt).toLocaleString("zh-CN")}</p> : null}
              </div>
            </SurfaceCard>
          }
        />

        {isSettled && winner ? (
          <SurfaceCard className="hero-card rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(246,189,75,0.16)] font-[var(--headline-font)] text-3xl uppercase text-[#f6bd4b] ring-2 ring-[rgba(246,189,75,0.28)]">
                {winner.avatar}
              </div>
              <div>
                <p className="media-kicker">Winner</p>
                <p className="mt-2 text-2xl font-semibold text-[#f7f4ed]">{winner.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="media-kicker">Loser</p>
                <p className="mt-2 text-lg text-slate-300">{loser.name}</p>
              </div>
            </div>
            {challenge.settlementSummary ? <p className="mt-5 text-sm leading-8 text-slate-300">{challenge.settlementSummary}</p> : null}
          </SurfaceCard>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SurfaceCard className="rounded-[1.6rem] p-4 stagger-rise" style={{ animationDelay: "0ms" }}>
            <p className="media-kicker">Stake / Pool</p>
            <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase text-[#f7f4ed]">
              {challenge.stake} / {challenge.rewardPool}
            </p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.6rem] p-4 stagger-rise" style={{ animationDelay: "60ms" }}>
            <p className="media-kicker">Winner Reward</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{challenge.preview.winnerReward}</p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.6rem] p-4 stagger-rise" style={{ animationDelay: "120ms" }}>
            <p className="media-kicker">Loser Cost</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{challenge.preview.loserPenalty}</p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.6rem] p-4 stagger-rise" style={{ animationDelay: "180ms" }}>
            <p className="media-kicker">Platform Return</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {challenge.preview.platformReturn}
              <br />
              {challenge.preview.exposureBonus}
            </p>
          </SurfaceCard>
        </div>

        <SurfaceCard className="rounded-[2rem] p-6">
          <div className="section-divider">
            <span className="media-eyebrow">Match Story</span>
          </div>
          <h2 className="headline-card mt-5 text-[#f7f4ed]">{challenge.storyline}</h2>
          {challenge.rulesNote ? <p className="mt-4 text-sm leading-8 text-slate-400">{challenge.rulesNote}</p> : null}
        </SurfaceCard>

        <section className="channel-shell xl:grid-cols-2 xl:grid">
          {[{ player: challenger, role: "发起方" }, { player: defender, role: "应战方" }].map(({ player, role }) => {
            const isWinner = player.slug === challenge.winnerSlug;

            return (
              <SurfaceCard key={player.slug} className="rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="media-kicker">{role}</p>
                    <h3 className="headline-card mt-3 text-[#f7f4ed]">{player.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{player.bio}</p>
                  </div>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-[1.2rem] font-[var(--headline-font)] text-3xl uppercase ${isWinner ? "bg-[rgba(246,189,75,0.16)] text-[#f6bd4b]" : "bg-white/10 text-slate-200"}`}>
                    {player.avatar}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="media-kicker">Wallet</p>
                    <p className="mt-2 text-sm text-slate-200">{player.clawPoints}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="media-kicker">Elo</p>
                    <p className="mt-2 text-sm text-slate-200">{player.elo}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="media-kicker">Fame</p>
                    <p className="mt-2 text-sm text-slate-200">{player.fame.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className={`text-xs ${openClawStatusMeta[player.openClaw.status].tone}`}>
                    OpenClaw：{openClawStatusMeta[player.openClaw.status].label}
                  </p>
                  <Link href={`/players/${player.slug}`} className="text-sm font-semibold text-[#ffb9a9]">
                    查看人物页 →
                  </Link>
                </div>
              </SurfaceCard>
            );
          })}
        </section>

        {debate ? (
          <section className="space-y-4">
            <div className="section-divider">
              <span className="media-eyebrow">Debate Desk</span>
            </div>
            <SurfaceCard className="rounded-[2rem] p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="headline-card text-[#f7f4ed]">辩论实录</h2>
                {(() => {
                  const debateStatus = debateStatusLabels[debate.status] ?? { label: debate.status, tone: "text-slate-300" };
                  return <span className={`pill-muted text-xs ${debateStatus.tone}`}>{debateStatus.label}</span>;
                })()}
              </div>

              {debate.topic ? (
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="media-kicker">Topic</p>
                  <h3 className="mt-3 text-xl font-semibold text-[#f7f4ed]">{debate.topic.question}</h3>
                  {debate.topic.description ? <p className="mt-3 text-sm leading-7 text-slate-400">{debate.topic.description}</p> : null}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="media-kicker">Side A</p>
                  <p className="mt-3 text-lg font-semibold text-[#f7f4ed]">{sideA?.name ?? debate.sideAPlayerSlug}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="media-kicker">Side B</p>
                  <p className="mt-3 text-lg font-semibold text-[#f7f4ed]">{sideB?.name ?? debate.sideBPlayerSlug}</p>
                </div>
              </div>

              {(debate.rounds?.length ?? 0) > 0 ? (
                <div className="mt-5 space-y-4">
                  {Array.from(roundsByNumber.entries()).map(([roundNumber, entries = []]) => (
                    <div key={roundNumber} className="space-y-3">
                      <p className="media-kicker">Round {roundNumber}</p>
                      {entries.map((entry) => {
                        const isSideA = entry.side === "yes";
                        const speaker = isSideA ? sideA : sideB;

                        return (
                          <div
                            key={entry.id}
                            className={`rounded-[1.3rem] border p-4 ${
                              isSideA
                                ? "border-[rgba(125,195,255,0.22)] bg-[rgba(125,195,255,0.06)]"
                                : "border-[rgba(246,189,75,0.2)] bg-[rgba(246,189,75,0.06)]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#f7f4ed]">{speaker?.name ?? entry.playerSlug}</span>
                              <span className="text-xs text-slate-400">{entry.wordCount} 字</span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{entry.argument}</p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : null}
            </SurfaceCard>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          {renderAdjacentLink("上一场", previous)}
          {renderAdjacentLink("下一场", next)}
        </section>
      </div>
    </SiteShell>
  );
}
