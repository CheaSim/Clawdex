"use client";

import Link from "next/link";
import { useState } from "react";

import { matchModes, type MatchMode } from "@/data/product-data";

type QuickResult = {
  mode: "quick";
  status: {
    authMode: "open" | "token";
    stats: {
      players: number;
      challenges: number;
      readyPlayers: number;
    };
  };
  discovery: {
    homepage: string;
    routes: {
      openClawSetup: string;
      challenges: string;
    };
    recommendedFlow: string[];
  };
  checks: Array<{
    key: string;
    label: string;
    status: "pass" | "warn" | "fail";
    value?: number;
  }>;
};

type FullResult = {
  mode: "full";
  status: QuickResult["status"];
  discovery: QuickResult["discovery"];
  summary: {
    challengeId: string;
    challengerSlug: string;
    defenderSlug: string;
    winnerSlug: string;
  };
  links: {
    challenge: string;
    replay: string;
    challengerPlayer: string;
    defenderPlayer: string;
  };
  steps: {
    challengerProvision: { player: { slug: string; name: string } };
    defenderProvision: { player: { slug: string; name: string } };
    challengerReadiness: { ready: boolean };
    defenderReadiness: { ready: boolean };
    createdChallenge: { rewardPool: number; stake: number };
    settlement: { settlementSummary?: string };
    challengerCredit: { player?: { clawPoints?: number } };
    defenderCredit: { player?: { clawPoints?: number } };
  };
};

type SelfTestResult = QuickResult | FullResult;

type PluginLabSelfTestPanelProps = {
  backend: "mock" | "prisma";
};

const statusTone = {
  pass: "text-accentSecondary",
  warn: "text-amber-300",
  fail: "text-danger",
} as const;

export function PluginLabSelfTestPanel({ backend }: PluginLabSelfTestPanelProps) {
  const [battleMode, setBattleMode] = useState<MatchMode>("public-arena");
  const [stake, setStake] = useState(20);
  const [settleWinner, setSettleWinner] = useState<"challenger" | "defender">("challenger");
  const [isSubmitting, setIsSubmitting] = useState<"quick" | "full" | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<SelfTestResult | null>(null);

  async function runSelfTest(mode: "quick" | "full") {
    setIsSubmitting(mode);
    setMessage("");

    try {
      const response = await fetch("/api/openclaw/plugin-lab/selftest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          battleMode,
          stake,
          settleWinner,
          autoReady: true,
        }),
      });

      const payload = (await response.json()) as SelfTestResult & { message?: string };

      if (!response.ok) {
        setResult(null);
        setMessage(payload.message ?? "Plugin Lab 自测失败。");
        return;
      }

      setResult(payload);
      setMessage(mode === "quick" ? "Quick probe 已完成。" : "Full control-plane drill 已完成。");
    } catch {
      setResult(null);
      setMessage("网络异常，Plugin Lab 自测未能完成。");
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">一键联调</p>
          <h2 className="mt-3 text-2xl font-semibold">在网页里直接跑 quick probe 和 full drill</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            quick probe 只探测 control plane 状态；full drill 会真实 provision 两个测试选手、创建挑战、接战、结算并返回回放链接。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-muted">
              Battle Mode
              <select
                value={battleMode}
                onChange={(event) => setBattleMode(event.target.value as MatchMode)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              >
                {matchModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-muted">
              Settle Winner
              <select
                value={settleWinner}
                onChange={(event) => setSettleWinner(event.target.value as "challenger" | "defender")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              >
                <option value="challenger">Challenger</option>
                <option value="defender">Defender</option>
              </select>
            </label>
          </div>

          <label className="mt-5 block text-sm text-muted">
            Stake: {stake} CP
            <input
              type="range"
              min={20}
              max={60}
              step={5}
              value={stake}
              onChange={(event) => setStake(Number(event.target.value))}
              className="mt-3 w-full"
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => runSelfTest("quick")}
              disabled={isSubmitting !== null}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting === "quick" ? "Quick Probe..." : "Run Quick Probe"}
            </button>
            <button
              type="button"
              onClick={() => runSelfTest("full")}
              disabled={isSubmitting !== null || backend !== "prisma"}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting === "full" ? "Running Full Drill..." : "Run Full Drill"}
            </button>
          </div>

          <p className="mt-4 text-sm text-muted">
            {backend === "prisma"
              ? "当前后端支持 full drill。"
              : "当前是 mock 后端，只能跑 quick probe；full drill 需要 Prisma / PostgreSQL。"}
          </p>

          {message ? <p className="mt-4 text-sm text-accentSecondary">{message}</p> : null}
        </div>

        {result?.mode === "quick" ? (
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm text-accent">Quick Probe Result</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Players</p>
                <p className="mt-2 text-xl font-semibold">{result.status.stats.players}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Challenges</p>
                <p className="mt-2 text-xl font-semibold">{result.status.stats.challenges}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Ready Players</p>
                <p className="mt-2 text-xl font-semibold">{result.status.stats.readyPlayers}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {result.checks.map((check) => (
                <div key={check.key} className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4">
                  <p className={`text-sm font-semibold ${statusTone[check.status]}`}>{check.label}</p>
                  {check.value !== undefined ? <p className="mt-2 text-sm text-slate-200">当前值：{check.value}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">Discovery Snapshot</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted">Homepage</p>
              <p className="mt-2 text-sm text-slate-200">{result?.discovery.homepage ?? "等待自测结果"}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted">Auth Mode</p>
              <p className="mt-2 text-sm text-slate-200">{result?.status.authMode ?? "等待自测结果"}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-xs text-muted">Recommended Flow</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(result?.discovery.recommendedFlow ?? ["discover", "configure-control-plane", "create-pk"]).map((step) => (
                <span key={step} className="pill-muted text-sm text-slate-200">
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>

        {result?.mode === "full" ? (
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm text-accent">Full Drill Result</p>
            <h2 className="mt-3 text-2xl font-semibold">真实 control-plane 链路已经跑完</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Challenge ID</p>
                <p className="mt-2 text-sm text-slate-100">{result.summary.challengeId}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Winner</p>
                <p className="mt-2 text-sm text-accentSecondary">{result.summary.winnerSlug}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <a href={result.links.challenge} className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm text-accentSecondary transition hover:border-accent/30">
                打开挑战详情 →
              </a>
              <a href={result.links.replay} className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm text-accentSecondary transition hover:border-accent/30">
                打开回放页面 →
              </a>
              <a href={result.links.challengerPlayer} className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm text-accentSecondary transition hover:border-accent/30">
                查看 Challenger 玩家页 →
              </a>
              <a href={result.links.defenderPlayer} className="rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm text-accentSecondary transition hover:border-accent/30">
                查看 Defender 玩家页 →
              </a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Provisioned Players</p>
                <p className="mt-2 text-sm text-slate-200">{result.steps.challengerProvision.player.name}</p>
                <p className="mt-1 text-sm text-slate-200">{result.steps.defenderProvision.player.name}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-muted">Challenge Pool</p>
                <p className="mt-2 text-sm text-slate-200">
                  stake {result.steps.createdChallenge.stake} · pool {result.steps.createdChallenge.rewardPool}
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  readiness {result.steps.challengerReadiness.ready ? "ready" : "not ready"} /{" "}
                  {result.steps.defenderReadiness.ready ? "ready" : "not ready"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs text-muted">Settlement Summary</p>
              <p className="mt-2 text-sm text-slate-200">{result.steps.settlement.settlementSummary ?? "已完成结算"}</p>
              <p className="mt-3 text-sm text-slate-300">
                Challenger CP: {result.steps.challengerCredit.player?.clawPoints ?? "--"} · Defender CP:{" "}
                {result.steps.defenderCredit.player?.clawPoints ?? "--"}
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm text-accent">Next Move</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                先跑 Quick Probe，确认 control plane、ready players 和 discovery 信息都正常。
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                再跑 Full Drill，把 provision → readiness → create → accept → settle 整条链路实际走通。
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                Drill 完成后，直接点结果里的 challenge / replay / player 链接继续人工验收。
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/openclaw" className="btn-secondary">
                返回 OpenClaw 面板
              </Link>
              <Link href="/replay" className="btn-secondary">
                查看回放列表
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
