"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { matchModes, players, type CreateChallengePayload, type PlayerProfile, type SettlementPreview } from "@/data/product-data";
import { buildSettlementPreview } from "@/lib/settlement";

const initialPayload: CreateChallengePayload = {
  challengerSlug: "frostclaw",
  defenderSlug: "nightpaw",
  mode: "public-arena",
  stake: 40,
  scheduledFor: "今晚 20:30",
  rulesNote: "三局两胜，允许观众投票和赛后评分。",
  visibility: "public",
};

export function ChallengeCreatorForm() {
  const router = useRouter();
  const [payload, setPayload] = useState<CreateChallengePayload>(initialPayload);
  const [serverPreview, setServerPreview] = useState<SettlementPreview | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [createdChallengeId, setCreatedChallengeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengerProfile, setChallengerProfile] = useState<PlayerProfile | null>(null);
  const [defenderProfile, setDefenderProfile] = useState<PlayerProfile | null>(null);

  const preview = useMemo(() => buildSettlementPreview(payload), [payload]);

  useEffect(() => {
    async function loadPlayer(slug: string, apply: (player: PlayerProfile | null) => void) {
      try {
        const response = await fetch(`/api/players/${slug}`);

        if (!response.ok) {
          apply(null);
          return;
        }

        const result = (await response.json()) as PlayerProfile;
        apply(result);
      } catch {
        apply(null);
      }
    }

    loadPlayer(payload.challengerSlug, setChallengerProfile);
    loadPlayer(payload.defenderSlug, setDefenderProfile);
  }, [payload.challengerSlug, payload.defenderSlug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setCreatedChallengeId(null);

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message?: string; preview?: SettlementPreview; challengeId?: string };

      if (!response.ok) {
        setStatusMessage(result.message ?? "创建挑战失败，请稍后再试。");
        return;
      }

      setServerPreview(result.preview ?? null);
      setCreatedChallengeId(result.challengeId ?? null);
      setStatusMessage(result.message ?? "挑战已创建，等待对手接受。");
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
            我方选手
            <select
              value={payload.challengerSlug}
              onChange={(event) => setPayload((current) => ({ ...current, challengerSlug: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
            >
              {players.map((player) => (
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
              {players.map((player) => (
                <option key={player.slug} value={player.slug}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            对战模式
            <select
              value={payload.mode}
              onChange={(event) => setPayload((current) => ({ ...current, mode: event.target.value as CreateChallengePayload["mode"] }))}
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
            挑战押注（20 - 200）
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
                { value: "followers", label: "仅粉丝与关注者" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPayload((current) => ({ ...current, visibility: option.value as CreateChallengePayload["visibility"] }))}
                  className={`rounded-full px-4 py-2 text-sm transition ${payload.visibility === option.value ? "bg-accent text-slate-950" : "border border-white/10 bg-white/5 text-slate-200"}`}
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
              placeholder="写给观众和对手看的规则说明"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "创建中..." : "提交挑战"}
          </button>
          <span className="text-sm text-muted">提交后会冻结发起方 stake，并生成可分享的挑战详情页。</span>
        </div>
        {statusMessage ? <p className="mt-4 text-sm text-accentSecondary">{statusMessage}</p> : null}
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
          <p className="text-sm text-accent">钱包约束</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">发起方余额</p>
              <p className="mt-2 text-2xl font-semibold text-accentSecondary">{challengerProfile?.clawPoints ?? "--"}</p>
              <p className="mt-2 text-sm text-muted">
                提交后预计剩余 {challengerProfile ? Math.max(challengerProfile.clawPoints - payload.stake, 0) : "--"} Claw Points
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted">对手可接受门槛</p>
              <p className="mt-2 text-2xl font-semibold">{defenderProfile?.clawPoints ?? "--"}</p>
              <p className="mt-2 text-sm text-muted">对手至少需要 {payload.stake} Claw Points 才能接战。</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">即时预览</p>
          <h2 className="mt-3 text-2xl font-semibold">这场挑战值不值得打</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-accentSecondary">赢家奖励</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{preview.winnerReward}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-danger">输家代价</p>
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
