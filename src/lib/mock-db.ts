import { promises as fs } from "fs";
import path from "path";

import {
  challengeStatusMeta,
  getModeLabel,
  isPlayerOpenClawReady,
  seedDatabase,
  type AcceptChallengePayload,
  type CreateChallengePayload,
  type CreateDebatePayload,
  type JoinMatchmakingPayload,
  type LeaveMatchmakingPayload,
  type MatchmakingFeedRecord,
  type MatchmakingQueueEntry,
  type MatchmakingStatusRecord,
  type MatchListing,
  type MockDatabase,
  type OpenClawIntegration,
  type PlayerProfile,
  type ReadyChallengePayload,
  type SettleChallengePayload,
  type SubmitArgumentPayload,
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

const MATCHMAKING_ELO_THRESHOLD = 150;
const MATCHMAKING_WAIT_BASE_SECONDS = 45;

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
    matchmakingQueue: parsed.matchmakingQueue ?? seedDatabase.matchmakingQueue ?? [],
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

function getPlayerActiveChallenge(database: MockDatabase, playerSlug: string) {
  return database.challenges.find((challenge) => {
    if (![challenge.challengerSlug, challenge.defenderSlug].includes(playerSlug)) {
      return false;
    }

    return challenge.status === "pending" || challenge.status === "accepted" || challenge.status === "live";
  }) ?? null;
}

function getActiveQueueEntry(database: MockDatabase, playerSlug: string) {
  return (database.matchmakingQueue ?? []).find((entry) => entry.playerSlug === playerSlug && entry.status !== "cancelled") ?? null;
}

function getCompatibleQueueOpponent(
  database: MockDatabase,
  player: PlayerProfile,
  payload: JoinMatchmakingPayload,
) {
  return (database.matchmakingQueue ?? []).find((entry) => {
    if (entry.playerSlug === player.slug || entry.status !== "queued") {
      return false;
    }

    if (entry.mode !== payload.mode || entry.stake !== payload.stake) {
      return false;
    }

    const opponent = database.players.find((candidate) => candidate.slug === entry.playerSlug);

    if (!opponent || !isPlayerOpenClawReady(opponent)) {
      return false;
    }

    return Math.abs(opponent.elo - player.elo) <= MATCHMAKING_ELO_THRESHOLD;
  }) ?? null;
}

function buildQueueEntry(payload: JoinMatchmakingPayload): MatchmakingQueueEntry {
  return {
    id: `queue-${Date.now()}-${payload.playerSlug}`,
    playerSlug: payload.playerSlug,
    mode: payload.mode,
    stake: payload.stake,
    status: "queued",
    createdAt: new Date().toISOString(),
    sourceChannel: payload.sourceChannel,
    sourceSessionId: payload.sourceSessionId,
  };
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

export async function joinMatchmakingQueueRecord(payload: JoinMatchmakingPayload): Promise<MatchmakingStatusRecord> {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.joinMatchmakingQueueRecordInPrisma(payload);
  }

  const database = await readDatabase();
  const player = database.players.find((entry) => entry.slug === payload.playerSlug);

  if (!player) {
    throw new Error("Player not found");
  }

  assertPlayerReadyForBattle(player, "进入匹配");

  if (player.clawPoints < payload.stake) {
    throw new Error(`${player.name} wallet balance is too low for stake ${payload.stake}`);
  }

  if (getPlayerActiveChallenge(database, player.slug)) {
    throw new Error(`${player.name} already has an active challenge`);
  }

  const existing = getActiveQueueEntry(database, player.slug);

  if (existing?.status === "matched" && existing.challengeId) {
    return {
      playerSlug: player.slug,
      status: "matched",
      queueEntry: existing,
      challenge: database.challenges.find((challenge) => challenge.id === existing.challengeId),
    };
  }

  if (existing?.status === "queued") {
    existing.mode = payload.mode;
    existing.stake = payload.stake;
    existing.sourceChannel = payload.sourceChannel ?? existing.sourceChannel;
    existing.sourceSessionId = payload.sourceSessionId ?? existing.sourceSessionId;
  } else if (!existing) {
    (database.matchmakingQueue ??= []).push(buildQueueEntry(payload));
  }

  const queueEntry = getActiveQueueEntry(database, player.slug);

  if (!queueEntry) {
    throw new Error("Failed to create matchmaking queue entry");
  }

  const opponentEntry = getCompatibleQueueOpponent(database, player, payload);

  if (!opponentEntry) {
    await writeDatabase(database);
    return {
      playerSlug: player.slug,
      status: "queued",
      queueEntry,
    };
  }

  const opponent = database.players.find((entry) => entry.slug === opponentEntry.playerSlug);

  if (!opponent) {
    throw new Error("Matched opponent not found");
  }

  const challengerSlug = queueEntry.createdAt <= opponentEntry.createdAt ? queueEntry.playerSlug : opponentEntry.playerSlug;
  const defenderSlug = challengerSlug === queueEntry.playerSlug ? opponentEntry.playerSlug : queueEntry.playerSlug;
  const sourceChannel = payload.sourceChannel ?? queueEntry.sourceChannel ?? opponentEntry.sourceChannel;
  const sourceSessionId = payload.sourceSessionId ?? queueEntry.sourceSessionId ?? opponentEntry.sourceSessionId;

  await writeDatabase(database);

  const { challenge } = await createChallengeRecord({
    challengerSlug,
    defenderSlug,
    mode: payload.mode,
    stake: payload.stake,
    scheduledFor: "Matchmaking ready now",
    visibility: "public",
    rulesNote: "Auto-created by OpenClaw matchmaking queue",
  });

  const accepted = await acceptChallengeFromPluginRecord(challenge.id, {
    defenderSlug,
    sourceChannel,
    sourceSessionId,
  });

  const latestDatabase = await readDatabase();
  const latestQueue = latestDatabase.matchmakingQueue ?? [];
  const matchedAt = new Date().toISOString();

  for (const entry of latestQueue) {
    if (entry.id === queueEntry.id || entry.id === opponentEntry.id) {
      entry.status = "matched";
      entry.matchedAt = matchedAt;
      entry.challengeId = accepted.challenge.id;
      entry.sourceChannel = sourceChannel ?? entry.sourceChannel;
      entry.sourceSessionId = sourceSessionId ?? entry.sourceSessionId;
    }
  }

  await writeDatabase(latestDatabase);

  return {
    playerSlug: player.slug,
    status: "matched",
    queueEntry: latestQueue.find((entry) => entry.id === queueEntry.id),
    challenge: accepted.challenge,
  };
}

export async function leaveMatchmakingQueueRecord(payload: LeaveMatchmakingPayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.leaveMatchmakingQueueRecordInPrisma(payload);
  }

  const database = await readDatabase();
  const queueEntry = getActiveQueueEntry(database, payload.playerSlug);

  if (!queueEntry) {
    return { playerSlug: payload.playerSlug, status: "idle" as const };
  }

  queueEntry.status = "cancelled";
  queueEntry.cancelledAt = new Date().toISOString();

  await writeDatabase(database);

  return {
    playerSlug: payload.playerSlug,
    status: "cancelled" as const,
    queueEntry,
  };
}

export async function getMatchmakingStatusRecord(playerSlug: string): Promise<MatchmakingStatusRecord> {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getMatchmakingStatusRecordFromPrisma(playerSlug);
  }

  const database = await readDatabase();
  const queueEntry = getActiveQueueEntry(database, playerSlug);

  if (!queueEntry) {
    return { playerSlug, status: "idle" };
  }

  return {
    playerSlug,
    status: queueEntry.status,
    queueEntry,
    challenge: queueEntry.challengeId
      ? database.challenges.find((challenge) => challenge.id === queueEntry.challengeId)
      : undefined,
  };
}

export async function getMatchmakingFeedRecord(): Promise<MatchmakingFeedRecord> {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getMatchmakingFeedRecordFromPrisma();
  }

  const database = await readDatabase();
  const queue = (database.matchmakingQueue ?? []).filter((entry) => entry.status === "queued");
  const readyPlayers = database.players.filter((player) => player.openClaw.status === "ready");
  const modes = ["public-arena", "rivalry", "ranked-1v1"] as const;

  return {
    generatedAt: new Date().toISOString(),
    recommendedModes: readyPlayers
      .slice()
      .sort((left, right) => right.elo - left.elo)
      .map((player) => player.preferredMode)
      .filter((mode, index, list) => list.indexOf(mode) === index)
      .slice(0, 3),
    summaries: modes.map((mode) => {
      const queueCount = queue.filter((entry) => entry.mode === mode).length;
      const readyCount = readyPlayers.filter((player) => player.preferredMode === mode).length;

      return {
        mode,
        queueCount,
        readyPlayers: readyCount,
        estimatedWaitSeconds: queueCount > 0 ? MATCHMAKING_WAIT_BASE_SECONDS : MATCHMAKING_WAIT_BASE_SECONDS * 2,
      };
    }),
  };
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

export async function markChallengeReadyFromPluginRecord(id: string, payload?: ReadyChallengePayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.markChallengeReadyFromPluginRecordInPrisma(id, payload);
  }

  const database = await readDatabase();
  const challenge = database.challenges.find((item) => item.id === id);

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  if (challenge.status !== "accepted") {
    throw new Error("Challenge is not ready to start");
  }

  challenge.status = "live";
  challenge.sourceChannel = payload?.sourceChannel ?? challenge.sourceChannel ?? "clawdex-channel";
  challenge.sourceSessionId = payload?.sourceSessionId ?? challenge.sourceSessionId;

  await writeDatabase(database);
  return challenge;
}

export async function reportChallengeResultFromPluginRecord(id: string, payload: SettleChallengePayload) {
  return settleChallengeRecord(id, payload);
}

export async function resetMockDatabaseForTests(options?: { emptyChallenges?: boolean }) {
  const database = cloneSeedDatabase();

  if (options?.emptyChallenges) {
    database.challenges = [];
    database.matchmakingQueue = [];
  }

  await writeDatabase(database);
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

// ─── Debate PK (routing layer) ──────────────────────────────

import type { DebateInfo, DebateTopicInfo } from "@/data/product-data";
import { fetchPolymarketTopics } from "@/lib/debate";

export async function syncPolymarketTopics(limit = 10) {
  const topics = await fetchPolymarketTopics(limit);
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.upsertDebateTopicsFromPrisma(topics);
  }
  // mock: 直接返回爬取结果（不持久化）
  return topics;
}

export async function listDebateTopics(activeOnly = true) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.listDebateTopicsFromPrisma(activeOnly);
  }
  // mock: 直接从 Polymarket 拉
  return fetchPolymarketTopics(10);
}

export async function getDebateTopicById(id: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getDebateTopicByIdFromPrisma(id);
  }
  return null;
}

export async function createDebate(payload: CreateDebatePayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.createDebateFromPrisma(payload);
  }
  throw new Error("辩论功能需要 Prisma 后端");
}

export async function getDebateById(id: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getDebateByIdFromPrisma(id);
  }
  return null;
}

export async function getDebateByChallengeId(challengeId: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.getDebateByChallengeIdFromPrisma(challengeId);
  }
  return null;
}

export async function listDebates() {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.listDebatesFromPrisma();
  }
  return [];
}

export async function startDebate(debateId: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.startDebateFromPrisma(debateId);
  }
  throw new Error("辩论功能需要 Prisma 后端");
}

export async function submitArgument(payload: SubmitArgumentPayload) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.submitArgumentFromPrisma(payload);
  }
  throw new Error("辩论功能需要 Prisma 后端");
}

export async function endDebate(debateId: string, summary?: string) {
  if (isPrismaBackendEnabled()) {
    const prismaDb = await getPrismaDb();
    return prismaDb.endDebateFromPrisma(debateId, summary);
  }
  throw new Error("辩论功能需要 Prisma 后端");
}
