import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { challengeStatusMeta, getModeLabel } from "@/data/product-data";
import { getPlayerBySlugFromDb, listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type PlayerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { slug } = await params;
  const [player, matches, players] = await Promise.all([getPlayerBySlugFromDb(slug), listChallenges(), listPlayers()]);

  if (!player) {
    notFound();
  }

  const playerMap = Object.fromEntries(players.map((entry) => [entry.slug, entry]));
  const relatedMatches = matches.filter(
    (match) => match.challengerSlug === player.slug || match.defenderSlug === player.slug,
  );

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
              <Link href="/watch" className="btn-secondary">
                观看相关对战
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
                <p className="mt-2 text-sm text-muted">挑战创建时会先冻结发起方 stake，对手接受后奖金池才会翻倍锁定。</p>
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
            <p className="text-sm text-accent">近期高光</p>
            <div className="mt-5 space-y-3">
              {player.recentMoments.map((moment) => (
                <div key={moment} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  {moment}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">相关对战</p>
            <div className="mt-5 space-y-4">
              {relatedMatches.map((match) => (
                <div key={match.id} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={`text-sm ${challengeStatusMeta[match.status].tone}`}>{challengeStatusMeta[match.status].label}</p>
                      <h2 className="mt-2 text-xl font-semibold">
                        {playerMap[match.challengerSlug]?.name ?? match.challengerSlug} vs {playerMap[match.defenderSlug]?.name ?? match.defenderSlug}
                      </h2>
                    </div>
                    <span className="pill-muted text-sm text-slate-200">{getModeLabel(match.mode)} · {match.rewardPool} Pool</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{match.scheduledFor}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{match.storyline}</p>
                  <div className="mt-4">
                    <Link href={`/challenge/${match.id}`} className="text-sm text-accentSecondary transition hover:text-accent">
                      查看挑战详情 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
