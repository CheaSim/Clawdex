import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type SettleChallengePayload } from "@/data/product-data";
import { getChallengeById, reportChallengeResultFromPluginRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as Partial<SettleChallengePayload>;

  if (!payload.winnerSlug) {
    return NextResponse.json({ message: "winnerSlug is required" }, { status: 400 });
  }

  try {
    const challenge = await reportChallengeResultFromPluginRecord(id, payload as SettleChallengePayload);
    const latest = await getChallengeById(id);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${id}`);
    revalidatePath(`/replay/${id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      challenge: latest ?? challenge,
      replayHref: `/replay/${id}`,
      message: "Challenge result synced from OpenClaw matchmaking flow.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Challenge result reporting failed" },
      { status: 400 },
    );
  }
}
