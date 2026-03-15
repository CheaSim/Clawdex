/**
 * Debate PK System — Polymarket Topic-Based Debate Engine
 *
 * 议题来自 Polymarket 预测市场，两位 OpenClaw 选手各持一方立场，
 * 按回合轮流辩论，最终由评委投票决胜。
 *
 * 流程：
 *   1. 从 Polymarket 爬取议题 → DebateTopic
 *   2. 创建辩论（绑定 Challenge）→ Debate
 *   3. 启动辩论 → status: started
 *   4. A 先发言 → B 回应 → 循环 N 轮
 *   5. 结辩 → 评委投票 → 结算（复用 Challenge 结算）
 */

import type { DebateInfo, DebateRoundInfo, DebateSide, DebateTopicInfo } from "@/data/product-data";

// ─── Polymarket API ─────────────────────────────────────────

const POLYMARKET_GAMMA_API = "https://gamma-api.polymarket.com/markets";

export type PolymarketMarket = {
  id: string;
  question: string;
  description: string;
  slug: string;
  outcomes: string;       // JSON string: '["Yes","No"]'
  outcomePrices: string;  // JSON string: '["0.52","0.48"]'
  image: string;
  endDate: string;
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
};

export async function fetchPolymarketTopics(limit = 10): Promise<DebateTopicInfo[]> {
  const url = new URL(POLYMARKET_GAMMA_API);
  url.searchParams.set("closed", "false");
  url.searchParams.set("active", "true");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("order", "volume");
  url.searchParams.set("ascending", "false");

  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!response.ok) {
    throw new Error(`Polymarket API error: ${response.status}`);
  }

  const markets: PolymarketMarket[] = await response.json();

  return markets.map(mapPolymarketToTopic);
}

function mapPolymarketToTopic(market: PolymarketMarket): DebateTopicInfo {
  let outcomes: string[] = ["Yes", "No"];
  let prices: number[] = [0.5, 0.5];

  try {
    outcomes = JSON.parse(market.outcomes);
  } catch { /* keep default */ }

  try {
    prices = JSON.parse(market.outcomePrices).map(Number);
  } catch { /* keep default */ }

  return {
    id: "",  // will be assigned by DB
    polymarketId: market.id,
    question: market.question,
    description: market.description?.slice(0, 500) ?? "",
    outcomes,
    currentPrices: prices,
    imageUrl: market.image || undefined,
    polymarketSlug: market.slug || undefined,
    endDate: market.endDate || undefined,
    volume: parseFloat(market.volume) || 0,
    liquidity: parseFloat(market.liquidity) || 0,
    active: market.active && !market.closed,
    syncedAt: new Date().toISOString(),
  };
}

// ─── Debate Flow Logic ──────────────────────────────────────

/**
 * 计算下一个发言方。
 * 每轮 A 先发言，B 后发言。
 * roundNumber 从 1 开始。
 */
export function getNextSpeaker(debate: Pick<DebateInfo, "currentRound" | "totalRounds" | "status" | "sideAPlayerSlug" | "sideBPlayerSlug">, existingRounds: DebateRoundInfo[]): {
  side: DebateSide;
  playerSlug: string;
  roundNumber: number;
} | null {
  if (debate.status === "judging" || debate.status === "settled" || debate.status === "topic-set") {
    return null;
  }

  const currentRound = debate.currentRound || 1;

  // 检查当前轮次 A 是否已发言
  const aSpoke = existingRounds.some(r => r.roundNumber === currentRound && r.side === "yes");
  const bSpoke = existingRounds.some(r => r.roundNumber === currentRound && r.side === "no");

  if (!aSpoke) {
    return { side: "yes", playerSlug: debate.sideAPlayerSlug, roundNumber: currentRound };
  }

  if (!bSpoke) {
    return { side: "no", playerSlug: debate.sideBPlayerSlug, roundNumber: currentRound };
  }

  // 当前轮双方都说完了，进入下一轮
  if (currentRound < debate.totalRounds) {
    return { side: "yes", playerSlug: debate.sideAPlayerSlug, roundNumber: currentRound + 1 };
  }

  // 所有轮次完成 → 进入结辩/评审
  return null;
}

/**
 * 根据已有回合判断辩论状态。
 */
export function computeDebateStatus(totalRounds: number, rounds: DebateRoundInfo[]): "started" | "round-a" | "round-b" | "closing" | "judging" {
  if (rounds.length === 0) return "round-a";

  const maxRound = Math.max(...rounds.map(r => r.roundNumber));
  const currentRoundEntries = rounds.filter(r => r.roundNumber === maxRound);
  const aSpoke = currentRoundEntries.some(r => r.side === "yes");
  const bSpoke = currentRoundEntries.some(r => r.side === "no");

  if (aSpoke && bSpoke) {
    // 当前轮结束
    if (maxRound >= totalRounds) {
      return "judging"; // 所有轮次完成
    }
    return "round-a"; // 新轮要 A 先说
  }

  if (aSpoke && !bSpoke) return "round-b";
  return "round-a";
}

/**
 * 验证是否轮到某位选手发言。
 */
export function validateSpeakerTurn(debate: DebateInfo, playerSlug: string, rounds: DebateRoundInfo[]): string | null {
  if (debate.status === "topic-set") return "辩论尚未启动";
  if (debate.status === "judging") return "辩论已进入评审阶段";
  if (debate.status === "settled") return "辩论已结算";

  const next = getNextSpeaker(debate, rounds);
  if (!next) return "所有轮次已完成，等待评审";

  if (next.playerSlug !== playerSlug) {
    return `当前轮到 ${next.playerSlug} 发言`;
  }

  return null;
}
