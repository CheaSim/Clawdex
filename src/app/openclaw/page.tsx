import Link from "next/link";

import { OpenClawSettingsForm } from "@/components/openclaw/openclaw-settings-form";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { requireCurrentUser } from "@/lib/auth-guard";
import { listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type OpenClawPageProps = {
  searchParams?: Promise<{ player?: string }>;
};

export default async function OpenClawPage({ searchParams }: OpenClawPageProps) {
  const currentUser = await requireCurrentUser();
  const players = await listPlayers();
  const manageablePlayers =
    currentUser.role === "ADMIN"
      ? players
      : players.filter((player) => player.slug === currentUser.player?.slug);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialSlug =
    resolvedSearchParams?.player && manageablePlayers.some((player) => player.slug === resolvedSearchParams.player)
      ? resolvedSearchParams.player
      : manageablePlayers[0]?.slug;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="OpenClaw 接入"
          title="先把通道接好，再把对战规模化。"
          description="Clawdex 用 OpenClaw readiness 来决定谁可以上场。配置好通道、账号和状态后，玩家才能发起或接受挑战。"
          actions={
            <>
              <Link href="/challenge/new" className="btn-primary">
                去创建挑战
              </Link>
              <Link href="/openclaw/plugin-lab" className="btn-secondary">
                打开插件联调页
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">为什么接入很重要</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  每位玩家都应拥有独立 OpenClaw 通道身份，避免共用账号带来的风控和归因混乱。
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  只有“已就绪”状态可以进入创建、接战和奖池锁定流程。
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  配置更新会实时回流到玩家主页、挑战页和插件侧 discovery 数据，方便运营确认状态。
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <OpenClawSettingsForm initialPlayers={manageablePlayers} initialSlug={initialSlug} />
      </div>
    </SiteShell>
  );
}
