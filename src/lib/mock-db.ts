import { promises as fs } from "fs";
import path from "path";

import {
  challengeStatusMeta,
  getModeLabel,
  isPlayerOpenClawReady,
  seedDatabase,
  type AcceptChallengePayload,
  type CreateChallengePayload,
  type MatchListing,
  type MockDatabase,
  type OpenClawIntegration,
  type PlayerProfile,
  type SettleChallengePayload,
  type UpdateOpenClawPayload,
} from "@/data/product-data";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { buildSettlementPreview, computeSettlementNumbers } from "@/lib/settlement";

const dbFilePath = path.join(process.cwd(), "data", "mock-db.json");

async function getPrismaDb() {
  return import("@/lib/prisma-db");
}

function cloneSeedDatabase() {
  return JSON.parse(JSON.stringify(seedDatabase)) as MockDatabase;
}

function normalizeOpenClawIntegration(
  integration: Partial<OpenClawIntegration> | undefined,
  seedIntegration: OpenClawIntegration,
): OpenClawIntegration {
  return {
    channel: integration?.channel ?? seedIntegration.channel,
    accountId: integration?.accountId ?? seedIntegration.accountId,
    region: integration?.region ?? seedIntegration.region,
    clientVersion: integration?.clientVersion ?? seedIntegration.clientVersion,
    status: integration?.status ?? seedIntegration.status,
    configuredAt: integration?.configuredAt ?? seedIntegration.configuredAt,
    lastVerifiedAt: integration?.lastVerifiedAt ?? seedIntegration.lastVerifiedAt,
    notes: integration?.notes ?? seedIntegration.notes,
  };
}

function createFallbackOpenClawIntegration(player: Partial<PlayerProfile>): OpenClawIntegration {
  return {
    channel: `${player.name ?? player.slug ?? "OpenClaw"} Channel`,
    accountId: player.slug ?? "unknown-player",
    region: "CN",
    clientVersion: "0.0.0",
    status: "disconnected",
    notes: "从旧数据迁移而来，等待首次配置 OpenClaw 通道。",
  };
}

function normalizePlayerProfile(player: Partial<PlayerProfile>, seedPlayer: PlayerProfile): PlayerProfile {
  return {
    ...seedPlayer,
    ...player,
    openClaw: normalizeOpenClawIntegration(player.openClaw, seedPlayer.openClaw),
  };
}

async function ensureDatabaseFile() {
  try {
    await fs.access(dbFilePath);
  } catch {
    await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
    await fs.writeFile(dbFilePath, JSON.stringify(cloneSeedDatabase(), null, 2), "utf-8");
  }
}

async function readDatabase() {
  await ensureDatabaseFile();
  const raw = await fs.readFile(dbFilePath, "utf-8");
  const parsed = JSON.parse(raw) as MockDatabase;
  const seedPlayerMap = new Map(seedDatabase.players.map((player) => [player.slug, player]));

  const normalizedPlayers = (parsed.players ?? []).map((player) => {
    const seedPlayer = seedPlayerMap.get(player.slug);

    if (seedPlayer) {
      return normalizePlayerProfile(player, seedPlayer);
    }

    return {
      ...(player as PlayerProfile),
      openClaw: normalizeOpenClawIntegration(player.openClaw, createFallbackOpenClawIntegration(player)),
    };
  });

  for (const seedPlayer of seedDatabase.players) {
    if (!normalizedPlayers.some((player) => player.slug === seedPlayer.slug)) {
      normalizedPlayers.push(seedPlayer);
    }
  }

  const normalizedDatabase: MockDatabase = {
    players: normalizedPlayers,
    challenges: parsed.challenges ?? seedDatabase.challenges,
  };

  if (JSON.stringify(parsed) !== JSON.stringify(normalizedDatabase)) {
    await writeDatabase(normalizedDatabase);
  }

  return normalizedDatabase;
}

async function writeDatabase(database: MockDatabase) {
  await fs.writeFile(dbFilePath, JSON.stringify(database, null, 2), "utf-8");
}

function sortChallenges(challenges: MatchListing[]) {
  return [...challenges].sort((left, right) => {
    const leftScore = Date.parse(left.acceptedAt ?? left.createdAt);
    const rightScore = Date.parse(right.acceptedAt ?? right.createdAt);
    return rightScore - leftScore;
  });
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

export async function listPlayers() {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.listPlayersFromPrisma();
  }

  const database = await readDatabase();
  return database.players;
}

export async function getPlayerBySlugFromDb(slug: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getPlayerBySlugFromPrisma(slug);
  }

  const database = await readDatabase();
  return database.players.find((player) => player.slug === slug) ?? null;
}

export async function listChallenges() {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.listChallengesFromPrisma();
  }

  const database = await readDatabase();
  return sortChallenges(database.challenges);
}

export async function getChallengeById(id: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getChallengeByIdFromPrisma(id);
  }

  const database = await readDatabase();
  return database.challenges.find((challenge) => challenge.id === id) ?? null;
}

export async function createChallengeRecord(payload: CreateChallengePayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.createChallengeRecordInPrisma(payload);
  }

  const database = await readDatabase();
  const challenger = database.players.find((player) => player.slug === payload.challengerSlug);
  const defender = database.players.find((player) => player.slug === payload.defenderSlug);

  if (!challenger || !defender) {
    throw new Error("挑战双方必须是有效选手");
  }

  assertPlayerReadyForBattle(challenger, "发起挑战");
  assertPlayerReadyForBattle(defender, "被预约挑战");

  if (challenger.clawPoints < payload.stake) {
    throw new Error(`${challenger.name} 钱包余额不足，无法冻结 ${payload.stake} Claw Points`);
  }

  challenger.clawPoints -= payload.stake;

  const challenge: MatchListing = {
    id: `challenge-${Date.now()}`,
    mode: payload.mode,
    challengerSlug: payload.challengerSlug,
    defenderSlug: payload.defenderSlug,
    stake: payload.stake,
    rewardPool: payload.stake,
    scheduledFor: payload.scheduledFor,
    visibility: payload.visibility,
    status: "pending",
    storyline: createStoryline(payload, challenger, defender),
    createdAt: new Date().toISOString(),
    rulesNote: payload.rulesNote,
    preview: buildSettlementPreview(payload),
  };

  database.challenges.unshift(challenge);
  await writeDatabase(database);

  return { challenge, challenger, defender };
}

export async function acceptChallengeRecord(id: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.acceptChallengeRecordInPrisma(id);
  }

  const database = await readDatabase();
  const challenge = database.challenges.find((item) => item.id === id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  if (challenge.status !== "pending") {
    throw new Error(`当前挑战状态为 ${challengeStatusMeta[challenge.status].label}，不能重复接受`);
  }

  const defender = database.players.find((player) => player.slug === challenge.defenderSlug);
  const challenger = database.players.find((player) => player.slug === challenge.challengerSlug);

  if (!defender || !challenger) {
    throw new Error("挑战双方信息异常，请刷新后重试");
  }

  assertPlayerReadyForBattle(challenger, "进入对战");
  assertPlayerReadyForBattle(defender, "接受挑战");

  if (defender.clawPoints < challenge.stake) {
    throw new Error(`${defender.name} 钱包余额不足，无法接受这场挑战`);
  }

  defender.clawPoints -= challenge.stake;
  challenge.status = "accepted";
  challenge.rewardPool = challenge.stake * 2;
  challenge.acceptedAt = new Date().toISOString();
  challenge.storyline = `${defender.name} 已接战，${challenger.name} 与 ${defender.name} 的奖池现已锁定为 ${challenge.rewardPool} Claw Points。`;

  await writeDatabase(database);

  return { challenge, challenger, defender };
}

export async function acceptChallengeFromPluginRecord(id: string, payload?: AcceptChallengePayload) {
  const challenge = await getChallengeById(id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  if (payload?.defenderSlug && payload.defenderSlug !== challenge.defenderSlug) {
    throw new Error("defenderSlug 与挑战记录不一致");
  }

  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.acceptChallengeFromPluginRecordInPrisma(id, payload);
  }

  const result = await acceptChallengeRecord(id);

  if (payload?.sourceChannel || payload?.sourceSessionId) {
    const database = await readDatabase();
    const latest = database.challenges.find((item) => item.id === id);

    if (latest) {
      latest.sourceChannel = payload.sourceChannel ?? latest.sourceChannel ?? "clawdex-channel";
      latest.sourceSessionId = payload.sourceSessionId ?? latest.sourceSessionId;
      await writeDatabase(database);
      result.challenge = latest;
    }
  }

  return result;
}

export async function updatePlayerOpenClawRecord(slug: string, payload: UpdateOpenClawPayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.updatePlayerOpenClawRecordInPrisma(slug, payload);
  }

  const database = await readDatabase();
  const player = database.players.find((entry) => entry.slug === slug);

  if (!player) {
    throw new Error("玩家不存在");
  }

  const configuredAt = player.openClaw.configuredAt ?? new Date().toISOString();

  player.openClaw = {
    channel: payload.channel.trim(),
    accountId: payload.accountId.trim(),
    region: payload.region,
    clientVersion: payload.clientVersion.trim(),
    status: payload.status,
    configuredAt,
    lastVerifiedAt: payload.status === "ready" ? new Date().toISOString() : undefined,
    notes: payload.notes?.trim() || undefined,
  };

  await writeDatabase(database);
  return player;
}

export async function settleChallengeRecord(id: string, payload: SettleChallengePayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.settleChallengeRecordInPrisma(id, payload);
  }

  const database = await readDatabase();
  const challenge = database.challenges.find((item) => item.id === id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  if (![challenge.challengerSlug, challenge.defenderSlug].includes(payload.winnerSlug)) {
    throw new Error("winnerSlug 必须是本场挑战的参与者");
  }

  const winner = database.players.find((p) => p.slug === payload.winnerSlug);
  const loserSlug = payload.winnerSlug === challenge.challengerSlug ? challenge.defenderSlug : challenge.challengerSlug;
  const loser = database.players.find((p) => p.slug === loserSlug);
  const nums = computeSettlementNumbers(challenge.mode, challenge.stake);

  if (winner) {
    winner.clawPoints += nums.winnerClawPoints;
    winner.elo += nums.eloWin;
    winner.fame += nums.fameWin;
    winner.streak += 1;
    const winnerTotal = database.challenges.filter(
      (c) => c.status === "settlement" && (c.challengerSlug === winner.slug || c.defenderSlug === winner.slug),
    ).length + 1;
    const winnerWins = database.challenges.filter(
      (c) => c.status === "settlement" && c.winnerSlug === winner.slug,
    ).length + 1;
    winner.winRate = `${Math.round((winnerWins / winnerTotal) * 100)}%`;
  }

  if (loser) {
    loser.elo = Math.max(0, loser.elo - nums.eloLose);
    loser.streak = 0;
    const loserTotal = database.challenges.filter(
      (c) => c.status === "settlement" && (c.challengerSlug === loser.slug || c.defenderSlug === loser.slug),
    ).length + 1;
    const loserWins = database.challenges.filter(
      (c) => c.status === "settlement" && c.winnerSlug === loser.slug,
    ).length;
    loser.winRate = `${Math.round((loserWins / loserTotal) * 100)}%`;
  }

  challenge.status = "settlement";
  challenge.winnerSlug = payload.winnerSlug;
  challenge.settledAt = new Date().toISOString();
  challenge.sourceChannel = payload.sourceChannel ?? challenge.sourceChannel ?? "clawdex-channel";
  challenge.sourceSessionId = payload.sourceSessionId ?? challenge.sourceSessionId;
  challenge.settlementSummary = payload.settlementSummary
    ?? `${winner?.name ?? payload.winnerSlug} 赢得本场，获得 ${nums.winnerClawPoints} Claw Points + ${nums.eloWin} Elo + ${nums.fameWin} Fame。`;
  challenge.storyline = challenge.settlementSummary;

  await writeDatabase(database);

  return challenge;
}

export async function getDataStoreStatus() {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getDataStoreStatusFromPrisma();
  }

  const database = await readDatabase();
  return {
    provider: "mock" as const,
    healthy: true,
    players: database.players.length,
    challenges: database.challenges.length,
    readyPlayers: database.players.filter((player) => player.openClaw.status === "ready").length,
  };
}
