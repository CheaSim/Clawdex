"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  isPlayerOpenClawReady,
  matchModes,
  openClawStatusMeta,
  type CreateChallengePayload,
  type PlayerProfile,
  type SettlementPreview,
} from "@/data/product-data";
import { buildSettlementPreview } from "@/lib/settlement";

const initialPayload: CreateChallengePayload = {
  challengerSlug: "",
  defenderSlug: "",
  mode: "public-arena",
  stake: 40,
  scheduledFor: "今晚 20:30",
  rulesNote: "三局两胜，允许观众投票和赛后评分。",
  visibility: "public",
};

type ChallengeCreatorFormProps = {
  initialPlayers: PlayerProfile[];
  currentUserPlayerSlug?: string | null;
  isAdmin?: boolean;
};

function resolveInitialPayload(players: PlayerProfile[], currentUserPlayerSlug?: string | null) {
  const challenger =
    players.find((player) => player.slug === currentUserPlayerSlug) ??
    players[0];
  const defender = players.find((player) => player.slug !== challenger?.slug) ?? challenger;

  return {
    ...initialPayload,
    challengerSlug: challenger?.slug ?? "",
    defenderSlug: defender?.slug ?? "",
  };
}

export function ChallengeCreatorForm({
  initialPlayers,
  currentUserPlayerSlug = null,
  isAdmin = false,
}: ChallengeCreatorFormProps) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [payload, setPayload] = useState<CreateChallengePayload>(() =>
    resolveInitialPayload(initialPlayers, currentUserPlayerSlug),
  );
  const [serverPreview, setServerPreview] = useState<SettlementPreview | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [createdChallengeId, setCreatedChallengeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => buildSettlementPreview(payload), [payload]);
  const challengerProfile = players.find((player) => player.slug === payload.challengerSlug) ?? null;
  const defenderProfile = players.find((player) => player.slug === payload.defenderSlug) ?? null;
  const challengerReady = challengerProfile ? isPlayerOpenClawReady(challengerProfile) : false;
  const defenderReady = defenderProfile ? isPlayerOpenClawReady(defenderProfile) : false;
  const allowedPlayers = isAdmin ? players : players.filter((player) => player.slug === currentUserPlayerSlug);
  const defenderOptions = players.filter((player) => player.slug !== payload.challengerSlug);
  const canSubmit =
    challengerReady &&
    defenderReady &&
    !isSubmitting &&
    Boolean(payload.challengerSlug) &&
    Boolean(payload.defenderSlug) &&
    (isAdmin || payload.challengerSlug === currentUserPlayerSlug);

  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  useEffect(() => {
    if (!isAdmin && currentUserPlayerSlug) {
      setPayload((current) => {
        const nextDefender = current.defenderSlug === currentUserPlayerSlug
          ? players.find((player) => player.slug !== currentUserPlayerSlug)?.slug ?? ""
          : current.defenderSlug;

        return {
          ...current,
          challengerSlug: currentUserPlayerSlug,
          defenderSlug: nextDefender,
        };
      });
    }
  }, [currentUserPlayerSlug, isAdmin, players]);

  async function handleRefreshPlayer(slug: string) {
    if (!slug) {
      return;
    }

    try {
      const response = await fetch(`/api/players/${slug}`);

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as PlayerProfile;
      setPlayers((current) => current.map((entry) => (entry.slug === result.slug ? result : entry)));
    } catch {
      // best-effort refresh only
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setCreatedChallengeId(null);

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
        preview?: SettlementPreview;
        challengeId?: string;
      };

      if (!response.ok) {
        setStatusMessage(result.message ?? "创建挑战失败，请稍后重试。");
        await Promise.all([handleRefreshPlayer(payload.challengerSlug), handleRefreshPlayer(payload.defenderSlug)]);
        return;
      }

      setServerPreview(result.preview ?? null);
      setCreatedChallengeId(result.challengeId ?? null);
      setStatusMessage(result.message ?? "挑战已创建，等待对手接受。");
      await Promise.all([handleRefreshPlayer(payload.challengerSlug), handleRefreshPlayer(payload.defenderSlug)]);
      router.refresh();
    } catch {
      setStatusMessage("网络异常，挑战未提交成功。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[28px] p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-muted">
            发起玩家
            <select
              value={payload.challengerSlug}
              onChange={(event) =>
                setPayload((current) => ({
                  ...current,
                  challengerSlug: event.target.value,
                  defenderSlug:
                    current.defenderSlug === event.target.value
                      ? defenderOptions.find((player) => player.slug !== event.target.value)?.slug ?? ""
                      : current.defenderSlug,
                }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
            >
              {allowedPlayers.map((player) => (
                <option key={player.slug} value={player.slug}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            对手
            <select
              value={payload.defenderSlug}
              onChange={(event) => setPayload((current) => ({ ...current, defenderSlug: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
            >
              {defenderOptions.map((player) => (
                <option key={player.slug} value={player.slug}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            挑战模式
            <select
              value={payload.mode}
              onChange={(event) =>
                setPayload((current) => ({ ...current, mode: event.target.value as CreateChallengePayload["mode"] }))}
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
            开战时间
            <input
              value={payload.scheduledFor}
              onChange={(event) => setPayload((current) => ({ ...current, scheduledFor: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="例如：今晚 20:30"
            />
          </label>

          <label className="text-sm text-muted md:col-span-2">
            挑战押注：20 - 200
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={payload.stake}
              onChange={(event) => setPayload((current) => ({ ...current, stake: Number(event.target.value) }))}
              className="mt-3 w-full"
            />
            <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
              <span>20</span>
              <span className="text-lg font-semibold text-accentSecondary">{payload.stake} Claw Points</span>
              <span>200</span>
            </div>
          </label>

          <label className="text-sm text-muted md:col-span-2">
            可见范围
            <div className="mt-2 flex gap-3">
              {[
                { value: "public", label: "全站公开" },
                { value: "followers", label: "仅关注者可见" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setPayload((current) => ({
                      ...current,
                      visibility: option.value as CreateChallengePayload["visibility"],
                    }))}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    payload.visibility === option.value
                      ? "bg-accent text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="text-sm text-muted md:col-span-2">
            对战备注
            <textarea
              value={payload.rulesNote ?? ""}
              onChange={(event) => setPayload((current) => ({ ...current, rulesNote: event.target.value }))}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="写给观众和对手看的规则、叙事或特殊说明"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={!canSubmit} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "创建中..." : "提交挑战"}
          </button>
          <span className="text-sm text-muted">提交后会冻结发起方押注，并生成可分享的挑战详情页。</span>
        </div>

        {!challengerReady || !defenderReady ? (
          <p className="mt-4 text-sm text-amber-200">
            只有完成 OpenClaw 通道校验的玩家才能创建对战。先去
            <Link
              href={`/openclaw?player=${!challengerReady ? payload.challengerSlug : payload.defenderSlug}`}
              className="ml-1 text-accentSecondary transition hover:text-accent"
            >
              补全接入配置 →
            </Link>
          </p>
        ) : null}

        {statusMessage ? <p className="mt-4 text-sm text-accentSecondary">{statusMessage}</p> : null}

        {!isAdmin && currentUserPlayerSlug ? (
          <p className="mt-4 text-sm text-muted">当前登录账号绑定的玩家身份为：{currentUserPlayerSlug}，发起方已自动锁定。</p>
        ) : null}

        {createdChallengeId ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link href={`/challenge/${createdChallengeId}`} className="text-accentSecondary transition hover:text-accent">
              进入挑战详情 →
            </Link>
          </div>
        ) : null}
      </form>

      <div className="space-y-6">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">风控与钱包约束</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">发起方余额</p>
              <p className="mt-2 text-2xl font-semibold text-accentSecondary">{challengerProfile?.clawPoints ?? "--"}</p>
              <p className="mt-2 text-sm text-muted">
                提交后预计剩余 {challengerProfile ? Math.max(challengerProfile.clawPoints - payload.stake, 0) : "--"} Claw Points
              </p>
              {challengerProfile ? (
                <p className={`mt-3 text-sm ${openClawStatusMeta[challengerProfile.openClaw.status].tone}`}>
                  OpenClaw：{openClawStatusMeta[challengerProfile.openClaw.status].label}
                </p>
              ) : null}
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">对手接战门槛</p>
              <p className="mt-2 text-2xl font-semibold">{defenderProfile?.clawPoints ?? "--"}</p>
              <p className="mt-2 text-sm text-muted">对手至少需要 {payload.stake} Claw Points 才能接战。</p>
              {defenderProfile ? (
                <p className={`mt-3 text-sm ${openClawStatusMeta[defenderProfile.openClaw.status].tone}`}>
                  OpenClaw：{openClawStatusMeta[defenderProfile.openClaw.status].label}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-200">
            <p className="font-medium text-slate-100">擂台门槛</p>
            <p className="mt-2 leading-6 text-muted">
              发起方和对手都必须处于“已就绪”状态，Clawdex 才会允许这场挑战进入创建与锁池流程。
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">即时收益预览</p>
          <h2 className="mt-3 text-2xl font-semibold">这场挑战值不值得打？</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-accentSecondary">胜者收益</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{preview.winnerReward}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-danger">败者代价</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{preview.loserPenalty}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">平台回流</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{preview.platformReturn}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">额外曝光</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{preview.exposureBonus}</p>
            </div>
          </div>
        </div>

        {serverPreview ? (
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm text-accent">服务端确认</p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p>{serverPreview.winnerReward}</p>
              <p>{serverPreview.loserPenalty}</p>
              <p>{serverPreview.platformReturn}</p>
              <p>{serverPreview.exposureBonus}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
