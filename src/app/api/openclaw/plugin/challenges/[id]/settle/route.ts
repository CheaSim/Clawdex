import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type SettleChallengePayload } from "@/data/product-data";
import { getChallengeById, settleChallengeRecord } from "@/lib/mock-db";
import { buildOpenClawErrorResponse } from "@/lib/openclaw-plugin-diagnostics";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as Partial<SettleChallengePayload>;

  if (!payload.winnerSlug) {
    return NextResponse.json(
      buildOpenClawErrorResponse(new Error("winnerSlug is required"), { status: 400 }),
      { status: 400 },
    );
  }

  try {
    const challenge = await settleChallengeRecord(id, payload as SettleChallengePayload);
    const latest = await getChallengeById(id);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      challenge: latest ?? challenge,
      message: "Challenge settlement synced from OpenClaw.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Challenge settlement failed";
    const status = message === "挑战不存在" ? 404 : 400;
    return NextResponse.json(
      buildOpenClawErrorResponse(error, { status, fallbackMessage: "Challenge settlement failed" }),
      { status },
    );
  }
}
