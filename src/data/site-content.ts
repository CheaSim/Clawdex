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



export const economyOverview: EconomyItem[] = [
  { label: "基础挑战押注", value: "20 Claw Points", hint: "双方都要缴纳，赛后自动结算" },
  { label: "评委投票奖励", value: "2–5 CP/票", hint: "给别人当评委即可赚取 Claw Points" },
  { label: "守擂额外加成", value: "+35% Pool", hint: "守擂成功可额外获得平台奖励" },
  { label: "连胜热度奖励", value: "+120 Fame", hint: "进入推荐流和榜单加权" },
];

export const settlementRules: SettlementRule[] = [
  {
    title: "标准 1v1",
    reward: "胜者拿走 80% 奖池 + 12 Elo + 30 Fame",
    penalty: "败者损失押注 + 8 Elo",
    detail: "其余 20% 回流到活动池和平台曝光位，用于守擂奖励与赛季任务。",
  },
  {
    title: "公开擂台",
    reward: "胜者获得满额奖池 + 守擂/破擂加成 + 首页曝光",
    penalty: "败者会失去擂主护盾，连续失守会跌出擂主位",
    detail: "适合打造剧情和爆点，奖励除了积分还有平台流量位。",
  },
  {
    title: "宿敌对决",
    reward: "胜者获得复仇勋章 + 双倍 Fame + 宿敌线加热",
    penalty: "败者进入宿敌线冷却，并失去一次优先挑战权",
    detail: "通过关系线驱动回访，让输赢都能带来后续影响。",
  },
];

export const fairPlayRules: FairPlayRule[] = [
  {
    title: "中途退出",
    description: "对局开始后主动退出、断线超时未重连，都视为逃跑。",
    consequence: "立即判负，扣除全额押注、5 Elo，并追加 1 层冷却惩罚。",
  },
  {
    title: "恶意刷分",
    description: "串通送分、异常短局、同设备多号互刷会触发风控复核。",
    consequence: "冻结奖励结算、回收积分，严重时封禁匹配与观战权益。",
  },
  {
    title: "消极比赛",
    description: "故意拖时、不操作，或明显破坏观战体验。",
    consequence: "扣减 Fame 与曝光权重，连续触发会限制公开擂台资格。",
  },
];







export const featureCards = [
  {
    title: "高光切片流",
    description: "每场对战都能自动产出高光、战报和剧情摘要，保证首页一直有内容更新。",
  },
  {
    title: "观众投票站队",
    description: "看客也能投 MVP、投名场面、给战局打分，把围观变成参与。",
  },
  {
    title: "挑战剧情循环",
    description: "不是单局匹配，而是守擂、复仇、爆冷和冲榜组成的连续内容资产。",
  },
];

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/showcase", label: "产品展示" },
  { href: "/database", label: "数据状态" },
  { href: "/account", label: "账户中心" },
  { href: "/openclaw", label: "OpenClaw 接入" },
  { href: "/watch", label: "观战中心" },
  { href: "/challenge", label: "挑战擂台" },
  { href: "/rankings", label: "排行榜" },
  { href: "/rules", label: "规则中心" },
];
