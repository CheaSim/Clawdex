import type {
  AcceptChallengePayload,
  CreateChallengePayload,
  MatchListing,
  MatchMode,
  SettleChallengePayload,
} from "@/data/product-data";
import type { PluginProvisionAccountInput } from "@/lib/openclaw-auto-agent";

type PluginStatusSnapshot = {
  ok: boolean;
  channel: string;
  authMode: "open" | "token";
  stats: {
    players: number;
    challenges: number;
    readyPlayers: number;
  };
};

type PluginDiscoverySnapshot = {
  ok: boolean;
  channel: string;
  authMode: "open" | "token";
  homepage: string;
  routes: {
    openClawSetup: string;
    challenges: string;
  };
  recommendedFlow: readonly string[];
};

type PluginProvisionResult = {
  player: {
    slug: string;
    name: string;
  };
};

type PluginReadinessResult = {
  playerSlug: string;
  ready: boolean;
};

type PluginCreditResult = unknown;

export type PluginLabSelfTestInput = {
  origin: string;
  mode: "quick" | "full";
  battleMode?: MatchMode;
  stake?: number;
  settleWinner?: "challenger" | "defender";
  autoReady?: boolean;
};

export type PluginLabSelfTestDeps = {
  getStatus: () => Promise<PluginStatusSnapshot>;
  getDiscovery: (origin: string) => Promise<PluginDiscoverySnapshot>;
  provisionAccount: (input: PluginProvisionAccountInput) => Promise<PluginProvisionResult>;
  getReadiness: (playerSlug: string) => Promise<PluginReadinessResult>;
  createChallenge: (payload: CreateChallengePayload) => Promise<{ challenge: MatchListing }>;
  acceptChallenge: (challengeId: string, payload: AcceptChallengePayload) => Promise<{ challenge: MatchListing }>;
  settleChallenge: (challengeId: string, payload: SettleChallengePayload) => Promise<MatchListing>;
  getCredit: (input: { playerSlug: string }) => Promise<PluginCreditResult>;
  now: () => number;
};

export type PluginLabQuickSelfTestResult = Awaited<ReturnType<typeof runPluginLabSelfTest>> & { mode: "quick" };
export type PluginLabFullSelfTestResult = Awaited<ReturnType<typeof runPluginLabSelfTest>> & { mode: "full" };

function formatSuffix(stamp: number) {
  return String(stamp).slice(-4);
}

function buildProvisionInputs(stamp: number, autoReady: boolean) {
  const suffix = formatSuffix(stamp);

  return {
    challenger: {
      email: `plugin-lab-challenger-${stamp}@agents.clawdex.local`,
      name: `Plugin Lab Challenger ${suffix}`,
      preferredPlayerSlug: `plugin-lab-challenger-${suffix}`,
      playerName: `Plugin Lab Challenger ${suffix}`,
      channel: "Clawdex Plugin Lab",
      accountId: `pll-ch-${suffix}`,
      clientVersion: "plugin-lab",
      notes: "Created by Plugin Lab full self-test.",
      autoReady,
      openClawStatus: autoReady ? "ready" : "configured",
    } satisfies PluginProvisionAccountInput,
    defender: {
      email: `plugin-lab-defender-${stamp}@agents.clawdex.local`,
      name: `Plugin Lab Defender ${suffix}`,
      preferredPlayerSlug: `plugin-lab-defender-${suffix}`,
      playerName: `Plugin Lab Defender ${suffix}`,
      channel: "Clawdex Plugin Lab",
      accountId: `pll-df-${suffix}`,
      clientVersion: "plugin-lab",
      notes: "Created by Plugin Lab full self-test.",
      autoReady,
      openClawStatus: autoReady ? "ready" : "configured",
    } satisfies PluginProvisionAccountInput,
  };
}

function buildChallengePayload(input: PluginLabSelfTestInput, challengerSlug: string, defenderSlug: string): CreateChallengePayload {
  return {
    challengerSlug,
    defenderSlug,
    mode: input.battleMode ?? "public-arena",
    stake: input.stake ?? 20,
    scheduledFor: "即刻开战",
    rulesNote: "Created by Plugin Lab full self-test.",
    visibility: "public",
  };
}

function buildLinks(origin: string, challengeId: string, challengerSlug: string, defenderSlug: string) {
  return {
    challenge: `${origin}/challenge/${challengeId}`,
    replay: `${origin}/replay/${challengeId}`,
    challengerPlayer: `${origin}/players/${challengerSlug}`,
    defenderPlayer: `${origin}/players/${defenderSlug}`,
  };
}

export async function runPluginLabSelfTest(deps: PluginLabSelfTestDeps, input: PluginLabSelfTestInput) {
  const status = await deps.getStatus();
  const discovery = await deps.getDiscovery(input.origin);

  if (input.mode === "quick") {
    return {
      ok: true as const,
      mode: "quick" as const,
      channel: "clawdex-channel",
      status,
      discovery,
      checks: [
        { key: "control-plane", label: "Control Plane", status: status.ok ? "pass" : "fail" },
        {
          key: "ready-players",
          label: "Ready Players",
          status: status.stats.readyPlayers > 0 ? "pass" : "warn",
          value: status.stats.readyPlayers,
        },
      ],
    };
  }

  const stamp = deps.now();
  const autoReady = input.autoReady ?? true;
  const provisionInputs = buildProvisionInputs(stamp, autoReady);
  const challengerProvision = await deps.provisionAccount(provisionInputs.challenger);
  const defenderProvision = await deps.provisionAccount(provisionInputs.defender);
  const challengerSlug = challengerProvision.player.slug;
  const defenderSlug = defenderProvision.player.slug;
  const [challengerReadiness, defenderReadiness] = await Promise.all([
    deps.getReadiness(challengerSlug),
    deps.getReadiness(defenderSlug),
  ]);

  if (!challengerReadiness.ready || !defenderReadiness.ready) {
    throw new Error("Plugin Lab self-test requires both provisioned players to be ready.");
  }

  const challengePayload = buildChallengePayload(input, challengerSlug, defenderSlug);
  const created = await deps.createChallenge(challengePayload);
  await deps.acceptChallenge(created.challenge.id, {
    defenderSlug,
    sourceChannel: "clawdex-channel",
    sourceSessionId: `plugin-lab-accept-${stamp}`,
  });

  const winnerSlug = input.settleWinner === "defender" ? defenderSlug : challengerSlug;
  const settlement = await deps.settleChallenge(created.challenge.id, {
    winnerSlug,
    sourceChannel: "clawdex-channel",
    sourceSessionId: `plugin-lab-settle-${stamp}`,
    settlementSummary: `Plugin Lab self-test completed. Winner: ${winnerSlug}`,
  });

  const [challengerCredit, defenderCredit] = await Promise.all([
    deps.getCredit({ playerSlug: challengerSlug }),
    deps.getCredit({ playerSlug: defenderSlug }),
  ]);

  return {
    ok: true as const,
    mode: "full" as const,
    channel: "clawdex-channel",
    status,
    discovery,
    summary: {
      challengeId: created.challenge.id,
      challengerSlug,
      defenderSlug,
      winnerSlug,
    },
    links: buildLinks(input.origin, created.challenge.id, challengerSlug, defenderSlug),
    steps: {
      challengerProvision,
      defenderProvision,
      challengerReadiness,
      defenderReadiness,
      createdChallenge: created.challenge,
      settlement,
      challengerCredit,
      defenderCredit,
    },
  };
}
