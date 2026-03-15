import Link from "next/link";
import { notFound } from "next/navigation";

import { ChallengeDetailActions } from "@/components/challenge/detail/challenge-detail-actions";
import { SpectatorVotePanel } from "@/components/challenge/detail/spectator-vote-panel";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel, isPlayerOpenClawReady, openClawStatusMeta } from "@/data/product-data";
import { getChallengeById, getDebateByChallengeId, getPlayerBySlugFromDb } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const visibilityLabels = {
  public: "全站公开",
  followers: "仅关注者可见",
} as const;

type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { id } = await params;
  const [challenge, debate] = await Promise.all([getChallengeById(id), getDebateByChallengeId(id)]);

  if (!challenge) {
    notFound();
  }

  const challenger = await getPlayerBySlugFromDb(challenge.challengerSlug);
  const defender = await getPlayerBySlugFromDb(challenge.defenderSlug);

  if (!challenger || !defender) {
    notFound();
  }

  const statusMeta = challengeStatusMeta[challenge.status];

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow={statusMeta.label}
          title={`${challenger.name} vs ${defender.name}`}
          description={`${getModeLabel(challenge.mode)} · ${challenge.scheduledFor} · 当前奖池 ${challenge.rewardPool} Claw Points`}
          actions={
            <ChallengeDetailActions
              challengeId={challenge.id}
              status={challenge.status}
              defenderName={defender.name}
              defenderSlug={defender.slug}
              defenderReady={isPlayerOpenClawReady(defender)}
            />
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className={`text-sm ${statusMeta.tone}`}>挑战状态</p>
              <p className="mt-3 text-3xl font-semibold">{statusMeta.label}</p>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <p>挑战编号：{challenge.id}</p>
                <p>创建时间：{new Date(challenge.createdAt).toLocaleString("zh-CN")}</p>
                <p>可见范围：{visibilityLabels[challenge.visibility]}</p>
                <p>接战时间：{challenge.acceptedAt ? new Date(challenge.acceptedAt).toLocaleString("zh-CN") : "等待接战"}</p>
              </div>
            </SurfaceCard>
          }
        />

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-accent">剧情摘要</p>
                  <h2 className="mt-3 text-2xl font-semibold">{challenge.storyline}</h2>
                </div>
                <span className="pill-muted text-sm text-slate-100">{getModeLabel(challenge.mode)}</span>
              </div>
              {challenge.rulesNote ? <p className="mt-4 text-sm leading-7 text-muted">{challenge.rulesNote}</p> : null}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted">发起方已冻结</p>
                  <p className="mt-2 text-2xl font-semibold text-accentSecondary">{challenge.stake} Claw Points</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted">当前奖池</p>
                  <p className="mt-2 text-2xl font-semibold">{challenge.rewardPool} Claw Points</p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="bg-slate-950/70 p-6">
              <p className="text-sm text-accent">结算预览</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-accentSecondary">胜者收益</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{challenge.preview.winnerReward}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-danger">败者代价</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{challenge.preview.loserPenalty}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted">平台回流</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{challenge.preview.platformReturn}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted">额外曝光</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{challenge.preview.exposureBonus}</p>
                </div>
              </div>
            </SurfaceCard>

            {debate ? (
              <SurfaceCard className="bg-slate-950/70 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-accent">辩论入口</p>
                    <h2 className="mt-3 text-2xl font-semibold">{debate.topic?.question ?? "Polymarket 辩论 PK"}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {debate.summary ?? `已记录 ${debate.rounds?.length ?? 0} 条发言 · 当前进度 ${debate.currentRound}/${debate.totalRounds} 轮`}
                    </p>
                  </div>
                  <span className="pill-muted text-sm text-slate-200">辩论 PK</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-muted">发言条数</p>
                    <p className="mt-2 text-xl font-semibold">{debate.rounds?.length ?? 0}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-muted">辩论轮次</p>
                    <p className="mt-2 text-xl font-semibold">{debate.currentRound}/{debate.totalRounds}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/debate/${debate.id}`} className="btn-primary">
                    查看辩论实录
                  </Link>
                  <Link href={`/replay/${challenge.id}`} className="btn-secondary">
                    查看对战回放
                  </Link>
                </div>
              </SurfaceCard>
            ) : null}

            {["accepted", "live"].includes(challenge.status) ? (
              <SpectatorVotePanel
                challengeId={challenge.id}
                challengerSlug={challenger.slug}
                challengerName={challenger.name}
                defenderSlug={defender.slug}
                defenderName={defender.name}
              />
            ) : null}

            {challenge.status === "settlement" && challenge.winnerSlug ? (
              <SurfaceCard className="border-accentSecondary/30 bg-accentSecondary/5 p-6">
                <p className="text-sm text-accentSecondary">结算结果</p>
                <p className="mt-3 text-2xl font-semibold">
                  {challenge.winnerSlug === challenger.slug ? challenger.name : defender.name} 获胜
                </p>
                {challenge.settlementSummary ? (
                  <p className="mt-3 text-sm leading-6 text-slate-200">{challenge.settlementSummary}</p>
                ) : null}
              </SurfaceCard>
            ) : null}
          </div>

          <div className="space-y-6">
            {[challenger, defender].map((player, index) => (
              <SurfaceCard key={player.slug} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-accent">{index === 0 ? "发起方" : "应战方"}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{player.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">{player.bio}</p>
                    <p className={`mt-3 text-sm ${openClawStatusMeta[player.openClaw.status].tone}`}>
                      OpenClaw：{openClawStatusMeta[player.openClaw.status].label}
                    </p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-accent/30 to-accentSecondary/20 text-xl font-semibold text-slate-950">
                    {player.avatar}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">钱包</p>
                    <p className="mt-2 text-lg font-semibold">{player.clawPoints}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">Elo</p>
                    <p className="mt-2 text-lg font-semibold">{player.elo}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted">Fame</p>
                    <p className="mt-2 text-lg font-semibold">{player.fame.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {player.tags.map((tag) => (
                    <span key={tag} className="pill-muted text-sm text-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5">
                  <Link href={`/players/${player.slug}`} className="text-sm text-accentSecondary transition hover:text-accent">
                    查看选手主页 →
                  </Link>
                </div>
                <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/55 p-3 text-sm text-slate-200">
                  <p className="font-medium text-slate-100">OpenClaw 通道</p>
                  <p className="mt-2">
                    {player.openClaw.channel} · {player.openClaw.region}
                  </p>
                  <p className="mt-2 text-muted">
                    账号 {player.openClaw.accountId} · 客户端 {player.openClaw.clientVersion}
                  </p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
