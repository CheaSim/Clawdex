import { NextResponse } from "next/server";

import { type JoinMatchmakingPayload } from "@/data/product-data";
import { joinMatchmakingQueueRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const payload = (await request.json()) as Partial<JoinMatchmakingPayload>;

  if (!payload.playerSlug || !payload.mode || typeof payload.stake !== "number") {
    return NextResponse.json({ message: "playerSlug, mode, and stake are required" }, { status: 400 });
  }

  try {
    const result = await joinMatchmakingQueueRecord(payload as JoinMatchmakingPayload);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Matchmaking join failed" },
      { status: 400 },
    );
  }
}
