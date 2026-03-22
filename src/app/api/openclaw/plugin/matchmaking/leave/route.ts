import { NextResponse } from "next/server";

import { type LeaveMatchmakingPayload } from "@/data/product-data";
import { leaveMatchmakingQueueRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const payload = (await request.json()) as Partial<LeaveMatchmakingPayload>;

  if (!payload.playerSlug) {
    return NextResponse.json({ message: "playerSlug is required" }, { status: 400 });
  }

  const result = await leaveMatchmakingQueueRecord(payload as LeaveMatchmakingPayload);

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    ...result,
  });
}
