import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { type CreateChallengePayload } from "@/data/product-data";
import { createChallengeRecord, listChallenges } from "@/lib/mock-db";
import { validateChallengePayload } from "@/lib/settlement";

export async function GET() {
  const challenges = await listChallenges();
  return NextResponse.json(challenges);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<CreateChallengePayload>;
  const validationError = validateChallengePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const { challenge } = await createChallengeRecord(payload as CreateChallengePayload);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${challenge.id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      challengeId: challenge.id,
      message: "挑战已创建，发起方押注已冻结，等待对手接受。",
      preview: challenge.preview,
      challenge,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "创建挑战失败，请稍后再试。" },
      { status: 400 },
    );
  }
}
