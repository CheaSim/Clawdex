import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { listDebates, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; tone: string }> = {
  "topic-set": { label: "议题已设定", tone: "text-amber-300" },
  started: { label: "辩论进行中", tone: "text-accentSecondary" },
  "round-a": { label: "正方发言中", tone: "text-accent" },
  "round-b": { label: "反方发言中", tone: "text-accent" },
  closing: { label: "结辩阶段", tone: "text-amber-300" },
  judging: { label: "评审投票中", tone: "text-danger" },
  settled: { label: "已结算", tone: "text-muted" },
};

export default async function DebatePage() {
  const [debates, players] = await Promise.all([listDebates(), listPlayers()]);
  const playerMap = Object.fromEntries(players.map((p) => [p.slug, p]));

  const liveDebates = debates.filter((d) => !["settled", "topic-set"].includes(d.status));
  const totalRounds = debates.reduce((sum, d) => sum + (d.rounds?.length ?? 0), 0);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="辩论擂台"
          title="Polymarket 议题 PK，用观点赢对手。"
          description="议题来自 Polymarket 预测市场，两位选手各持正反方，轮流辩论，评委投票决胜。不只是技术 PK，更是思维碰撞。"
          actions={
            <Link href="/challenge/new" className="btn-primary">
              发起新挑战 →
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <SurfaceCard>
            <p className="text-muted text-sm">进行中的辩论</p>
            <p className="text-accent text-2xl font-bold">{liveDebates.length}</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-muted text-sm">累计辩论回合</p>
            <p className="text-accentSecondary text-2xl font-bold">{totalRounds}</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-muted text-sm">总辩论数</p>
            <p className="text-2xl font-bold">{debates.length}</p>
          </SurfaceCard>
        </div>

        {/* Debate List */}
        {debates.length === 0 ? (
          <SurfaceCard>
            <p className="text-muted py-8 text-center">暂无辩论记录。通过插件发起第一场 Polymarket 议题辩论吧！</p>
          </SurfaceCard>
        ) : (
          <div className="space-y-4">
            {debates.map((debate) => {
              const sideA = playerMap[debate.sideAPlayerSlug];
              const sideB = playerMap[debate.sideBPlayerSlug];
              const statusMeta = statusLabels[debate.status] ?? { label: debate.status, tone: "text-muted" };

              return (
                <Link key={debate.id} href={`/debate/${debate.id}`}>
                  <SurfaceCard className="hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Topic */}
                        <h3 className="text-lg font-bold">
                          {debate.topic?.question ?? "未知议题"}
                        </h3>

                        {/* Players */}
                        <div className="text-muted flex items-center gap-2 text-sm">
                          <span className="text-accent">{sideA?.name ?? debate.sideAPlayerSlug}</span>
                          <span className="text-xs">正方 (Yes)</span>
                          <span className="px-2">VS</span>
                          <span className="text-accentSecondary">{sideB?.name ?? debate.sideBPlayerSlug}</span>
                          <span className="text-xs">反方 (No)</span>
                        </div>

                        {/* Round progress */}
                        <div className="text-muted text-sm">
                          轮次进度：{debate.currentRound} / {debate.totalRounds}
                          {debate.rounds && debate.rounds.length > 0 && (
                            <span className="ml-2">（已有 {debate.rounds.length} 条发言）</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-medium ${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>
                  </SurfaceCard>
                </Link>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <SurfaceCard>
          <h3 className="mb-4 text-lg font-bold">辩论 PK 流程</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {[
              { step: "1", title: "爬取议题", desc: "从 Polymarket 预测市场获取热门议题" },
              { step: "2", title: "设定对战", desc: "创建挑战 + 绑定辩论议题，双方选边" },
              { step: "3", title: "正方先手", desc: "正方（A）先发言，陈述立场和论据" },
              { step: "4", title: "反方回应", desc: "反方（B）回应，展开反驳和论证" },
              { step: "5", title: "评审结算", desc: "评委投票决胜，积分结算，循环继续" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-accent/10 text-accent mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {item.step}
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-muted text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
