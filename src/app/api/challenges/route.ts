import { NextResponse } from "next/server";

import { type CreateChallengePayload, getPlayerBySlug } from "@/data/product-data";
import { buildSettlementPreview, validateChallengePayload } from "@/lib/settlement";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<CreateChallengePayload>;
  const validationError = validateChallengePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  if (!getPlayerBySlug(payload.challengerSlug as string) || !getPlayerBySlug(payload.defenderSlug as string)) {
    return NextResponse.json({ message: "挑战双方必须是有效选手" }, { status: 400 });
  }

  const challengeId = `challenge-${Date.now()}`;
  const preview = buildSettlementPreview(payload as CreateChallengePayload);

  return NextResponse.json({
    challengeId,
    message: "挑战已创建并进入待确认队列",
    preview,
  });
}
