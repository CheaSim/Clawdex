export type MatchMode = "public-arena" | "rivalry" | "ranked-1v1";

export type ChallengeVisibility = "public" | "followers";

export type ChallengeStatus = "pending" | "accepted" | "live" | "settlement";

export type OpenClawRegion = "CN" | "SEA" | "EU" | "NA";

export type OpenClawConnectionStatus = "disconnected" | "configured" | "ready";

export type OpenClawIntegration = {
  channel: string;
  accountId: string;
  region: OpenClawRegion;
  clientVersion: string;
  status: OpenClawConnectionStatus;
  configuredAt?: string;
  lastVerifiedAt?: string;
  notes?: string;
};

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
  openClaw: OpenClawIntegration;
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
  settledAt?: string;
  rulesNote?: string;
  winnerSlug?: string;
  settlementSummary?: string;
  sourceChannel?: string;
  sourceSessionId?: string;
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

export type UpdateOpenClawPayload = {
  channel: string;
  accountId: string;
  region: OpenClawRegion;
  clientVersion: string;
  status: OpenClawConnectionStatus;
  notes?: string;
};

export type SettleChallengePayload = {
  winnerSlug: string;
  settlementSummary?: string;
  sourceChannel?: string;
  sourceSessionId?: string;
};

export type AcceptChallengePayload = {
  defenderSlug?: string;
  sourceChannel?: string;
  sourceSessionId?: string;
};

export type MockDatabase = {
  players: PlayerProfile[];
  challenges: MatchListing[];
};

export const matchModes: Array<{ value: MatchMode; label: string; description: string }> = [
  {
    value: "public-arena",
    label: "公开擂台",
    description: "最适合做内容出圈的模式，奖池、观战、剧情和传播都集中在这里。",
  },
  {
    value: "rivalry",
    label: "宿敌对决",
    description: "强调人物关系和连续故事线，让回访围绕“人”而不是一局房间。",
  },
  {
    value: "ranked-1v1",
    label: "排位冲榜",
    description: "适合高频竞技和稳定上分，给高手一条更明确的荣誉路径。",
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
    bio: "擅长守擂与残局反打，是观众最爱看的“高压下仍然稳定输出”型选手。",
    tags: ["守擂", "残局", "高压操作"],
    recentMoments: ["11 连胜仍在继续", "昨日守擂票数第一", "AI 战报分享率 31%"],
    openClaw: {
      channel: "OpenClaw CN Alpha",
      accountId: "FC-9091",
      region: "CN",
      clientVersion: "0.9.4",
      status: "ready",
      configuredAt: "2026-03-14T08:30:00.000Z",
      lastVerifiedAt: "2026-03-14T12:40:00.000Z",
      notes: "主力守擂账号，已完成大厅握手与房间校验。",
    },
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
    bio: "最擅长翻盘和制造戏剧性，适合带动短视频切片和评论区站队。",
    tags: ["翻盘", "宿敌线", "高光制造"],
    recentMoments: ["黑马反杀高光破 12K 播放", "近 7 日观众支持率第一", "宿敌线完成 3 连复仇"],
    openClaw: {
      channel: "OpenClaw Creator Relay",
      accountId: "NP-4410",
      region: "SEA",
      clientVersion: "0.9.3",
      status: "ready",
      configuredAt: "2026-03-14T08:50:00.000Z",
      lastVerifiedAt: "2026-03-14T12:32:00.000Z",
      notes: "宿敌专线已启用，可直接接入直播编排。",
    },
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
    bio: "节奏极快，适合日常上分和冲榜，也是最容易吸引观众站队的选手之一。",
    tags: ["快攻", "冲榜", "高人气"],
    recentMoments: ["上周冲进 Elo 前三", "人气支持率 78%", "新赛季首日 5 连胜"],
    openClaw: {
      channel: "OpenClaw Ranked Bridge",
      accountId: "GH-2208",
      region: "EU",
      clientVersion: "0.9.4",
      status: "ready",
      configuredAt: "2026-03-14T09:15:00.000Z",
      lastVerifiedAt: "2026-03-14T12:10:00.000Z",
      notes: "排位通道稳定，适合高频 1v1。",
    },
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
    recentMoments: ["首次进入周榜前二十", "挑战 FrostClaw 预约已满", "粉丝增长 12%"],
    openClaw: {
      channel: "OpenClaw Arena Lane",
      accountId: "CK-7702",
      region: "NA",
      clientVersion: "0.9.2",
      status: "ready",
      configuredAt: "2026-03-14T09:40:00.000Z",
      lastVerifiedAt: "2026-03-14T11:55:00.000Z",
      notes: "新秀通道已开通，支持擂台曝光联动。",
    },
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
    storyline: "如果 FrostClaw 守擂成功，将刷新赛季最长连胜纪录。",
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
      exposureBonus: "宿敌专题推荐 + AI 战报加权",
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
    storyline: "本场名场面投票已经超过 1,200 次。",
    createdAt: "2026-03-14T12:00:00.000Z",
    acceptedAt: "2026-03-14T12:08:00.000Z",
    rulesNote: "标准排位，默认记录 Elo 和观战评分。",
    preview: {
      winnerReward: "预计获得 32 Claw Points + 12 Elo + 30 Fame",
      loserPenalty: "预计损失 20 Claw Points + 8 Elo",
      platformReturn: "8 Claw Points 回流到活动池",
      exposureBonus: "榜单更新 + 标准观战曝光",
    },
    winnerSlug: "nightpaw",
    settlementSummary: "NightPaw 通过一波残局翻盘拿下胜利，并锁定本周宿敌线热度第一。",
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

export const openClawStatusMeta: Record<OpenClawConnectionStatus, { label: string; tone: string; description: string }> = {
  disconnected: {
    label: "未接入",
    tone: "text-danger",
    description: "尚未绑定 OpenClaw 通道，当前不能发起或接受对战。",
  },
  configured: {
    label: "待校验",
    tone: "text-amber-300",
    description: "已经填写通道资料，但还没有完成最后一次联机校验。",
  },
  ready: {
    label: "已就绪",
    tone: "text-accentSecondary",
    description: "通道已验证，可以直接参与 Clawdex 里的对战流程。",
  },
};

export const openClawRegions: OpenClawRegion[] = ["CN", "SEA", "EU", "NA"];

export function getModeLabel(mode: MatchMode) {
  return matchModes.find((item) => item.value === mode)?.label ?? mode;
}

export function getPlayerBySlug(slug: string) {
  return players.find((player) => player.slug === slug);
}

export function isPlayerOpenClawReady(player: Pick<PlayerProfile, "openClaw">) {
  return player.openClaw.status === "ready";
}
