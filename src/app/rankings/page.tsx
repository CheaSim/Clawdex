import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const categoryLabels = ["综合 Elo", "内容热度", "观众支持率"];

export default async function RankingsPage() {
  const players = await listPlayers();
  const rankingLeaders = [
    [...players].sort((left, right) => right.elo - left.elo)[0],
    [...players].sort((left, right) => right.fame - left.fame)[0],
    [...players].sort((left, right) => Number.parseFloat(right.winRate) - Number.parseFloat(left.winRate))[0],
  ].filter(Boolean);

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="排行榜"
          title="竞技强度和内容热度一起算，才更像一个会增长的社区。"
          description="排行榜不只看胜负，还看谁最能制造高光、带动观众互动和形成持续剧情。"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {rankingLeaders.map((entry, index) => (
            <Link key={entry.slug} href={`/players/${entry.slug}`}>
              <SurfaceCard className="relative overflow-hidden bg-slate-950/70 p-6 transition hover:-translate-y-1">
                <div className="absolute right-[-1rem] top-[-1rem] h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
                <p className="text-sm text-muted">{categoryLabels[index]}</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-xl font-semibold text-accent">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{entry.name}</h2>
                    <p className="text-sm text-muted">{entry.title}</p>
                  </div>
                </div>
                <p className="mt-6 text-3xl font-semibold text-accentSecondary">
                  {index === 0 ? `${entry.elo} Elo` : index === 1 ? `${entry.fame.toLocaleString()} Fame` : entry.winRate}
                </p>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
