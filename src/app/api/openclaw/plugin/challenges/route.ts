import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type CreateChallengePayload } from "@/data/product-data";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";
import { createChallengeRecord } from "@/lib/mock-db";
import { validateChallengePayload } from "@/lib/settlement";

export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);

  if (unauthorized) {
    return unauthorized;
  }

  const payload = (await request.json()) as Partial<CreateChallengePayload>;
  const validationError = validateChallengePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const { challenge } = await createChallengeRecord(payload as CreateChallengePayload);

    revalidatePath("/challenge");
    revalidatePath("/challenge/new");
    revalidatePath(`/challenge/${challenge.id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      ok: true,
      channel: "clawdex-channel",
      challenge,
      message: "Challenge created through Clawdex OpenClaw adapter.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Challenge creation failed" },
      { status: 400 },
    );
  }
}
