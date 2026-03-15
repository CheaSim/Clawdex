import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type AcceptChallengePayload } from "@/data/product-data";
import { acceptChallengeFromPluginRecord } from "@/lib/mock-db";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as Partial<AcceptChallengePayload>;

  try {
    const { challenge } = await acceptChallengeFromPluginRecord(id, payload as AcceptChallengePayload);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${challenge.id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      challenge,
      message: "Challenge accepted through Clawdex OpenClaw adapter.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Challenge accept failed";
    const status = message === "挑战不存在" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
