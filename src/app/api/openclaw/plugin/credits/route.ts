import { NextResponse } from "next/server";

import { getPluginCreditSnapshot } from "@/lib/openclaw-auto-agent";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(request.url);
  const playerSlug = searchParams.get("playerSlug") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  try {
    const result = await getPluginCreditSnapshot({ playerSlug, email });

    return NextResponse.json({
      ...result,
      channel: "clawdex-channel",
      message: "Player credit snapshot resolved for OpenClaw automation.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Credit lookup failed" },
      { status: 400 },
    );
  }
}
