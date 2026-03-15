import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getConfiguredDataBackend } from "@/lib/data-backend";
import { requireCurrentUser } from "@/lib/auth-guard";
import { getDataStoreStatus, listChallenges, listPlayers } from "@/lib/mock-db";
import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";

export const dynamic = "force-dynamic";

const quickCommands = [
  {
    title: "状态探测",
    body: `{"method":"clawdex-channel.status","params":{}}`,
  },
  {
    title: "插件说明",
    body: `{"method":"clawdex-channel.docs","params":{}}`,
  },
  {
    title: "完整自测",
    body: `{"method":"clawdex-channel.selftest.full","params":{"mode":"public-arena","stake":20,"autoReady":true,"settleWinner":"challenger"}}`,
  },
];

const manualFlow = [
  "clawdex-channel.account.provision",
  "clawdex-channel.battle.readiness",
  "clawdex-channel.battle.create",
  "clawdex-channel.battle.accept",
  "clawdex-channel.battle.settle",
  "clawdex-channel.credit.balance",
];

export default async function PluginLabPage() {
  await requireCurrentUser();

  const backend = getConfiguredDataBackend();
  const authMode = getPluginAuthMode();
  const [status, players, challenges] = await Promise.all([
    getDataStoreStatus(),
    listPlayers(),
    listChallenges(),
  ]);

  const readyPlayers = players.filter((player) => player.openClaw.status === "ready").length;
  const activeChallenges = challenges.filter((challenge) => ["accepted", "live"].includes(challenge.status)).length;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Plugin Lab"
          title="插件联调状态页"
          description="这里用于确认 Clawdex control plane 是否准备好承接 OpenClaw 插件，适合在安装插件前后做快速联调。"
          actions={
            <>
              <Link href="/openclaw" className="btn-primary">返回 OpenClaw 面板</Link>
              <Link href="/database" className="btn-secondary">查看数据状态</Link>
            </>
          }
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">当前环境</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  数据后端：{backend === "prisma" ? "Prisma / PostgreSQL" : "Mock JSON"}
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  插件鉴权：{authMode === "token" ? "Bearer Token" : "Open Mode"}
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  Channel ID：`clawdex-channel`
                </div>
              </div>
            </SurfaceCard>
          }
        />

        <section className="grid gap-6 md:grid-cols-4">
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">Control Plane</p>
            <p className="mt-3 text-3xl font-semibold text-accentSecondary">{status.healthy ? "Ready" : "Down"}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">Players</p>
            <p className="mt-3 text-3xl font-semibold">{status.players}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">Ready Players</p>
            <p className="mt-3 text-3xl font-semibold">{readyPlayers}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted">Active Battles</p>
            <p className="mt-3 text-3xl font-semibold">{activeChallenges}</p>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">完整联调前检查</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                1. 主站已启动在 `http://127.0.0.1:3000`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                2. `CLAWDEX_DATA_BACKEND=prisma`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                3. `CLAWDEX_PLUGIN_TOKEN` 已配置，并与 OpenClaw 配置一致
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                4. OpenClaw 已安装 `@cheasim/clawdex-channel` 或本地插件目录
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                5. `openclaw.json` 中 `controlPlaneBaseUrl` 指向 `http://127.0.0.1:3000/api`
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">推荐执行顺序</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">先执行 `clawdex-channel.status`</div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">再执行 `clawdex-channel.docs`</div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">最后执行 `clawdex-channel.selftest.full`</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/openclaw" className="btn-secondary">去改通道配置</Link>
              <Link href="/challenge" className="btn-secondary">看挑战状态</Link>
            </div>
          </SurfaceCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">OpenClaw 调用模板</p>
            <div className="mt-5 space-y-4">
              {quickCommands.map((command) => (
                <div key={command.title} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-sm font-semibold text-slate-100">{command.title}</p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">{command.body}</pre>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">手动联调方法链</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              {manualFlow.map((method, index) => (
                <div key={method} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  {index + 1}. {method}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-300">
              当前页面展示的是“现在是否适合联调”，还没有持久化“最近一次 self-test 结果”。如果你想要，我下一步可以继续把自测结果入库并做成历史记录面板。
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
