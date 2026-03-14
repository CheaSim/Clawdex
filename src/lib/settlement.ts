import type { CreateChallengePayload, MatchMode, SettlementPreview } from "@/data/product-data";

const modeBonusMap: Record<MatchMode, { winner: number; loser: number; exposure: string }> = {
  "public-arena": {
    winner: 1.35,
    loser: 1,
    exposure: "首页推荐 6 小时 + 擂台剧情标签",
  },
  rivalry: {
    winner: 1.2,
    loser: 1.05,
    exposure: "宿敌线推荐 + AI 战报加权",
  },
  "ranked-1v1": {
    winner: 1,
    loser: 1,
    exposure: "榜单更新 + 标准观战曝光",
  },
};

export function buildSettlementPreview(payload: CreateChallengePayload): SettlementPreview {
  const bonus = modeBonusMap[payload.mode];
  const totalPool = payload.stake * 2;
  const winnerPool = Math.round(totalPool * 0.8 * bonus.winner);
  const platformReturn = Math.max(totalPool - Math.round(totalPool * 0.8), 8);
  const loserPenalty = Math.round(payload.stake * bonus.loser);

  return {
    winnerReward: `预计获得 ${winnerPool} Claw Points + ${payload.mode === "ranked-1v1" ? 12 : 18} Elo + ${payload.mode === "public-arena" ? 45 : 30} Fame`,
    loserPenalty: `预计损失 ${loserPenalty} Claw Points + ${payload.mode === "public-arena" ? 12 : 8} Elo`,
    platformReturn: `${platformReturn} Claw Points 回流到活动池`,
    exposureBonus: bonus.exposure,
  };
}

export function validateChallengePayload(payload: Partial<CreateChallengePayload>) {
  if (!payload.challengerSlug || !payload.defenderSlug) {
    return "挑战双方不能为空";
  }

  if (payload.challengerSlug === payload.defenderSlug) {
    return "不能挑战自己";
  }

  if (!payload.mode) {
    return "请选择挑战模式";
  }

  if (!payload.scheduledFor) {
    return "请选择开战时间";
  }

  if (!payload.stake || Number.isNaN(payload.stake) || payload.stake < 20 || payload.stake > 200) {
    return "押注必须在 20 到 200 Claw Points 之间";
  }

  return null;
}
