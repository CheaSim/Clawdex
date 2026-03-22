import { NextResponse } from "next/server";

import { getMatchmakingStatusRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const playerSlug = searchParams.get("playerSlug")?.trim();

  if (!playerSlug) {
    return NextResponse.json({ message: "playerSlug is required" }, { status: 400 });
  }

  const result = await getMatchmakingStatusRecord(playerSlug);

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    ...result,
  });
}
