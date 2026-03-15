import { ChallengeStatus, MatchMode, OpenClawConnectionStatus, OpenClawRegion, WalletLedgerType, type Prisma } from "@/generated/prisma/client";

import {
  challengeStatusMeta,
  getModeLabel,
  isPlayerOpenClawReady,
  type AcceptChallengePayload,
  type CreateChallengePayload,
  type MatchListing,
  type OpenClawIntegration,
  type PlayerProfile,
  type SettleChallengePayload,
  type UpdateOpenClawPayload,
} from "@/data/product-data";
import { prisma } from "@/lib/prisma";
import { buildSettlementPreview, computeSettlementNumbers } from "@/lib/settlement";

type PlayerWithOpenClaw = Prisma.PlayerGetPayload<{ include: { openClawAccount: true } }>;

const modeToPrisma: Record<CreateChallengePayload["mode"], MatchMode> = {
  "public-arena": MatchMode.PUBLIC_ARENA,
  rivalry: MatchMode.RIVALRY,
  "ranked-1v1": MatchMode.RANKED_1V1,
};

const modeFromPrisma: Record<MatchMode, CreateChallengePayload["mode"]> = {
  [MatchMode.PUBLIC_ARENA]: "public-arena",
  [MatchMode.RIVALRY]: "rivalry",
  [MatchMode.RANKED_1V1]: "ranked-1v1",
};

const statusFromPrisma: Record<ChallengeStatus, MatchListing["status"]> = {
  [ChallengeStatus.PENDING]: "pending",
  [ChallengeStatus.ACCEPTED]: "accepted",
  [ChallengeStatus.LIVE]: "live",
  [ChallengeStatus.SETTLEMENT]: "settlement",
};

const openClawStatusFromPrisma: Record<OpenClawConnectionStatus, OpenClawIntegration["status"]> = {
  [OpenClawConnectionStatus.DISCONNECTED]: "disconnected",
  [OpenClawConnectionStatus.CONFIGURED]: "configured",
  [OpenClawConnectionStatus.READY]: "ready",
};

const openClawStatusToPrisma: Record<OpenClawIntegration["status"], OpenClawConnectionStatus> = {
  disconnected: OpenClawConnectionStatus.DISCONNECTED,
  configured: OpenClawConnectionStatus.CONFIGURED,
  ready: OpenClawConnectionStatus.READY,
};

function mapRegion(region: OpenClawRegion): OpenClawIntegration["region"] {
  return region as OpenClawIntegration["region"];
}

function buildPlayerProfile(player: PlayerWithOpenClaw): PlayerProfile {
  return {
    slug: player.slug,
    name: player.name,
    title: player.title ?? "Clawdex 玩家",
    avatar: player.avatar ?? player.name.slice(0, 2).toUpperCase(),
    elo: player.elo,
    fame: player.fame,
    streak: player.streak,
    winRate: `${Math.round(player.winRate)}%`,
    clawPoints: player.clawPoints,
    preferredMode: modeFromPrisma[player.preferredMode],
    bio: player.bio ?? "这名玩家正在通过 Prisma 数据层沉淀自己的挑战历史。",
    tags: player.tags,
    recentMoments: player.recentMoments,
    openClaw: {
      channel: player.openClawAccount?.channel ?? "Unconfigured Channel",
      accountId: player.openClawAccount?.accountId ?? player.slug,
      region: mapRegion(player.openClawAccount?.region ?? OpenClawRegion.CN),
      clientVersion: player.openClawAccount?.clientVersion ?? "0.0.0",
      status: openClawStatusFromPrisma[player.openClawAccount?.status ?? OpenClawConnectionStatus.DISCONNECTED],
      configuredAt: player.openClawAccount?.configuredAt?.toISOString(),
      lastVerifiedAt: player.openClawAccount?.lastVerifiedAt?.toISOString(),
      notes: player.openClawAccount?.notes ?? undefined,
    },
  };
}

function buildMatchListing(challenge: Prisma.ChallengeGetPayload<{}>): MatchListing {
  const previewPayload = challenge.preview as MatchListing["preview"];

  return {
    id: challenge.id,
    mode: modeFromPrisma[challenge.mode],
    challengerSlug: "",
    defenderSlug: "",
    stake: challenge.stake,
    rewardPool: challenge.rewardPool,
    scheduledFor: challenge.scheduledLabel,
    visibility: challenge.visibility === "PUBLIC" ? "public" : "followers",
    status: statusFromPrisma[challenge.status],
    storyline: challenge.storyline,
    createdAt: challenge.createdAt.toISOString(),
    acceptedAt: challenge.acceptedAt?.toISOString(),
    settledAt: challenge.settledAt?.toISOString(),
    rulesNote: challenge.rulesNote ?? undefined,
    winnerSlug: undefined,
    settlementSummary: challenge.settlementSummary ?? undefined,
    sourceChannel: challenge.sourceChannel ?? undefined,
    sourceSessionId: challenge.sourceSessionId ?? undefined,
    preview: previewPayload,
  };
}

function createStoryline(payload: CreateChallengePayload, challenger: PlayerProfile, defender: PlayerProfile) {
  const modeLabel = getModeLabel(payload.mode);
  return `${challenger.name} 发起一场${modeLabel}，目标是从 ${defender.name} 手里抢走更高曝光和奖励池。`;
}

function assertPlayerReadyForBattle(player: PlayerProfile, actionLabel: string) {
  if (!isPlayerOpenClawReady(player)) {
    throw new Error(`${player.name} 尚未完成 OpenClaw 通道校验，暂时不能${actionLabel}。`);
  }
}

async function getChallengeWithParticipants(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      challenger: { include: { openClawAccount: true } },
      defender: { include: { openClawAccount: true } },
      settlement: true,
    },
  });
}

export async function listPlayersFromPrisma() {
  const players = await prisma.player.findMany({ include: { openClawAccount: true }, orderBy: { elo: "desc" } });
  return players.map(buildPlayerProfile);
}

export async function getPlayerBySlugFromPrisma(slug: string) {
  const player = await prisma.player.findUnique({ where: { slug }, include: { openClawAccount: true } });
  return player ? buildPlayerProfile(player) : null;
}

export async function listChallengesFromPrisma() {
  const challenges = await prisma.challenge.findMany({
    include: {
      challenger: { include: { openClawAccount: true } },
      defender: { include: { openClawAccount: true } },
      settlement: true,
    },
    orderBy: [{ acceptedAt: "desc" }, { createdAt: "desc" }],
  });

  return challenges.map((challenge) => {
    const listing = buildMatchListing(challenge);
    listing.challengerSlug = challenge.challenger.slug;
    listing.defenderSlug = challenge.defender.slug;
    listing.winnerSlug = challenge.settlement?.winnerPlayerId === challenge.challenger.id
      ? challenge.challenger.slug
      : challenge.settlement?.winnerPlayerId === challenge.defender.id
        ? challenge.defender.slug
        : undefined;
    return listing;
  });
}

export async function getChallengeByIdFromPrisma(id: string) {
  const challenge = await getChallengeWithParticipants(id);

  if (!challenge) {
    return null;
  }

  const listing = buildMatchListing(challenge);
  listing.challengerSlug = challenge.challenger.slug;
  listing.defenderSlug = challenge.defender.slug;
  listing.winnerSlug = challenge.settlement?.winnerPlayerId === challenge.challenger.id
    ? challenge.challenger.slug
    : challenge.settlement?.winnerPlayerId === challenge.defender.id
      ? challenge.defender.slug
      : undefined;
  return listing;
}

export async function createChallengeRecordInPrisma(payload: CreateChallengePayload) {
  const [challengerRecord, defenderRecord] = await Promise.all([
    prisma.player.findUnique({ where: { slug: payload.challengerSlug }, include: { openClawAccount: true } }),
    prisma.player.findUnique({ where: { slug: payload.defenderSlug }, include: { openClawAccount: true } }),
  ]);

  if (!challengerRecord || !defenderRecord) {
    throw new Error("挑战双方必须是有效选手");
  }

  const challenger = buildPlayerProfile(challengerRecord);
  const defender = buildPlayerProfile(defenderRecord);

  assertPlayerReadyForBattle(challenger, "发起挑战");
  assertPlayerReadyForBattle(defender, "被预约挑战");

  if (challenger.clawPoints < payload.stake) {
    throw new Error(`${challenger.name} 钱包余额不足，无法冻结 ${payload.stake} Claw Points`);
  }

  const preview = buildSettlementPreview(payload);

  const challenge = await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: challengerRecord.id },
      data: { clawPoints: { decrement: payload.stake } },
    });

    const created = await tx.challenge.create({
      data: {
        mode: modeToPrisma[payload.mode],
        challengerId: challengerRecord.id,
        defenderId: defenderRecord.id,
        stake: payload.stake,
        rewardPool: payload.stake,
        visibility: payload.visibility === "public" ? "PUBLIC" : "FOLLOWERS",
        status: ChallengeStatus.PENDING,
        scheduledLabel: payload.scheduledFor,
        storyline: createStoryline(payload, challenger, defender),
        rulesNote: payload.rulesNote,
        preview,
      },
      include: {
        challenger: { include: { openClawAccount: true } },
        defender: { include: { openClawAccount: true } },
      },
    });

    await tx.challengeEvent.create({
      data: {
        challengeId: created.id,
        actorPlayerId: challengerRecord.id,
        type: "CREATED",
        payload: { via: "prisma" },
      },
    });

    return created;
  });

  return {
    challenge: {
      ...buildMatchListing(challenge),
      challengerSlug: challenge.challenger.slug,
      defenderSlug: challenge.defender.slug,
    },
    challenger,
    defender,
  };
}

export async function acceptChallengeRecordInPrisma(id: string) {
  const challenge = await getChallengeWithParticipants(id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  if (statusFromPrisma[challenge.status] !== "pending") {
    throw new Error(`当前挑战状态为 ${challengeStatusMeta[statusFromPrisma[challenge.status]].label}，不能重复接受`);
  }

  const challenger = buildPlayerProfile(challenge.challenger);
  const defender = buildPlayerProfile(challenge.defender);

  assertPlayerReadyForBattle(challenger, "进入对战");
  assertPlayerReadyForBattle(defender, "接受挑战");

  if (defender.clawPoints < challenge.stake) {
    throw new Error(`${defender.name} 钱包余额不足，无法接受这场挑战`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: challenge.defender.id },
      data: { clawPoints: { decrement: challenge.stake } },
    });

    const accepted = await tx.challenge.update({
      where: { id },
      data: {
        status: ChallengeStatus.ACCEPTED,
        rewardPool: challenge.stake * 2,
        acceptedAt: new Date(),
        storyline: `${defender.name} 已接战，${challenger.name} 与 ${defender.name} 的奖池现已锁定为 ${challenge.stake * 2} Claw Points。`,
      },
      include: {
        challenger: { include: { openClawAccount: true } },
        defender: { include: { openClawAccount: true } },
      },
    });

    await tx.challengeEvent.create({
      data: {
        challengeId: id,
        actorPlayerId: challenge.defender.id,
        type: "ACCEPTED",
        payload: { via: "prisma" },
      },
    });

    return accepted;
  });

  return {
    challenge: {
      ...buildMatchListing(updated),
      challengerSlug: updated.challenger.slug,
      defenderSlug: updated.defender.slug,
    },
    challenger,
    defender,
  };
}

export async function acceptChallengeFromPluginRecordInPrisma(id: string, payload?: AcceptChallengePayload) {
  const result = await acceptChallengeRecordInPrisma(id);

  if (payload?.sourceChannel || payload?.sourceSessionId) {
    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        sourceChannel: payload.sourceChannel ?? "clawdex-channel",
        sourceSessionId: payload.sourceSessionId,
      },
      include: {
        challenger: { include: { openClawAccount: true } },
        defender: { include: { openClawAccount: true } },
      },
    });

    result.challenge = {
      ...buildMatchListing(challenge),
      challengerSlug: challenge.challenger.slug,
      defenderSlug: challenge.defender.slug,
    };
  }

  return result;
}

export async function updatePlayerOpenClawRecordInPrisma(slug: string, payload: UpdateOpenClawPayload) {
  const player = await prisma.player.findUnique({ where: { slug }, include: { openClawAccount: true } });

  if (!player) {
    throw new Error("玩家不存在");
  }

  const configuredAt = player.openClawAccount?.configuredAt ?? new Date();

  const updated = await prisma.player.update({
    where: { slug },
    data: {
      openClawAccount: {
        upsert: {
          create: {
            channel: payload.channel.trim(),
            accountId: payload.accountId.trim(),
            region: payload.region as OpenClawRegion,
            clientVersion: payload.clientVersion.trim(),
            status: openClawStatusToPrisma[payload.status],
            configuredAt,
            lastVerifiedAt: payload.status === "ready" ? new Date() : null,
            notes: payload.notes?.trim() || null,
          },
          update: {
            channel: payload.channel.trim(),
            accountId: payload.accountId.trim(),
            region: payload.region as OpenClawRegion,
            clientVersion: payload.clientVersion.trim(),
            status: openClawStatusToPrisma[payload.status],
            configuredAt,
            lastVerifiedAt: payload.status === "ready" ? new Date() : null,
            notes: payload.notes?.trim() || null,
          },
        },
      },
    },
    include: { openClawAccount: true },
  });

  return buildPlayerProfile(updated);
}

export async function settleChallengeRecordInPrisma(id: string, payload: SettleChallengePayload) {
  const challenge = await getChallengeWithParticipants(id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  const winner = payload.winnerSlug === challenge.challenger.slug
    ? challenge.challenger
    : payload.winnerSlug === challenge.defender.slug
      ? challenge.defender
      : null;

  if (!winner) {
    throw new Error("winnerSlug 必须是本场挑战的参与者");
  }

  const loser = winner.id === challenge.challenger.id ? challenge.defender : challenge.challenger;
  const mode = modeFromPrisma[challenge.mode];
  const nums = computeSettlementNumbers(mode, challenge.stake);

  const summary = payload.settlementSummary ?? `${winner.name} 赢得本场，获得 ${nums.winnerClawPoints} Claw Points + ${nums.eloWin} Elo + ${nums.fameWin} Fame。`;

  const updated = await prisma.$transaction(async (tx) => {
    // --- transfer points, elo, fame, streak ---
    const winnerChallenges = await tx.challenge.count({
      where: {
        status: ChallengeStatus.SETTLEMENT,
        winnerPlayerId: winner.id,
      },
    });
    const winnerTotalPlayed = await tx.challenge.count({
      where: {
        OR: [{ challengerId: winner.id }, { defenderId: winner.id }],
        status: ChallengeStatus.SETTLEMENT,
      },
    });
    const loserChallenges = await tx.challenge.count({
      where: {
        status: ChallengeStatus.SETTLEMENT,
        winnerPlayerId: loser.id,
      },
    });
    const loserTotalPlayed = await tx.challenge.count({
      where: {
        OR: [{ challengerId: loser.id }, { defenderId: loser.id }],
        status: ChallengeStatus.SETTLEMENT,
      },
    });

    // +1 for current match
    const winnerNewWinRate = winnerTotalPlayed > 0
      ? ((winnerChallenges + 1) / (winnerTotalPlayed + 1)) * 100
      : 100;
    const loserNewWinRate = loserTotalPlayed > 0
      ? (loserChallenges / (loserTotalPlayed + 1)) * 100
      : 0;

    await tx.player.update({
      where: { id: winner.id },
      data: {
        clawPoints: { increment: nums.winnerClawPoints },
        elo: { increment: nums.eloWin },
        fame: { increment: nums.fameWin },
        streak: { increment: 1 },
        winRate: Math.round(winnerNewWinRate * 100) / 100,
      },
    });

    await tx.player.update({
      where: { id: loser.id },
      data: {
        elo: { decrement: nums.eloLose },
        streak: 0,
        winRate: Math.round(loserNewWinRate * 100) / 100,
      },
    });

    // --- wallet ledger ---
    const winnerWallet = await tx.playerWallet.upsert({
      where: { playerId: winner.id },
      create: { playerId: winner.id, availableBalance: 0, lockedBalance: 0 },
      update: {},
    });
    const loserWallet = await tx.playerWallet.upsert({
      where: { playerId: loser.id },
      create: { playerId: loser.id, availableBalance: 0, lockedBalance: 0 },
      update: {},
    });

    await tx.playerWallet.update({
      where: { id: winnerWallet.id },
      data: { availableBalance: { increment: nums.winnerClawPoints }, lastSyncedAt: new Date() },
    });
    await tx.walletLedger.create({
      data: {
        walletId: winnerWallet.id,
        challengeId: id,
        type: WalletLedgerType.CHALLENGE_REWARD,
        delta: nums.winnerClawPoints,
        balanceAfter: winnerWallet.availableBalance + nums.winnerClawPoints,
        reason: `胜场奖励 (${mode})`,
      },
    });

    await tx.walletLedger.create({
      data: {
        walletId: loserWallet.id,
        challengeId: id,
        type: WalletLedgerType.CHALLENGE_PENALTY,
        delta: -nums.loserClawPoints,
        balanceAfter: loserWallet.availableBalance - nums.loserClawPoints,
        reason: `败场扣除 (${mode})`,
      },
    });

    // --- challenge record ---
    const challengeRecord = await tx.challenge.update({
      where: { id },
      data: {
        status: ChallengeStatus.SETTLEMENT,
        settledAt: new Date(),
        sourceChannel: payload.sourceChannel ?? challenge.sourceChannel ?? "clawdex-channel",
        sourceSessionId: payload.sourceSessionId ?? challenge.sourceSessionId,
        settlementSummary: summary,
        storyline: summary,
        winnerPlayerId: winner.id,
      },
      include: {
        challenger: { include: { openClawAccount: true } },
        defender: { include: { openClawAccount: true } },
      },
    });

    await tx.challengeSettlement.upsert({
      where: { challengeId: id },
      create: {
        challengeId: id,
        winnerPlayerId: winner.id,
        summary,
        payload: {
          winnerClawPoints: nums.winnerClawPoints,
          loserClawPoints: nums.loserClawPoints,
          eloWin: nums.eloWin,
          eloLose: nums.eloLose,
          fameWin: nums.fameWin,
          platformReturn: nums.platformReturn,
        },
        sourceChannel: payload.sourceChannel ?? "clawdex-channel",
        sourceSessionId: payload.sourceSessionId,
      },
      update: {
        winnerPlayerId: winner.id,
        summary,
        payload: {
          winnerClawPoints: nums.winnerClawPoints,
          loserClawPoints: nums.loserClawPoints,
          eloWin: nums.eloWin,
          eloLose: nums.eloLose,
          fameWin: nums.fameWin,
          platformReturn: nums.platformReturn,
        },
        sourceChannel: payload.sourceChannel ?? "clawdex-channel",
        sourceSessionId: payload.sourceSessionId,
        settledAt: new Date(),
      },
    });

    await tx.challengeEvent.create({
      data: {
        challengeId: id,
        actorPlayerId: winner.id,
        type: "SETTLED",
        sourceChannel: payload.sourceChannel ?? "clawdex-channel",
        sourceSessionId: payload.sourceSessionId,
        payload: { winnerSlug: payload.winnerSlug, summary, ...nums },
      },
    });

    return challengeRecord;
  });

  return {
    ...buildMatchListing(updated),
    challengerSlug: updated.challenger.slug,
    defenderSlug: updated.defender.slug,
    winnerSlug: winner.slug,
  };
}

export async function getDataStoreStatusFromPrisma() {
  const [players, challenges, readyPlayers] = await Promise.all([
    prisma.player.count(),
    prisma.challenge.count(),
    prisma.openClawAccount.count({ where: { status: OpenClawConnectionStatus.READY } }),
  ]);

  return {
    provider: "prisma" as const,
    healthy: true,
    players,
    challenges,
    readyPlayers,
  };
}
