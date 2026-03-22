import { getPluginAuthMode } from "@/lib/openclaw-plugin-auth";

export function buildOpenClawCapabilities() {
  return {
    readiness: {
      supported: true,
      preferred: true,
      notes: "OpenClaw readiness checks are available through the control plane.",
    },
    credits: {
      supported: true,
      preferred: true,
      notes: "Credit balance lookup is stable.",
    },
    accountProvision: {
      supported: true,
      preferred: true,
      notes: "Provisioning is supported for plugin-first onboarding.",
    },
    manualBattleCreate: {
      supported: true,
      preferred: false,
      deprecated: true,
      replacement: "matchmakingJoin",
      notes: "Legacy manual battle creation remains supported for compatibility.",
    },
    manualBattleAccept: {
      supported: true,
      preferred: false,
      deprecated: true,
      replacement: "matchmakingReady",
      notes: "Legacy manual battle acceptance remains supported for compatibility.",
    },
    manualBattleSettle: {
      supported: true,
      preferred: false,
      deprecated: true,
      replacement: "matchmakingReportResult",
      notes: "Legacy settlement sync remains supported for compatibility.",
    },
    matchmakingJoin: {
      supported: true,
      preferred: true,
      notes: "Preferred entry point for OpenClaw-driven battle flow.",
    },
    matchmakingStatus: {
      supported: true,
      preferred: true,
      notes: "Preferred queue/match polling endpoint.",
    },
    matchmakingLeave: {
      supported: true,
      preferred: true,
      notes: "Preferred queue cancellation endpoint.",
    },
    matchmakingReady: {
      supported: true,
      preferred: true,
      notes: "Preferred battle start synchronization endpoint.",
    },
    matchmakingReportResult: {
      supported: true,
      preferred: true,
      notes: "Preferred result reporting endpoint.",
    },
    debate: {
      supported: true,
      preferred: false,
      notes: "Debate module is available as an optional extension.",
    },
  };
}

export function buildOpenClawCompatibility() {
  return {
    deprecatedMethods: [
      "manualBattleCreate",
      "manualBattleAccept",
      "manualBattleSettle",
    ],
    replacementMap: {
      manualBattleCreate: "matchmakingJoin",
      manualBattleAccept: "matchmakingReady",
      manualBattleSettle: "matchmakingReportResult",
    },
    fallbackFlow: [
      "manualBattleCreate",
      "manualBattleAccept",
      "manualBattleSettle",
    ],
    sunsetHints: {
      manualBattleCreate: "Will remain available until the plugin capability router fully ships.",
      manualBattleAccept: "Will remain available until the plugin capability router fully ships.",
      manualBattleSettle: "Will remain available until the plugin capability router fully ships.",
    },
  };
}

export function buildOpenClawDiagnostics(options: {
  origin?: string;
  authMode?: "open" | "token";
  readyPlayers?: number;
}) {
  const authMode = options.authMode ?? getPluginAuthMode();
  const checks = [
    {
      id: "control-plane-discovery",
      status: "pass" as const,
      message: options.origin
        ? `Control plane discovery is available at ${options.origin}.`
        : "Control plane discovery is available.",
      suggestion: "Use discovery before selecting a battle flow.",
    },
    {
      id: "plugin-auth-mode",
      status: "pass" as const,
      message: authMode === "token"
        ? "Plugin authentication is enforced with bearer token mode."
        : "Plugin authentication is operating in open mode.",
      suggestion: authMode === "token"
        ? "Keep OpenClaw token aligned with CLAWDEX_PLUGIN_TOKEN."
        : "Use token mode before production exposure.",
    },
    {
      id: "matchmaking-preferred",
      status: "warn" as const,
      message: "Matchmaking is the preferred OpenClaw battle path; manual battle routes remain available for fallback.",
      suggestion: "Prefer matchmaking.join/status/ready/report-result when the plugin supports them.",
    },
    {
      id: "ready-player-supply",
      status: (options.readyPlayers ?? 0) > 0 ? "pass" as const : "warn" as const,
      message: (options.readyPlayers ?? 0) > 0
        ? `There are ${(options.readyPlayers ?? 0)} ready players available for OpenClaw flows.`
        : "No ready players are currently available.",
      suggestion: "Provision or sync at least one ready player before testing battle automation.",
    },
  ];

  return {
    connectionState: "ok" as const,
    checks,
    recommendedActions: [
      "Call discovery before deciding between matchmaking and legacy manual battle flow.",
      "If connectivity fails, inspect diagnostics checks before retrying.",
      "Upgrade the plugin when preferred matchmaking methods are available but missing locally.",
    ],
  };
}
