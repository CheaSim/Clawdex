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
  win: { label: "胜", tone: "text-[#f6bd4b]" },
  loss: { label: "负", tone: "text-[#ff8b79]" },
  "in-progress": { label: "进行中", tone: "text-sky-300" },
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
          eyebrow="球员档案"
          title={`${player.name} · ${player.title}`}
          description={`${player.bio} · 当前 Elo ${player.elo} · Fame ${player.fame.toLocaleString()} · 胜率 ${player.winRate}`}
          actions={
            <>
              <Link href="/challenge/new" className="btn-primary">
                向 Ta 发起挑战
              </Link>
              <Link href="/watch" className="btn-secondary">
                返回直播频道
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="editorial-surface rounded-[1.9rem] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(240,75,55,0.25),rgba(246,189,75,0.18))] font-[var(--headline-font)] text-4xl uppercase text-[#fff3ec]">
                  {player.avatar}
                </div>
                <div>
                  <p className="media-kicker">Current Streak</p>
                  <p className="mt-2 font-[var(--headline-font)] text-5xl uppercase">{player.streak}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="media-kicker">Wallet</p>
                  <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{player.clawPoints}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="media-kicker">OpenClaw</p>
                  <p className={`mt-3 text-lg font-semibold ${openClawStatusMeta[player.openClaw.status].tone}`}>
                    {openClawStatusMeta[player.openClaw.status].label}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <section className="channel-shell lg:grid-cols-[0.95fr_1.05fr] lg:grid">
          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Player Card</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">Preferred Mode</p>
                <p className="mt-3 text-sm text-slate-200">{getModeLabel(player.preferredMode)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {player.tags.map((tag) => (
                    <span key={tag} className="pill-muted text-xs text-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">OpenClaw Channel</p>
                <p className="mt-3 text-sm text-slate-200">{player.openClaw.channel}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {player.openClaw.region} · {player.openClaw.accountId}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">Verification</p>
                <p className="mt-3 text-sm text-slate-200">
                  {player.openClaw.lastVerifiedAt ? new Date(player.openClaw.lastVerifiedAt).toLocaleString("zh-CN") : "等待首次校验"}
                </p>
              </div>
            </div>
            {player.openClaw.notes ? (
              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {player.openClaw.notes}
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Recent Moments</span>
            </div>
            <div className="mt-5 space-y-3">
              {player.recentMoments.map((moment) => (
                <div key={moment} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                  {moment}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section>
          <div className="section-divider">
            <span className="media-eyebrow">Career Archive</span>
          </div>
          <SurfaceCard className="mt-5 rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="headline-card text-[#f7f4ed]">历史战绩与回放入口</h2>
              <span className="pill-muted text-sm text-slate-200">{battleHistory.length} 场对战记录</span>
            </div>

            <div className="mt-5 space-y-3">
              {battleHistory.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
                  这位选手还没有历史对战记录。
                </div>
              ) : null}

              {battleHistory.map((entry) => {
                const opponent = playerMap[entry.opponentSlug];
                const result = resultMeta[entry.result];

                return (
                  <Link
                    key={entry.challenge.id}
                    href={`/replay/${entry.challenge.id}`}
                    className="block rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-[rgba(240,75,55,0.28)] hover:bg-white/[0.05]"
                  >
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.85fr_0.8fr_0.8fr_1fr_auto] xl:items-center">
                      <div>
                        <p className="media-kicker">Opponent</p>
                        <h3 className="mt-2 text-lg font-semibold text-[#f7f4ed]">{opponent?.name ?? entry.opponentSlug}</h3>
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{opponent?.title ?? "Player"}</p>
                      </div>
                      <div>
                        <p className="media-kicker">Mode</p>
                        <p className="mt-2 text-sm text-slate-200">{getModeLabel(entry.challenge.mode)}</p>
                      </div>
                      <div>
                        <p className="media-kicker">Result</p>
                        <p className={`mt-2 text-sm font-semibold ${result.tone}`}>{result.label}</p>
                      </div>
                      <div>
                        <p className="media-kicker">Pool</p>
                        <p className="mt-2 text-sm text-slate-200">{entry.challenge.rewardPool} CP</p>
                      </div>
                      <div>
                        <p className="media-kicker">Date</p>
                        <p className="mt-2 text-sm text-slate-200">{new Date(entry.activityAt).toLocaleString("zh-CN")}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 xl:justify-end">
                        <span className={`text-xs ${challengeStatusMeta[entry.challenge.status].tone}`}>
                          {challengeStatusMeta[entry.challenge.status].label}
                        </span>
                        <span className="text-sm font-semibold text-[#ffb9a9]">查看回放 →</span>
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
