import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { canAcceptChallengeForPlayer, getCurrentUserRecord } from "@/lib/auth-guard";
import { acceptChallengeRecord, getChallengeById } from "@/lib/mock-db";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ message: "请先登录后再接受挑战。" }, { status: 401 });
  }

  const { id } = await context.params;
  const existingChallenge = await getChallengeById(id);

  if (!existingChallenge) {
    return NextResponse.json({ message: "挑战不存在" }, { status: 404 });
  }

  if (!canAcceptChallengeForPlayer(currentUser, existingChallenge.defenderSlug)) {
    return NextResponse.json({ message: "只有被挑战方或管理员可以接受这场挑战。" }, { status: 403 });
  }

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
    return NextResponse.json({ message }, { status: 400 });
  }
}
