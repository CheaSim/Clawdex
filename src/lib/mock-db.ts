import { promises as fs } from "fs";
import path from "path";

import {
  challengeStatusMeta,
  getModeLabel,
  seedDatabase,
  type CreateChallengePayload,
  type MatchListing,
  type MockDatabase,
  type PlayerProfile,
} from "@/data/product-data";
import { buildSettlementPreview } from "@/lib/settlement";

const dbFilePath = path.join(process.cwd(), "data", "mock-db.json");

function cloneSeedDatabase() {
  return JSON.parse(JSON.stringify(seedDatabase)) as MockDatabase;
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
  return JSON.parse(raw) as MockDatabase;
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

export async function listPlayers() {
  const database = await readDatabase();
  return database.players;
}

export async function getPlayerBySlugFromDb(slug: string) {
  const database = await readDatabase();
  return database.players.find((player) => player.slug === slug) ?? null;
}

export async function listChallenges() {
  const database = await readDatabase();
  return sortChallenges(database.challenges);
}

export async function getChallengeById(id: string) {
  const database = await readDatabase();
  return database.challenges.find((challenge) => challenge.id === id) ?? null;
}

export async function createChallengeRecord(payload: CreateChallengePayload) {
  const database = await readDatabase();
  const challenger = database.players.find((player) => player.slug === payload.challengerSlug);
  const defender = database.players.find((player) => player.slug === payload.defenderSlug);

  if (!challenger || !defender) {
    throw new Error("挑战双方必须是有效选手");
  }

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

  return {
    challenge,
    challenger,
    defender,
  };
}

export async function acceptChallengeRecord(id: string) {
  const database = await readDatabase();
  const challenge = database.challenges.find((item) => item.id === id);

  if (!challenge) {
    throw new Error("挑战不存在");
  }

  if (challenge.status !== "pending") {
    throw new Error(`当前挑战状态为${challengeStatusMeta[challenge.status].label}，不能重复接受`);
  }

  const defender = database.players.find((player) => player.slug === challenge.defenderSlug);
  const challenger = database.players.find((player) => player.slug === challenge.challengerSlug);

  if (!defender || !challenger) {
    throw new Error("挑战双方信息异常，请刷新后重试");
  }

  if (defender.clawPoints < challenge.stake) {
    throw new Error(`${defender.name} 钱包余额不足，无法接受这场挑战`);
  }

  defender.clawPoints -= challenge.stake;
  challenge.status = "accepted";
  challenge.rewardPool = challenge.stake * 2;
  challenge.acceptedAt = new Date().toISOString();
  challenge.storyline = `${defender.name} 已接战，${challenger.name} 与 ${defender.name} 的奖金池现已锁定为 ${challenge.rewardPool} Claw Points。`;

  await writeDatabase(database);

  return {
    challenge,
    challenger,
    defender,
  };
}
