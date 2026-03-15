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
  const playerMap = Object.fromEntries(players.map((p) => [p.slug, p]));
  const sideA = playerMap[debate.sideAPlayerSlug];
  const sideB = playerMap[debate.sideBPlayerSlug];
  const statusMeta = statusLabels[debate.status] ?? { label: debate.status, tone: "text-muted" };

  // 按轮次分组回合
  const roundsByNumber = new Map<number, typeof debate.rounds>();
  for (const round of debate.rounds ?? []) {
    const existing = roundsByNumber.get(round.roundNumber) ?? [];
    existing.push(round);
    roundsByNumber.set(round.roundNumber, existing);
  }

  return (
    <SiteShell>
      <div className="section-grid">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted text-sm">辩论议题</p>
              <h1 className="text-2xl font-bold">{debate.topic?.question ?? "未知议题"}</h1>
            </div>
            <span className={`rounded px-3 py-1 text-sm font-medium ${statusMeta.tone} bg-white/5`}>
              {statusMeta.label}
            </span>
          </div>

          {debate.topic?.description && (
            <p className="text-muted text-sm leading-relaxed">
              {debate.topic.description}
            </p>
          )}
        </div>

        {/* Matchup */}
        <SurfaceCard>
          <div className="grid grid-cols-3 items-center gap-4 text-center">
            <div>
              <div className="bg-accent/20 text-accent mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                {sideA?.avatar ?? "A"}
              </div>
              <p className="font-bold">{sideA?.name ?? debate.sideAPlayerSlug}</p>
              <p className="text-accent text-sm">正方 (Yes)</p>
              {sideA && <p className="text-muted text-xs">Elo {sideA.elo}</p>}
            </div>

            <div>
              <p className="text-muted text-3xl font-black">VS</p>
              <p className="text-muted mt-1 text-sm">
                轮次 {debate.currentRound} / {debate.totalRounds}
              </p>
            </div>

            <div>
              <div className="bg-accentSecondary/20 text-accentSecondary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                {sideB?.avatar ?? "B"}
              </div>
              <p className="font-bold">{sideB?.name ?? debate.sideBPlayerSlug}</p>
              <p className="text-accentSecondary text-sm">反方 (No)</p>
              {sideB && <p className="text-muted text-xs">Elo {sideB.elo}</p>}
            </div>
          </div>
        </SurfaceCard>

        {/* Polymarket Data */}
        {debate.topic && (
          <SurfaceCard>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Polymarket 市场数据</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {debate.topic.outcomes.map((outcome, i) => (
                <div key={outcome}>
                  <p className="text-muted text-xs">{outcome}</p>
                  <p className="text-lg font-bold">
                    {((debate.topic!.currentPrices[i] ?? 0) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
              <div>
                <p className="text-muted text-xs">交易量</p>
                <p className="text-lg font-bold">${Math.round(debate.topic.volume).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted text-xs">流动性</p>
                <p className="text-lg font-bold">${Math.round(debate.topic.liquidity).toLocaleString()}</p>
              </div>
            </div>
          </SurfaceCard>
        )}

        {/* Debate Rounds */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">辩论实录</h2>

          {(debate.rounds?.length ?? 0) === 0 ? (
            <SurfaceCard>
              <p className="text-muted py-6 text-center">
                {debate.status === "topic-set"
                  ? "辩论尚未启动。等待双方就位。"
                  : "暂无发言记录。等待正方先手。"}
              </p>
            </SurfaceCard>
          ) : (
            Array.from(roundsByNumber.entries()).map(([roundNum, entries]) => (
              <div key={roundNum} className="space-y-2">
                <h3 className="text-muted text-sm font-bold uppercase tracking-wider">
                  第 {roundNum} 轮
                </h3>
                {entries!.map((entry) => {
                  const isA = entry.side === "yes";
                  const speaker = isA ? sideA : sideB;
                  return (
                    <SurfaceCard
                      key={entry.id}
                      className={isA ? "border-l-accent/50 border-l-2" : "border-l-accentSecondary/50 border-l-2"}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isA ? "bg-accent/20 text-accent" : "bg-accentSecondary/20 text-accentSecondary"}`}>
                          {speaker?.avatar ?? (isA ? "A" : "B")}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {speaker?.name ?? entry.playerSlug}
                            </span>
                            <span className={`text-xs ${isA ? "text-accent" : "text-accentSecondary"}`}>
                              {isA ? "正方" : "反方"}
                            </span>
                            <span className="text-muted text-xs">{entry.wordCount} 字</span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.argument}</p>
                        </div>
                      </div>
                    </SurfaceCard>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {debate.summary && (
          <SurfaceCard>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">辩论总结</h3>
            <p className="text-sm leading-relaxed">{debate.summary}</p>
          </SurfaceCard>
        )}
      </div>
    </SiteShell>
  );
}
