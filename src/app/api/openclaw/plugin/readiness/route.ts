import { NextResponse } from "next/server";

import { assertPluginAuthorized, getPluginAuthMode } from "@/lib/openclaw-plugin-auth";
import { buildOpenClawErrorResponse } from "@/lib/openclaw-plugin-diagnostics";
import { getPlayerBySlugFromDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const playerSlug = searchParams.get("playerSlug")?.trim();

  if (!playerSlug) {
    return NextResponse.json(
      buildOpenClawErrorResponse(new Error("playerSlug is required"), { status: 400 }),
      { status: 400 },
    );
  }

  const player = await getPlayerBySlugFromDb(playerSlug);

  if (!player) {
    return NextResponse.json(
      buildOpenClawErrorResponse(new Error("endpoint missing"), {
        status: 404,
        details: { playerSlug },
      }),
      { status: 404 },
    );
  }

  const ready = player.openClaw.status === "ready";

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    authMode: getPluginAuthMode(),
    playerSlug,
    ready,
    openClaw: player.openClaw,
  });
}
