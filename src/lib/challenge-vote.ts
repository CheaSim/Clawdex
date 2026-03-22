export const JUDGE_REWARD_MAP = {
  MVP: 5,
  SUPPORT: 3,
  MOMENT: 2,
} as const;

export type JudgeVoteType = keyof typeof JUDGE_REWARD_MAP;

type JudgeVoteTargetInput = {
  voteType: JudgeVoteType;
  targetPlayerSlug?: string;
  challengerSlug: string;
  defenderSlug: string;
};

export function isJudgeVoteType(value: string): value is JudgeVoteType {
  return value in JUDGE_REWARD_MAP;
}

export function getJudgeReward(voteType: JudgeVoteType) {
  return JUDGE_REWARD_MAP[voteType];
}

export function buildJudgeRewardReason(voteType: JudgeVoteType) {
  return `评委奖励：${voteType} 投票`;
}

export function validateJudgeVoteTarget(input: JudgeVoteTargetInput) {
  const { voteType, targetPlayerSlug, challengerSlug, defenderSlug } = input;
  const requiresTarget = voteType === "MVP" || voteType === "SUPPORT";

  if (requiresTarget && !targetPlayerSlug) {
    return `${voteType} 投票必须指定目标选手。`;
  }

  if (!targetPlayerSlug) {
    return null;
  }

  if (targetPlayerSlug !== challengerSlug && targetPlayerSlug !== defenderSlug) {
    return "投票目标必须是本场挑战的参赛选手。";
  }

  return null;
}

export function computeJudgeWalletBalanceAfter(previousAvailableBalance: number, reward: number) {
  return previousAvailableBalance + reward;
}
