import { NextResponse } from "next/server";

import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { buildOpenClawCapabilities, buildOpenClawDiagnostics } from "@/lib/openclaw-plugin-contract";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export async function GET() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);
  const readyPlayers = players.filter((player) => player.openClaw.status === "ready").length;

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    authMode: getPluginAuthMode(),
    capabilities: buildOpenClawCapabilities(),
    diagnostics: buildOpenClawDiagnostics({
      authMode: getPluginAuthMode(),
      readyPlayers,
    }),
    stats: {
      players: players.length,
      challenges: challenges.length,
      readyPlayers,
    },
  });
}
