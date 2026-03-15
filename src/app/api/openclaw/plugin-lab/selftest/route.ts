import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { MatchMode } from "@/data/product-data";
import { getCurrentUserRecord } from "@/lib/auth-guard";
import {
  acceptChallengeFromPluginRecord,
  createChallengeRecord,
  getPlayerBySlugFromDb,
  listChallenges,
  listPlayers,
  settleChallengeRecord,
} from "@/lib/mock-db";
import { getPluginCreditSnapshot, provisionPluginAccount } from "@/lib/openclaw-auto-agent";
import { getConfiguredDataBackend } from "@/lib/data-backend";
import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { runPluginLabSelfTest, type PluginLabSelfTestInput } from "@/lib/plugin-lab-selftest";
import { resolvePublicAppOrigin } from "@/lib/request-origin";

type SelfTestRequestBody = {
  mode?: "quick" | "full";
  battleMode?: MatchMode;
  stake?: number;
  settleWinner?: "challenger" | "defender";
  autoReady?: boolean;
};

async function getStatusSnapshot() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  return {
    ok: true,
    channel: "clawdex-channel",
    authMode: getPluginAuthMode(),
    stats: {
      players: players.length,
      challenges: challenges.length,
      readyPlayers: players.filter((player) => player.openClaw.status === "ready").length,
    },
  } as const;
}

async function getDiscoverySnapshot(origin: string) {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  return {
    ok: true,
    channel: "clawdex-channel",
    authMode: getPluginAuthMode(),
    homepage: origin,
    routes: {
      openClawSetup: `${origin}/openclaw`,
      challenges: `${origin}/challenge`,
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
  } as const;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ message: "请先登录后再使用 Plugin Lab。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SelfTestRequestBody;
  const mode = body.mode ?? "quick";

  if (mode === "full" && getConfiguredDataBackend() !== "prisma") {
    return NextResponse.json(
      { message: "Full self-test 需要 Prisma / PostgreSQL 后端，当前环境不能自动 provision 账号。" },
      { status: 400 },
    );
  }

  if (body.stake !== undefined && (!Number.isFinite(body.stake) || body.stake < 20 || body.stake > 200)) {
    return NextResponse.json({ message: "stake 必须在 20 到 200 之间。" }, { status: 400 });
  }

  const origin = resolvePublicAppOrigin(request.headers, request.url);
  const input: PluginLabSelfTestInput = {
    origin,
    mode,
    battleMode: body.battleMode,
    stake: body.stake,
    settleWinner: body.settleWinner,
    autoReady: body.autoReady,
  };

  try {
    const result = await runPluginLabSelfTest(
      {
        getStatus: getStatusSnapshot,
        getDiscovery: getDiscoverySnapshot,
        provisionAccount: provisionPluginAccount,
        getReadiness: async (playerSlug) => {
          const player = await getPlayerBySlugFromDb(playerSlug);

          if (!player) {
            throw new Error(`Player not found: ${playerSlug}`);
          }

          return {
            playerSlug,
            ready: player.openClaw.status === "ready",
            openClaw: player.openClaw,
          };
        },
        createChallenge: createChallengeRecord,
        acceptChallenge: acceptChallengeFromPluginRecord,
        settleChallenge: settleChallengeRecord,
        getCredit: getPluginCreditSnapshot,
        now: () => Date.now(),
      },
      input,
    );

    revalidatePath("/openclaw");
    revalidatePath("/openclaw/plugin-lab");
    revalidatePath("/challenge");
    revalidatePath("/replay");

    if (result.mode === "full") {
      revalidatePath(result.links.challenge.replace(origin, ""));
      revalidatePath(result.links.replay.replace(origin, ""));
      revalidatePath(result.links.challengerPlayer.replace(origin, ""));
      revalidatePath(result.links.defenderPlayer.replace(origin, ""));
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Plugin Lab self-test failed" },
      { status: 400 },
    );
  }
}
