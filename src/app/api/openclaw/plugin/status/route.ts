import { NextResponse } from "next/server";

import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export async function GET() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    authMode: getPluginAuthMode(),
    stats: {
      players: players.length,
      challenges: challenges.length,
      readyPlayers: players.filter((player) => player.openClaw.status === "ready").length,
    },
  });
}
