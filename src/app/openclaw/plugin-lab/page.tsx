import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth-guard";
import { getConfiguredDataBackend } from "@/lib/data-backend";
import { getDataStoreStatus, listChallenges, listPlayers } from "@/lib/mock-db";
import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { PluginLabSelfTestPanel } from "@/components/openclaw/plugin-lab-selftest-panel";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";

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
  const [status, players, challenges] = await Promise.all([getDataStoreStatus(), listPlayers(), listChallenges()]);

  const readyPlayers = players.filter((player) => player.openClaw.status === "ready").length;
  const activeChallenges = challenges.filter((challenge) => ["accepted", "live"].includes(challenge.status)).length;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Plugin Lab"
          title="把插件联调、控制面探测和全链路自测，集中到一个真实可用的工作台里。"
          description="这里不是静态文档页，而是 Clawdex 的集成调试台。你可以先看环境，再跑 quick probe，最后在网页里直接走完一条 full drill。"
          actions={
            <>
              <Link href="/openclaw" className="btn-primary">
                返回 OpenClaw 面板
              </Link>
              <Link href="/database" className="btn-secondary">
                查看数据状态
              </Link>
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
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">Channel ID：`clawdex-channel`</div>
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

        <PluginLabSelfTestPanel backend={backend} />

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">联调前检查</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                1. 主站已经通过 Docker 跑在 `http://127.0.0.1/`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                2. `CLAWDEX_DATA_BACKEND` 与预期环境一致
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                3. 如果你开启了 token 模式，`CLAWDEX_PLUGIN_TOKEN` 要和 OpenClaw 配置一致
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                4. `openclaw.json` 中的 `controlPlaneBaseUrl` 应指向 `http://127.0.0.1/api`
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                5. Full drill 需要 Prisma / PostgreSQL 才能自动 provision 测试账号
              </div>
            </div>
          </SurfaceCard>

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
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">手动联调方法链</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              {manualFlow.map((method, index) => (
                <div key={method} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  {index + 1}. {method}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm text-accent">为什么这页重要</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                它让主站和插件不再是“两套看上去有关联的东西”，而是一个可以从网页里直接验证的完整系统。
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                对开发和联调来说，quick probe 能先排除环境问题，full drill 再去证明 battle flow 真正走通。
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                对演示和传播来说，一键 drill 之后马上给出 challenge / replay / player 链接，天然适合 demo 和验收。
              </div>
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
