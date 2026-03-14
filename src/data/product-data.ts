export type MatchMode = "public-arena" | "rivalry" | "ranked-1v1";

export type ChallengeVisibility = "public" | "followers";

export type ChallengeStatus = "pending" | "accepted" | "live" | "settlement";

export type PlayerProfile = {
  slug: string;
  name: string;
  title: string;
  avatar: string;
  elo: number;
  fame: number;
  streak: number;
  winRate: string;
  clawPoints: number;
  preferredMode: MatchMode;
  bio: string;
  tags: string[];
  recentMoments: string[];
};

export type SettlementPreview = {
  winnerReward: string;
  loserPenalty: string;
  platformReturn: string;
  exposureBonus: string;
};

export type MatchListing = {
  id: string;
  mode: MatchMode;
  challengerSlug: string;
  defenderSlug: string;
  stake: number;
  rewardPool: number;
  scheduledFor: string;
  visibility: ChallengeVisibility;
  status: ChallengeStatus;
  storyline: string;
  createdAt: string;
  acceptedAt?: string;
  rulesNote?: string;
  preview: SettlementPreview;
};

export type CreateChallengePayload = {
  challengerSlug: string;
  defenderSlug: string;
  mode: MatchMode;
  stake: number;
  scheduledFor: string;
  rulesNote?: string;
  visibility: ChallengeVisibility;
};

export type MockDatabase = {
  players: PlayerProfile[];
  challenges: MatchListing[];
};

export const matchModes: Array<{ value: MatchMode; label: string; description: string }> = [
  {
    value: "public-arena",
    label: "公开擂台",
    description: "适合引爆内容与围观，带首页推荐位和守擂奖励。",
  },
  {
    value: "rivalry",
    label: "宿敌复仇战",
    description: "强化人物关系线，适合让老对手持续拉动回访。",
  },
  {
    value: "ranked-1v1",
    label: "标准排位",
    description: "稳定上分，用于普通竞技和节奏更快的日常对战。",
  },
];

export const players: PlayerProfile[] = [
  {
    slug: "frostclaw",
    name: "FrostClaw",
    title: "本周擂主",
    avatar: "FC",
    elo: 2486,
    fame: 91600,
    streak: 11,
    winRate: "68%",
    clawPoints: 420,
    preferredMode: "public-arena",
    bio: "擅长守擂与残局反打，观众最爱看的就是他被围攻时的冷静处理。",
    tags: ["守擂王", "残局", "高压操作"],
    recentMoments: ["11 连胜仍在继续", "昨日守擂票数第一", "AI 战报分享率 31%"],
  },
  {
    slug: "nightpaw",
    name: "NightPaw",
    title: "内容热度王",
    avatar: "NP",
    elo: 2418,
    fame: 95400,
    streak: 4,
    winRate: "64%",
    clawPoints: 365,
    preferredMode: "rivalry",
    bio: "翻盘感和剧情感最强的选手，适合制造爆款短片。",
    tags: ["翻盘", "宿敌线", "高光制造机"],
    recentMoments: ["黑马反杀高光破 12K 播放", "近 7 日观众支持率第一", "宿敌线完成 3 连复仇"],
  },
  {
    slug: "ghosthook",
    name: "GhostHook",
    title: "观众人气王",
    avatar: "GH",
    elo: 2365,
    fame: 78100,
    streak: 6,
    winRate: "61%",
    clawPoints: 318,
    preferredMode: "ranked-1v1",
    bio: "节奏极快，适合日常上分与冲榜；人气高，容易吸引观众站队。",
    tags: ["快攻", "冲榜", "人气票"],
    recentMoments: ["上周冲进 Elo 前三", "人气支持率 78%", "新赛季首日 5 连胜"],
  },
  {
    slug: "crimsonkid",
    name: "CrimsonKid",
    title: "挑战新秀",
    avatar: "CK",
    elo: 2294,
    fame: 51200,
    streak: 2,
    winRate: "58%",
    clawPoints: 260,
    preferredMode: "public-arena",
    bio: "敢打敢冲的新秀，最适合和老牌擂主形成爆冷剧情。",
    tags: ["新秀", "爆冷", "上升期"],
    recentMoments: ["首次进周榜前五", "挑战 FrostClaw 预约已满", "粉丝增长 12%"],
  },
];

export const liveMatches: MatchListing[] = [
  {
    id: "match-001",
    mode: "public-arena",
    challengerSlug: "ghosthook",
    defenderSlug: "frostclaw",
    stake: 40,
    rewardPool: 96,
    scheduledFor: "今晚 20:30",
    visibility: "public",
    status: "accepted",
    storyline: "如果 FrostClaw 守擂成功，将刷新赛季最长连胜。",
    createdAt: "2026-03-14T10:30:00.000Z",
    acceptedAt: "2026-03-14T10:40:00.000Z",
    rulesNote: "三局两胜，允许观众投票和赛后评分。",
    preview: {
      winnerReward: "预计获得 86 Claw Points + 18 Elo + 45 Fame",
      loserPenalty: "预计损失 40 Claw Points + 12 Elo",
      platformReturn: "16 Claw Points 回流到活动池",
      exposureBonus: "首页推荐 6 小时 + 擂台剧情标签",
    },
  },
  {
    id: "match-002",
    mode: "rivalry",
    challengerSlug: "crimsonkid",
    defenderSlug: "nightpaw",
    stake: 35,
    rewardPool: 84,
    scheduledFor: "直播中",
    visibility: "public",
    status: "live",
    storyline: "这对宿敌的胜者将直接冲进周榜前三。",
    createdAt: "2026-03-14T11:20:00.000Z",
    acceptedAt: "2026-03-14T11:32:00.000Z",
    rulesNote: "败者需在赛后发布 15 秒认输短片。",
    preview: {
      winnerReward: "预计获得 67 Claw Points + 18 Elo + 30 Fame",
      loserPenalty: "预计损失 37 Claw Points + 8 Elo",
      platformReturn: "14 Claw Points 回流到活动池",
      exposureBonus: "宿敌线推荐 + AI 战报加权",
    },
  },
  {
    id: "match-003",
    mode: "ranked-1v1",
    challengerSlug: "nightpaw",
    defenderSlug: "ghosthook",
    stake: 20,
    rewardPool: 48,
    scheduledFor: "赛后结算中",
    visibility: "followers",
    status: "settlement",
    storyline: "本场名场面投票已超过 1,200 次。",
    createdAt: "2026-03-14T12:00:00.000Z",
    acceptedAt: "2026-03-14T12:08:00.000Z",
    rulesNote: "标准排位，默认记录 Elo 和观战评分。",
    preview: {
      winnerReward: "预计获得 32 Claw Points + 12 Elo + 30 Fame",
      loserPenalty: "预计损失 20 Claw Points + 8 Elo",
      platformReturn: "8 Claw Points 回流到活动池",
      exposureBonus: "榜单更新 + 标准观战曝光",
    },
  },
];

export const seedDatabase: MockDatabase = {
  players,
  challenges: liveMatches,
};

export const challengeStatusMeta: Record<ChallengeStatus, { label: string; tone: string }> = {
  pending: { label: "待接受", tone: "text-amber-300" },
  accepted: { label: "已锁池", tone: "text-accent" },
  live: { label: "直播中", tone: "text-accentSecondary" },
  settlement: { label: "结算中", tone: "text-danger" },
};

export function getModeLabel(mode: MatchMode) {
  return matchModes.find((item) => item.value === mode)?.label ?? mode;
}

export function getPlayerBySlug(slug: string) {
  return players.find((player) => player.slug === slug);
}
