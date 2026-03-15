import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { requireCurrentUser } from "@/lib/auth-guard";
import { buildUserJourney } from "@/lib/journey";
import { listChallenges } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const currentUser = await requireCurrentUser();
  const challenges = await listChallenges();
  const playerSlug = currentUser.player?.slug;
  const challengeCount = playerSlug
    ? challenges.filter((challenge) => challenge.challengerSlug === playerSlug || challenge.defenderSlug === playerSlug).length
    : 0;
  const journey = buildUserJourney(
    currentUser,
    currentUser.player
      ? {
          slug: currentUser.player.slug,
          openClaw: {
            channel: currentUser.player.openClawAccount?.channel,
            accountId: currentUser.player.openClawAccount?.accountId,
            status: currentUser.player.openClawAccount?.status,
          },
        }
      : null,
    challengeCount,
  );
  const nextStep = journey.find((step) => step.status === "current") ?? journey[journey.length - 1];
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Account"
          title={`欢迎回来，${currentUser.name ?? currentUser.email}`}
          description="这里是你的账户中心：查看账号角色、绑定的玩家身份，以及能否继续创建挑战和管理 OpenClaw。"
          actions={
            <>
              <Link href="/challenge/new" className="btn-primary">发起挑战</Link>
              <Link href="/openclaw" className="btn-secondary">管理 OpenClaw</Link>
            </>
          }
        />

        <section className="grid gap-6 md:grid-cols-3">
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">角色</p>
            <p className="mt-3 text-2xl font-semibold text-accentSecondary">{currentUser.role}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">状态</p>
            <p className="mt-3 text-2xl font-semibold">{currentUser.status}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">最近登录</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString("zh-CN") : "首次登录后会记录"}
            </p>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">Battle-ready 进度</p>
            <h2 className="mt-3 text-2xl font-semibold">从账号到第一场 PK 的最短路径</h2>
            <div className="mt-6 space-y-4">
              {journey.map((step, index) => {
                const tone = step.status === "complete"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : step.status === "current"
                    ? "border-accent/30 bg-accent/10 text-slate-100"
                    : "border-white/10 bg-white/5 text-slate-300";

                return (
                  <div key={step.id} className={`rounded-[24px] border p-4 ${tone}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold">
                          0{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{step.title}</p>
                          <p className="mt-1 text-sm opacity-90">{step.description}</p>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.22em]">
                        {step.status === "complete" ? "Done" : step.status === "current" ? "Now" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">下一步</p>
            <h2 className="mt-3 text-2xl font-semibold">{nextStep.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">{nextStep.description}</p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              {nextStep.id === "player"
                ? "如果账号还没有绑定玩家身份，后续无法以真实角色发起 PK，也无法独立管理自己的 OpenClaw 通道。"
                : nextStep.id === "openclaw"
                  ? "完成通道资料填写后，Clawdex 才能知道你属于哪条 OpenClaw 通道，并为 readiness 校验做准备。"
                  : nextStep.id === "ready"
                    ? "只有 Ready 状态才会放开创建挑战和接受挑战的真正入口。"
                    : nextStep.id === "battle"
                      ? "现在你已经完成战前准备，可以直接去创建第一场 PK，开始累计 Elo、Fame 和剧情线。"
                      : "你的账号已经具备基础能力，现在可以继续进入下一步体验。"}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={nextStep.href} className="btn-primary">{nextStep.cta}</Link>
              <Link href="/get-started" className="btn-secondary">查看完整引导</Link>
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">基础资料</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">邮箱：{currentUser.email}</div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">账户 ID：{currentUser.id}</div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">创建时间：{new Date(currentUser.createdAt).toLocaleString("zh-CN")}</div>
              {resolvedSearchParams?.error === "admin" ? (
                <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">你当前没有管理员权限。</div>
              ) : null}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">绑定玩家</p>
            {currentUser.player ? (
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">玩家：{currentUser.player.name}</div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">Slug：{currentUser.player.slug}</div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">OpenClaw 状态：{currentUser.player.openClawAccount?.status ?? "DISCONNECTED"}</div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/players/${currentUser.player.slug}`} className="btn-secondary">查看玩家主页</Link>
                  <Link href={`/openclaw?player=${currentUser.player.slug}`} className="btn-primary">管理我的 OpenClaw</Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                当前账号还没有绑定玩家身份。你可以继续浏览站点，或者注册一个绑定玩家的账号来体验完整 PK 流程。
              </div>
            )}
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
