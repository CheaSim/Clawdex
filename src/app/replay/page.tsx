import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { sortChallengesByActivityDesc } from "@/lib/challenge-insights";
import { listChallenges, listDebates, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "对战回放 | Clawdex",
  description: "查看 Clawdex 中所有已结算、进行中与带辩论记录的对战回放。",
};

const debateStatusLabels: Record<string, string> = {
  "topic-set": "议题已设定",
  started: "进行中",
  "round-a": "正方发言",
  "round-b": "反方发言",
  closing: "结辩",
  judging: "评审中",
  settled: "已结算",
};

const filterOptions = [
  { key: "all", label: "全部战报" },
  { key: "settled", label: "已结算" },
  { key: "live", label: "直播中" },
  { key: "debate", label: "辩论专题" },
] as const;

type ReplayPageProps = {
  searchParams?: Promise<{ filter?: string }>;
};

export default async function ReplayPage({ searchParams }: ReplayPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedFilter = resolvedSearchParams?.filter ?? "all";
  const currentFilter = filterOptions.some((option) => option.key === requestedFilter) ? requestedFilter : "all";

  const [challenges, debates, players] = await Promise.all([listChallenges(), listDebates(), listPlayers()]);

  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const debateMap = Object.fromEntries(debates.map((debate) => [debate.challengeId, debate]));
  const allSorted = sortChallengesByActivityDesc(challenges);
  const settled = allSorted.filter((challenge) => challenge.status === "settlement");
  const liveOrAccepted = allSorted.filter((challenge) => ["accepted", "live"].includes(challenge.status));

  const filteredMatches = allSorted.filter((match) => {
    if (currentFilter === "settled") {
      return match.status === "settlement";
    }

    if (currentFilter === "live") {
      return ["accepted", "live"].includes(match.status);
    }

    if (currentFilter === "debate") {
      return Boolean(debateMap[match.id]);
    }

    return true;
  });

  const filterCounts = {
    all: allSorted.length,
    settled: settled.length,
    live: liveOrAccepted.length,
    debate: debates.length,
  };

  const totalSettled = settled.length;
  const totalDebateRounds = debates.reduce((sum, debate) => sum + (debate.rounds?.length ?? 0), 0);
  const totalRewardPool = settled.reduce((sum, challenge) => sum + challenge.rewardPool, 0);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="战报归档"
          title="每一场比赛都该沉淀成可再次阅读、再次传播的档案页。"
          description="回放页现在按战报归档逻辑组织，已结算、直播中和辩论专题分开编排，避免继续像普通列表页。"
          aside={
            <SurfaceCard className="score-surface rounded-[1.9rem] p-5">
              <p className="media-kicker">Archive Desk</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">已结算</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{totalSettled}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">辩论发言</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{totalDebateRounds}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">累计奖池</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{totalRewardPool}</p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = currentFilter === option.key;

            return (
              <Link
                key={option.key}
                href={option.key === "all" ? "/replay" : `/replay?filter=${option.key}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border border-[rgba(240,75,55,0.4)] bg-[rgba(240,75,55,0.1)] text-[#ffb9a9]"
                    : "border border-white/10 text-slate-400 hover:border-[rgba(240,75,55,0.24)] hover:text-slate-100"
                }`}
              >
                {option.label} ({filterCounts[option.key]})
              </Link>
            );
          })}
        </div>

        {filteredMatches.length === 0 ? (
          <SurfaceCard className="rounded-[2rem] p-8 text-center text-slate-400">
            当前筛选下还没有战报记录。去{" "}
            <Link href="/challenge/new" className="font-semibold text-[#ffb9a9]">
              创建第一场挑战
            </Link>
            。
          </SurfaceCard>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const challenger = playerMap[match.challengerSlug];
              const defender = playerMap[match.defenderSlug];
              const winner = match.winnerSlug ? playerMap[match.winnerSlug] : null;
              const statusMeta = challengeStatusMeta[match.status];
              const debate = debateMap[match.id];

              return (
                <Link key={match.id} href={`/replay/${match.id}`}>
                  <SurfaceCard className="editorial-surface rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${statusMeta.tone}`}>{statusMeta.label}</span>
                        <span className="hud-chip">{getModeLabel(match.mode)}</span>
                        {debate ? <span className="pill-muted text-xs text-[#f6bd4b]">辩论专题</span> : null}
                      </div>
                      <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        {new Date(match.settledAt ?? match.acceptedAt ?? match.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <h2 className="headline-section text-[#f7f4ed]">
                          {challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-slate-400">
                          {winner ? `${winner.name} 获胜。` : ""}
                          {match.settlementSummary ?? match.storyline}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                          <p className="media-kicker">Pool</p>
                          <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase">{match.rewardPool} CP</p>
                        </div>
                        <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                          <p className="media-kicker">Schedule</p>
                          <p className="mt-3 text-sm text-slate-200">{match.scheduledFor}</p>
                        </div>
                        {debate ? (
                          <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                            <p className="media-kicker">Debate</p>
                            <p className="mt-3 text-sm text-slate-200">{debateStatusLabels[debate.status] ?? debate.status}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              {debate.currentRound}/{debate.totalRounds} 轮
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </SurfaceCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
