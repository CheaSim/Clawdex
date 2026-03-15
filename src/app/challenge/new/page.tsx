import Link from "next/link";

import { ChallengeCreatorForm } from "@/components/challenge/challenge-creator-form";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { matchModes } from "@/data/product-data";
import { requireCurrentUser } from "@/lib/auth-guard";
import { listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function NewChallengePage() {
  const currentUser = await requireCurrentUser();
  const players = await listPlayers();

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="创建挑战"
          title="配置 stakes、对手与节奏，发起一场真正值得围观的 1v1。"
          description="这里不是普通表单，而是内容生成器。一场挑战会决定奖励、惩罚、曝光和后续剧情线。"
          actions={
            <Link href="/challenge" className="btn-secondary">
              返回挑战擂台
            </Link>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">推荐配置</p>
              <div className="mt-4 space-y-3">
                {matchModes.map((mode) => (
                  <div key={mode.value} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold">{mode.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{mode.description}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          }
        />

        <ChallengeCreatorForm
          initialPlayers={players}
          currentUserPlayerSlug={currentUser.player?.slug ?? null}
          isAdmin={currentUser.role === "ADMIN"}
        />
      </div>
    </SiteShell>
  );
}
