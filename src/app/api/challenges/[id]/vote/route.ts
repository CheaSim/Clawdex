import { NextResponse } from "next/server";

import { getCurrentUserRecord } from "@/lib/auth-guard";
import {
  buildJudgeRewardReason,
  computeJudgeWalletBalanceAfter,
  getJudgeReward,
  isJudgeVoteType,
  validateJudgeVoteTarget,
} from "@/lib/challenge-vote";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { getChallengeById } from "@/lib/mock-db";
import { prisma } from "@/lib/prisma";

type VotePayload = {
  voteType: "MVP" | "MOMENT" | "SUPPORT";
  targetPlayerSlug?: string;
  score?: number;
};

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!isPrismaBackendEnabled()) {
    return NextResponse.json({ votes: [], counts: {} });
  }

  const { id } = await context.params;
  const votes = await prisma.spectatorVote.groupBy({
    by: ["voteType", "playerId"],
    where: { challengeId: id },
    _count: { id: true },
  });

  return NextResponse.json({ votes });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ message: "请先登录后再投票。" }, { status: 401 });
  }

  if (!isPrismaBackendEnabled()) {
    return NextResponse.json({ message: "投票需要 Prisma 后端。" }, { status: 400 });
  }

  const voterPlayer = currentUser.player;
  const voterPlayerId = voterPlayer?.id;

  if (!voterPlayer || !voterPlayerId) {
    return NextResponse.json({ message: "你需要先绑定选手身份才能投票。" }, { status: 403 });
  }

  const { id } = await context.params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return NextResponse.json({ message: "挑战不存在。" }, { status: 404 });
  }

  if (voterPlayer.slug === challenge.challengerSlug || voterPlayer.slug === challenge.defenderSlug) {
    return NextResponse.json({ message: "参赛选手不能为自己的比赛投票。" }, { status: 403 });
  }

  const payload = (await request.json()) as Partial<VotePayload>;
  if (!payload.voteType || !isJudgeVoteType(payload.voteType)) {
    return NextResponse.json({ message: "无效的投票类型。" }, { status: 400 });
  }

  const voteType = payload.voteType;
  const targetValidationError = validateJudgeVoteTarget({
    voteType,
    targetPlayerSlug: payload.targetPlayerSlug,
    challengerSlug: challenge.challengerSlug,
    defenderSlug: challenge.defenderSlug,
  });

  if (targetValidationError) {
    return NextResponse.json({ message: targetValidationError }, { status: 400 });
  }

  let targetPlayerId: string | null = null;
  if (payload.targetPlayerSlug) {
    const player = await prisma.player.findUnique({ where: { slug: payload.targetPlayerSlug } });
    if (!player) {
      return NextResponse.json({ message: "目标玩家不存在。" }, { status: 404 });
    }
    targetPlayerId = player.id;
  }

  const existing = await prisma.spectatorVote.findFirst({
    where: {
      challengeId: id,
      voterId: voterPlayerId,
      voteType,
    },
  });

  if (existing) {
    return NextResponse.json({ message: "你已经投过这票了。" }, { status: 409 });
  }

  const reward = getJudgeReward(voteType);

  const result = await prisma.$transaction(async (tx) => {
    const vote = await tx.spectatorVote.create({
      data: {
        challengeId: id,
        voterId: voterPlayerId,
        playerId: targetPlayerId,
        voteType,
        score: payload.score ?? null,
      },
    });

    const updatedPlayer = await tx.player.update({
      where: { id: voterPlayerId },
      data: { clawPoints: { increment: reward } },
    });

    const wallet = await tx.playerWallet.upsert({
      where: { playerId: voterPlayerId },
      create: { playerId: voterPlayerId, availableBalance: reward },
      update: { availableBalance: { increment: reward } },
    });

    await tx.walletLedger.create({
      data: {
        walletId: wallet.id,
        challengeId: id,
        type: "JUDGE_REWARD",
        delta: reward,
        balanceAfter: computeJudgeWalletBalanceAfter(wallet.availableBalance, reward),
        reason: buildJudgeRewardReason(voteType),
      },
    });

    return { vote, reward, newBalance: updatedPlayer.clawPoints };
  });

  return NextResponse.json({
    ok: true,
    vote: result.vote,
    reward: result.reward,
    newBalance: result.newBalance,
  });
}
