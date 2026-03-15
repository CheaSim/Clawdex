import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel, openClawStatusMeta } from "@/data/product-data";
import { getPlayerBattleHistory } from "@/lib/challenge-insights";
import { getPlayerBySlugFromDb, listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type PlayerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

const resultMeta = {
  win: { label: "胜", tone: "text-accentSecondary" },
  loss: { label: "负", tone: "text-danger" },
  "in-progress": { label: "进行中", tone: "text-accent" },
} as const;

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { slug } = await params;
  const [player, matches, players] = await Promise.all([getPlayerBySlugFromDb(slug), listChallenges(), listPlayers()]);

  if (!player) {
    notFound();
  }

  const playerMap = Object.fromEntries(players.map((entry) => [entry.slug, entry]));
  const battleHistory = getPlayerBattleHistory(matches, player.slug);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow={player.title}
          title={`${player.name} · ${player.bio}`}
          description={`偏好模式：${getModeLabel(player.preferredMode)} · 当前 Elo ${player.elo} · Fame ${player.fame.toLocaleString()} · 胜率 ${player.winRate}`}
          actions={
            <>
              <Link href="/challenge/new" className="btn-primary">
                向 Ta 发起挑战
              </Link>
              <Link href={`/openclaw?player=${player.slug}`} className="btn-secondary">
                管理 OpenClaw 接入
              </Link>
              <Link href="/watch" className="btn-secondary">
                查看相关观战
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-accent/30 to-accentSecondary/20 text-2xl font-semibold text-slate-950">
                  {player.avatar}
                </div>
                <div>
                  <p className="text-sm text-muted">当前连胜</p>
                  <p className="mt-1 text-3xl font-semibold">{player.streak}</p>
                </div>
              </div>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">可用钱包</p>
                <p className="mt-2 text-2xl font-semibold text-accentSecondary">{player.clawPoints} Claw Points</p>
                <p className="mt-2 text-sm text-muted">
                  创建挑战时会先冻结发起方 stake，等对手接战后奖池才会翻倍锁定。
                </p>
              </div>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">OpenClaw 状态</p>
                <p className={`mt-2 text-2xl font-semibold ${openClawStatusMeta[player.openClaw.status].tone}`}>
                  {openClawStatusMeta[player.openClaw.status].label}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {player.openClaw.channel} · {player.openClaw.region} · {player.openClaw.accountId}
                </p>
                <p className="mt-2 text-sm text-muted">{openClawStatusMeta[player.openClaw.status].description}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {player.tags.map((tag) => (
                  <span key={tag} className="pill-muted text-sm text-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </SurfaceCard>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-accent">OpenClaw 接入档案</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">通道</p>
                <p className="mt-2 text-lg font-semibold">{player.openClaw.channel}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">客户端版本</p>
                <p className="mt-2 text-lg font-semibold">{player.openClaw.clientVersion}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">配置时间</p>
                <p className="mt-2 text-sm text-slate-200">
                  {player.openClaw.configuredAt ? new Date(player.openClaw.configuredAt).toLocaleString("zh-CN") : "尚未配置"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">最近校验</p>
                <p className="mt-2 text-sm text-slate-200">
                  {player.openClaw.lastVerifiedAt ? new Date(player.openClaw.lastVerifiedAt).toLocaleString("zh-CN") : "等待首次校验"}
                </p>
              </div>
            </div>
            {player.openClaw.notes ? (
              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                {player.openClaw.notes}
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard className="bg-slate-950/70 p-6">
            <p className="text-sm text-accent">近期高光</p>
            <div className="mt-5 space-y-3">
              {player.recentMoments.map((moment) => (
                <div key={moment} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  {moment}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-accent">历史战绩</p>
                <h2 className="mt-2 text-2xl font-semibold">回放、结果、奖池都会在这里沉淀成完整记录</h2>
              </div>
              <span className="pill-muted text-sm text-slate-200">{battleHistory.length} 场对战记录</span>
            </div>

            <div className="mt-5 space-y-3">
              {battleHistory.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-muted">
                  这位选手还没有历史对战记录。等第一场开打之后，这里就会开始积累战绩与回放。
                </div>
              ) : null}

              {battleHistory.map((entry) => {
                const opponent = playerMap[entry.opponentSlug];
                const result = resultMeta[entry.result];

                return (
                  <Link
                    key={entry.challenge.id}
                    href={`/replay/${entry.challenge.id}`}
                    className="block rounded-[24px] border border-white/10 bg-slate-950/55 p-4 transition hover:border-accent/30 hover:bg-white/[0.06]"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr_0.75fr_0.7fr_1fr_auto] lg:items-center">
                      <div>
                        <p className="text-xs text-muted">对手</p>
                        <h3 className="mt-2 text-lg font-semibold">{opponent?.name ?? entry.opponentSlug}</h3>
                        <p className="mt-1 text-sm text-muted">{opponent?.title ?? "Clawdex Player"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">模式</p>
                        <p className="mt-2 text-sm text-slate-100">{getModeLabel(entry.challenge.mode)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">结果</p>
                        <p className={`mt-2 text-sm font-semibold ${result.tone}`}>{result.label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">奖池</p>
                        <p className="mt-2 text-sm text-slate-100">{entry.challenge.rewardPool} CP</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">日期</p>
                        <p className="mt-2 text-sm text-slate-100">{new Date(entry.activityAt).toLocaleString("zh-CN")}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 lg:justify-end">
                        <span className={`text-xs ${challengeStatusMeta[entry.challenge.status].tone}`}>
                          {challengeStatusMeta[entry.challenge.status].label}
                        </span>
                        <span className="text-sm text-accentSecondary">查看回放 →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
