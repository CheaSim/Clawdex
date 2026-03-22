import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type ReadyChallengePayload } from "@/data/product-data";
import { markChallengeReadyFromPluginRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as Partial<ReadyChallengePayload>;

  try {
    const challenge = await markChallengeReadyFromPluginRecord(id, payload);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${id}`);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      challenge,
      message: "Challenge marked ready for OpenClaw battle start.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Challenge ready sync failed" },
      { status: 400 },
    );
  }
}
