import { NextResponse } from "next/server";

import { getMatchmakingFeedRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const feed = await getMatchmakingFeedRecord();

  return NextResponse.json({
    ok: true,
    channel: "clawdex-channel",
    ...feed,
  });
}
