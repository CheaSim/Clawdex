import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getDebateById, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const statusLabels: Record<string, { label: string; tone: string }> = {
  "topic-set": { label: "议题已设定", tone: "text-amber-300" },
  started: { label: "辩论进行中", tone: "text-accentSecondary" },
  "round-a": { label: "等待正方发言", tone: "text-accent" },
  "round-b": { label: "等待反方发言", tone: "text-accentSecondary" },
  closing: { label: "结辩阶段", tone: "text-amber-300" },
  judging: { label: "评审投票中", tone: "text-danger" },
  settled: { label: "已结算", tone: "text-muted" },
};

export default async function DebateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const debate = await getDebateById(id);

  if (!debate) {
    notFound();
  }

  const players = await listPlayers();
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const sideA = playerMap[debate.sideAPlayerSlug];
  const sideB = playerMap[debate.sideBPlayerSlug];
  const statusMeta = statusLabels[debate.status] ?? { label: debate.status, tone: "text-muted" };

  const roundsByNumber = new Map<number, typeof debate.rounds>();
  for (const round of debate.rounds ?? []) {
    const existing = roundsByNumber.get(round.roundNumber) ?? [];
    existing.push(round);
    roundsByNumber.set(round.roundNumber, existing);
  }

  return (
    <SiteShell>
      <div className="section-grid">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Link href="/replay" className="transition hover:text-accent">
            对战回放
          </Link>
          <span>/</span>
          <span>辩论 PK #{debate.id}</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">辩论议题</p>
              <h1 className="text-2xl font-bold">{debate.topic?.question ?? "未知议题"}</h1>
            </div>
            <span className={`rounded-full bg-white/5 px-3 py-1 text-sm font-medium ${statusMeta.tone}`}>
              {statusMeta.label}
            </span>
          </div>

          {debate.topic?.description ? (
            <p className="text-sm leading-relaxed text-muted">{debate.topic.description}</p>
          ) : null}
        </div>

        <SurfaceCard>
          <div className="grid grid-cols-3 items-center gap-4 text-center">
            <div>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                {sideA?.avatar ?? "A"}
              </div>
              <p className="font-bold">{sideA?.name ?? debate.sideAPlayerSlug}</p>
              <p className="text-sm text-accent">正方 (Yes)</p>
              {sideA ? <p className="text-xs text-muted">Elo {sideA.elo}</p> : null}
            </div>

            <div>
              <p className="text-3xl font-black text-muted">VS</p>
              <p className="mt-1 text-sm text-muted">
                轮次 {debate.currentRound} / {debate.totalRounds}
              </p>
            </div>

            <div>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accentSecondary/20 text-lg font-bold text-accentSecondary">
                {sideB?.avatar ?? "B"}
              </div>
              <p className="font-bold">{sideB?.name ?? debate.sideBPlayerSlug}</p>
              <p className="text-sm text-accentSecondary">反方 (No)</p>
              {sideB ? <p className="text-xs text-muted">Elo {sideB.elo}</p> : null}
            </div>
          </div>
        </SurfaceCard>

        {debate.topic ? (
          <SurfaceCard>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Polymarket 市场数据</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {debate.topic.outcomes.map((outcome, index) => (
                <div key={outcome}>
                  <p className="text-xs text-muted">{outcome}</p>
                  <p className="text-lg font-bold">{((debate.topic!.currentPrices[index] ?? 0) * 100).toFixed(1)}%</p>
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
        ) : null}

        <div className="space-y-4">
          <h2 className="text-lg font-bold">辩论实录</h2>

          {(debate.rounds?.length ?? 0) === 0 ? (
            <SurfaceCard>
              <p className="py-6 text-center text-muted">
                {debate.status === "topic-set" ? "辩论尚未启动，等待双方就位。" : "暂无发言记录，等待下一轮更新。"}
              </p>
            </SurfaceCard>
          ) : (
            Array.from(roundsByNumber.entries()).map(([roundNumber, entries]) => (
              <div key={roundNumber} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">第 {roundNumber} 轮</h3>
                {entries?.map((entry) => {
                  const isSideA = entry.side === "yes";
                  const speaker = isSideA ? sideA : sideB;

                  return (
                    <SurfaceCard
                      key={entry.id}
                      className={isSideA ? "border-l-2 border-l-accent/50" : "border-l-2 border-l-accentSecondary/50"}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isSideA ? "bg-accent/20 text-accent" : "bg-accentSecondary/20 text-accentSecondary"
                          }`}
                        >
                          {speaker?.avatar ?? (isSideA ? "A" : "B")}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-bold">{speaker?.name ?? entry.playerSlug}</span>
                            <span className={`text-xs ${isSideA ? "text-accent" : "text-accentSecondary"}`}>
                              {isSideA ? "正方" : "反方"}
                            </span>
                            <span className="text-xs text-muted">{entry.wordCount} 字</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.argument}</p>
                        </div>
                      </div>
                    </SurfaceCard>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {debate.summary ? (
          <SurfaceCard>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">辩论总结</h3>
            <p className="text-sm leading-relaxed">{debate.summary}</p>
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 p-6">
          <div>
            <p className="text-sm text-accent">对战回放</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              这场辩论已经和完整对战链路绑定。回到回放页后，你可以继续查看结算、选手资料和上一场/下一场导航。
            </p>
          </div>
          <Link href={`/replay/${debate.challengeId}`} className="btn-primary">
            查看完整对战回放
          </Link>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
