export type Highlight = {
  title: string;
  summary: string;
  tag: string;
  viewers: string;
  score: string;
};

export type ArenaMatch = {
  challenger: string;
  defender: string;
  status: string;
  hook: string;
};

export type RankingEntry = {
  name: string;
  title: string;
  value: string;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type SettlementRule = {
  title: string;
  reward: string;
  penalty: string;
  detail: string;
};

export type EconomyItem = {
  label: string;
  value: string;
  hint: string;
};

export type FairPlayRule = {
  title: string;
  description: string;
  consequence: string;
};

export const heroMetrics: Metric[] = [
  { label: "今日观战峰值", value: "18.4K", detail: "移动端贡献 72%" },
  { label: "擂台连胜纪录", value: "11 场", detail: "由 FrostClaw 保持" },
  { label: "观众投票参与", value: "83%", detail: "比传统直播页高 2.4x" },
];

export const economyOverview: EconomyItem[] = [
  { label: "基础挑战押注", value: "20 Claw Points", hint: "双方都要缴纳，赛后自动结算" },
  { label: "擂台守擂奖金", value: "+35% Pool", hint: "守擂成功额外获得平台奖励" },
  { label: "连胜热度奖励", value: "+120 Fame", hint: "进入推荐流和榜单加权" },
];

export const settlementRules: SettlementRule[] = [
  {
    title: "普通 1v1",
    reward: "赢家拿走 80% 奖池 + 12 Elo + 30 Fame",
    penalty: "败者损失押注 + 8 Elo",
    detail: "20% 奖池进入活动池与平台回流，用于守擂奖励和赛季任务。",
  },
  {
    title: "公开擂台",
    reward: "赢家拿走 100% 奖池 + 守擂/破擂加成 + 首页曝光",
    penalty: "败者额外扣除 1 层擂台护盾，连续失守将掉出擂主位",
    detail: "适合打造剧情和爆点，奖励除了积分还有流量位。",
  },
  {
    title: "宿敌复仇战",
    reward: "赢家获得复仇勋章 + 双倍 Fame + 宿敌线加权",
    penalty: "败者在宿敌线中进入冷却，并失去一次优先挑战权",
    detail: "用关系线驱动回访，让输赢都有后续影响。",
  },
];

export const fairPlayRules: FairPlayRule[] = [
  {
    title: "中途逃跑",
    description: "对局开始后主动退出、断线超时未重连，视为逃跑。",
    consequence: "立即判负，扣除全额押注、15 Elo，并增加 1 层冷却惩罚。",
  },
  {
    title: "恶意刷分",
    description: "串通送分、异常短局、同设备多号互刷会触发风控复核。",
    consequence: "冻结奖励结算、回收积分，严重时封禁匹配与观战权益。",
  },
  {
    title: "消极比赛",
    description: "无意义拖时、故意不操作或明显破坏观战体验。",
    consequence: "扣除 Fame 与曝光权重，连续触发则限制公开擂台资格。",
  },
];

export const highlights: Highlight[] = [
  {
    title: "黑马 12 秒极限翻盘",
    summary: "全场 79% 观众押错边，NightPaw 在最后一个窗口完成反杀。",
    tag: "高光短片",
    viewers: "9.2K 在看",
    score: "9.8 爆款指数",
  },
  {
    title: "榜一守擂失败，宿敌复仇成功",
    summary: "同一组对手三连战形成剧情线，评论区已分成两派。",
    tag: "擂台剧情",
    viewers: "6.7K 在看",
    score: "9.4 争议热度",
  },
  {
    title: "新秀速推打法被 AI 解说点名",
    summary: "系统自动生成战报，带来 3.1 倍分享率提升。",
    tag: "AI 战报",
    viewers: "4.8K 在看",
    score: "8.9 传播分",
  },
];

export const arenaMatches: ArenaMatch[] = [
  {
    challenger: "GhostHook",
    defender: "FrostClaw",
    status: "即将开打 · 3 分钟后",
    hook: "若 FrostClaw 守擂成功，将刷新赛季最长连胜。",
  },
  {
    challenger: "CrimsonKid",
    defender: "NightPaw",
    status: "直播中",
    hook: "这对宿敌的胜者将直接冲进周榜前三。",
  },
  {
    challenger: "RetroMira",
    defender: "IronTail",
    status: "回放待评分",
    hook: "本场名场面投票已超过 1,200 次。",
  },
];

export const rankingLeaders: RankingEntry[] = [
  { name: "FrostClaw", title: "本周擂主", value: "2,486 Elo" },
  { name: "NightPaw", title: "内容热度王", value: "91.6K 热度" },
  { name: "GhostHook", title: "观众人气王", value: "78% 支持率" },
];

export const featureCards = [
  {
    title: "高光切片流",
    description: "每场对战自动产出 15 秒高光，让首页始终有可刷内容。",
  },
  {
    title: "观众投票站队",
    description: "看客也能押人气、投 MVP、给名场面打分，参与感比单纯围观更强。",
  },
  {
    title: "挑战擂台剧情",
    description: "不是单局匹配，而是连续守擂、复仇、爆冷的剧情循环。",
  },
];

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/watch", label: "观战中心" },
  { href: "/challenge", label: "挑战擂台" },
  { href: "/rankings", label: "排行榜" },
  { href: "/rules", label: "规则" },
];
