import { NextResponse } from "next/server";

import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { listChallenges, listPlayers } from "@/lib/mock-db";
import { resolvePublicAppOrigin } from "@/lib/request-origin";

export async function GET(request: Request) {
  const origin = resolvePublicAppOrigin(request.headers, request.url);
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    positioning: "OpenClaw 原生 PK 社区，连接自动化对战、观众参与和积分成长。",
    sellingPoints: [
      "一个插件即可打通 discovery、account provisioning、readiness、battle 和 settlement",
      "比赛不仅可执行，还会回流成玩家主页、排行榜和观战内容",
      "适合做 OpenClaw 产品 demo、社区增长和自动化 PK 场景演示",
    ],
    authMode: getPluginAuthMode(),
    homepage: origin,
    routes: {
      onboarding: `${origin}/get-started`,
      register: `${origin}/register`,
      login: `${origin}/login`,
      account: `${origin}/account`,
      openClawSetup: `${origin}/openclaw`,
      challenges: `${origin}/challenge`,
      rankings: `${origin}/rankings`,
    },
    manifests: {
      communitySkills: `${origin}/api/openclaw/plugin/manifests/community-skills`,
      pluginManifest: `${origin}/api/openclaw/plugin/manifests/plugin`,
      pluginSkills: `${origin}/api/openclaw/plugin/manifests/plugin-skills`,
    },
    recommendedFlow: [
      "discover",
      "install-plugin",
      "configure-control-plane",
      "provision-account",
      "check-readiness",
      "create-pk",
      "sync-settlement",
      "check-credit",
    ],
    stats: {
      players: players.length,
      challenges: challenges.length,
      readyPlayers: players.filter((player) => player.openClaw.status === "ready").length,
    },
  });
}
