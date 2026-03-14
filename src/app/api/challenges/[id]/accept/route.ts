import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { acceptChallengeRecord } from "@/lib/mock-db";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const { challenge } = await acceptChallengeRecord(id);

    revalidatePath("/challenge");
    revalidatePath(`/challenge/${challenge.id}`);
    revalidatePath(`/players/${challenge.challengerSlug}`);
    revalidatePath(`/players/${challenge.defenderSlug}`);

    return NextResponse.json({
      message: "挑战已接受，双方押注已经锁池。",
      challenge,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "接受挑战失败，请稍后再试。";
    const status = message === "挑战不存在" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
