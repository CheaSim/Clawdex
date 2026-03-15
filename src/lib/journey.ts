import type { CurrentUserRecord } from "@/lib/auth-guard";

export type JourneyPlayerState = {
  slug?: string | null;
  openClaw?: {
    channel?: string | null;
    accountId?: string | null;
    status?: string | null;
  } | null;
};

export type JourneyStep = {
  id: string;
  title: string;
  description: string;
  status: "complete" | "current" | "locked";
  href: string;
  cta: string;
};

export function buildUserJourney(currentUser: CurrentUserRecord, player: JourneyPlayerState | null, challengeCount: number): JourneyStep[] {
  const hasAccount = Boolean(currentUser);
  const hasPlayerBinding = Boolean(currentUser.player);
  const hasOpenClawBinding = Boolean(player?.openClaw?.channel && player?.openClaw?.accountId);
  const isReady = player?.openClaw?.status?.toLowerCase() === "ready";
  const hasFirstChallenge = challengeCount > 0;

  const states = [hasAccount, hasPlayerBinding, hasOpenClawBinding, isReady, hasFirstChallenge];
  const firstIncompleteIndex = states.findIndex((state) => !state);

  function resolveStatus(index: number, done: boolean): JourneyStep["status"] {
    if (done) {
      return "complete";
    }

    if (firstIncompleteIndex === -1 || firstIncompleteIndex === index) {
      return "current";
    }

    return "locked";
  }

  return [
    {
      id: "account",
      title: "账户就绪",
      description: "拥有一个可持续登录的 Clawdex 账号。",
      status: resolveStatus(0, hasAccount),
      href: "/account",
      cta: "查看账户",
    },
    {
      id: "player",
      title: "绑定玩家身份",
      description: "把你的账号绑定到真实可参与 PK 的玩家身份。",
      status: resolveStatus(1, hasPlayerBinding),
      href: "/register",
      cta: hasPlayerBinding ? "查看玩家" : "去绑定",
    },
    {
      id: "openclaw",
      title: "连接 OpenClaw",
      description: "补全通道信息并同步到 Clawdex 控制平面。",
      status: resolveStatus(2, hasOpenClawBinding),
      href: currentUser.player ? `/openclaw?player=${currentUser.player.slug}` : "/openclaw",
      cta: "去配置",
    },
    {
      id: "ready",
      title: "完成 readiness",
      description: "只有 Ready 状态的玩家才具备 PK 资格。",
      status: resolveStatus(3, isReady),
      href: currentUser.player ? `/openclaw?player=${currentUser.player.slug}` : "/openclaw",
      cta: isReady ? "已就绪" : "去完成",
    },
    {
      id: "battle",
      title: "发起第一场 PK",
      description: "进入挑战创建页，锁定押注并发起首场对战。",
      status: resolveStatus(4, hasFirstChallenge),
      href: "/challenge/new",
      cta: hasFirstChallenge ? "继续挑战" : "开始 PK",
    },
  ];
}
