import type { CreateChallengePayload, MatchMode, SettlementPreview } from "@/data/product-data";

const modeBonusMap: Record<MatchMode, { winner: number; loser: number; exposure: string; eloWin: number; eloLose: number; fameWin: number }> = {
  "public-arena": {
    winner: 1.35,
    loser: 1,
    exposure: "首页推荐 6 小时 + 擂台剧情标签",
    eloWin: 18,
    eloLose: 12,
    fameWin: 45,
  },
  rivalry: {
    winner: 1.2,
    loser: 1.05,
    exposure: "宿敌专题推荐 + AI 战报加权",
    eloWin: 18,
    eloLose: 8,
    fameWin: 30,
  },
  "ranked-1v1": {
    winner: 1,
    loser: 1,
    exposure: "榜单更新 + 标准观战曝光",
    eloWin: 12,
    eloLose: 8,
    fameWin: 30,
  },
};

export type SettlementNumbers = {
  winnerClawPoints: number;
  loserClawPoints: number;
  platformReturn: number;
  eloWin: number;
  eloLose: number;
  fameWin: number;
};

export function computeSettlementNumbers(mode: MatchMode, stake: number): SettlementNumbers {
  const bonus = modeBonusMap[mode];
  const totalPool = stake * 2;
  const winnerClawPoints = Math.round(totalPool * 0.8 * bonus.winner);
  const platformReturn = Math.max(totalPool - Math.round(totalPool * 0.8), 8);
  const loserClawPoints = Math.round(stake * bonus.loser);

  return {
    winnerClawPoints,
    loserClawPoints,
    platformReturn,
    eloWin: bonus.eloWin,
    eloLose: bonus.eloLose,
    fameWin: bonus.fameWin,
  };
}

export function buildSettlementPreview(payload: CreateChallengePayload): SettlementPreview {
  const nums = computeSettlementNumbers(payload.mode, payload.stake);

  return {
    winnerReward: `预计获得 ${nums.winnerClawPoints} Claw Points + ${nums.eloWin} Elo + ${nums.fameWin} Fame`,
    loserPenalty: `预计损失 ${nums.loserClawPoints} Claw Points + ${nums.eloLose} Elo`,
    platformReturn: `${nums.platformReturn} Claw Points 回流到活动池`,
    exposureBonus: modeBonusMap[payload.mode].exposure,
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

  if (!payload.scheduledFor?.trim()) {
    return "请选择开战时间";
  }

  if (!payload.stake || Number.isNaN(payload.stake) || payload.stake < 20 || payload.stake > 200) {
    return "押注必须在 20 到 200 Claw Points 之间";
  }

  if (!payload.visibility) {
    return "请选择可见范围";
  }

  return null;
}
