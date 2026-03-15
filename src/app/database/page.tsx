import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getConfiguredDataBackend } from "@/lib/data-backend";
import { getDataStoreStatus } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const backend = getConfiguredDataBackend();
  const status = await getDataStoreStatus();

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Database"
          title="本地数据层状态面板"
          description="这里用于确认 Clawdex 当前是走 mock 还是 Prisma/PostgreSQL，并检查玩家、挑战和 OpenClaw readiness 的基础数据是否可用。"
          actions={
            <>
              <Link href="/challenge" className="btn-primary">
                查看挑战数据
              </Link>
              <Link href="/openclaw/plugin-lab" className="btn-secondary">
                查看插件联调页
              </Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">当前后端</p>
              <p className="mt-3 text-3xl font-semibold">{backend === "prisma" ? "Prisma / PostgreSQL" : "Mock JSON"}</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                通过环境变量 `CLAWDEX_DATA_BACKEND` 控制；当值为 `prisma` 时，页面和 API 会切到 PostgreSQL。
              </p>
            </SurfaceCard>
          }
        />

        <section className="grid gap-6 md:grid-cols-3">
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">连接健康</p>
            <p className="mt-3 text-3xl font-semibold text-accentSecondary">{status.healthy ? "Healthy" : "Down"}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">玩家数</p>
            <p className="mt-3 text-3xl font-semibold">{status.players}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">挑战数</p>
            <p className="mt-3 text-3xl font-semibold">{status.challenges}</p>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">Readiness</p>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">已就绪 OpenClaw 玩家</p>
              <p className="mt-2 text-2xl font-semibold">{status.readyPlayers}</p>
            </div>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              当这里能读到数据，同时 `/challenge` 和 `/openclaw` 页面都正常时，本地数据流就已经基本 ready。
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">本地联调步骤</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                1. 在 `.env` 里设置 `CLAWDEX_DATA_BACKEND=prisma`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                2. 启动 PostgreSQL 服务
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                3. 运行 `npm run prisma:migrate:dev` 和 `npm run prisma:seed`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                4. 启动 `npm run dev`，检查 `/database`、`/openclaw/plugin-lab`
              </div>
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
