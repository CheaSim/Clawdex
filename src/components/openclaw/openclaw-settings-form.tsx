"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  openClawRegions,
  openClawStatusMeta,
  type OpenClawConnectionStatus,
  type PlayerProfile,
  type UpdateOpenClawPayload,
} from "@/data/product-data";

const statusOptions: OpenClawConnectionStatus[] = ["disconnected", "configured", "ready"];

type OpenClawSettingsFormProps = {
  initialPlayers: PlayerProfile[];
  initialSlug?: string;
};

function buildFormState(player: PlayerProfile): UpdateOpenClawPayload {
  return {
    channel: player.openClaw.channel,
    accountId: player.openClaw.accountId,
    region: player.openClaw.region,
    clientVersion: player.openClaw.clientVersion,
    status: player.openClaw.status,
    notes: player.openClaw.notes,
  };
}

export function OpenClawSettingsForm({ initialPlayers, initialSlug }: OpenClawSettingsFormProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? initialPlayers[0]?.slug ?? "");
  const selectedPlayer = useMemo(
    () => players.find((player) => player.slug === selectedSlug) ?? players[0],
    [players, selectedSlug],
  );
  const [formState, setFormState] = useState<UpdateOpenClawPayload>(() =>
    selectedPlayer
      ? buildFormState(selectedPlayer)
      : {
          channel: "",
          accountId: "",
          region: "CN",
          clientVersion: "",
          status: "disconnected",
          notes: "",
        },
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedPlayer) {
    return <div className="glass-panel rounded-[28px] p-6 text-sm text-muted">当前没有可管理的玩家。</div>;
  }

  function handlePlayerChange(nextSlug: string) {
    setSelectedSlug(nextSlug);
    const nextPlayer = players.find((player) => player.slug === nextSlug);

    if (nextPlayer) {
      setFormState(buildFormState(nextPlayer));
      setMessage("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/players/${selectedPlayer.slug}/openclaw`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const result = (await response.json()) as { message?: string; player?: PlayerProfile };

      if (!response.ok) {
        setMessage(result.message ?? "OpenClaw 配置保存失败");
        return;
      }

      if (result.player) {
        setPlayers((current) => current.map((entry) => (entry.slug === result.player?.slug ? result.player : entry)));
        setFormState(buildFormState(result.player));
      }

      setMessage(result.message ?? "OpenClaw 配置已更新");
    } catch {
      setMessage("网络异常，OpenClaw 配置未提交成功。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[28px] p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-muted md:col-span-2">
            选择玩家
            <select
              value={selectedSlug}
              onChange={(event) => handlePlayerChange(event.target.value)}
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
            OpenClaw 通道名
            <input
              value={formState.channel}
              onChange={(event) => setFormState((current) => ({ ...current, channel: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="例如：OpenClaw Creator Relay"
            />
          </label>

          <label className="text-sm text-muted">
            账号标识
            <input
              value={formState.accountId}
              onChange={(event) => setFormState((current) => ({ ...current, accountId: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="例如：NP-4410"
            />
          </label>

          <label className="text-sm text-muted">
            区域
            <select
              value={formState.region}
              onChange={(event) => setFormState((current) => ({ ...current, region: event.target.value as UpdateOpenClawPayload["region"] }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
            >
              {openClawRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            客户端版本
            <input
              value={formState.clientVersion}
              onChange={(event) => setFormState((current) => ({ ...current, clientVersion: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="例如：0.9.4"
            />
          </label>

          <div className="text-sm text-muted md:col-span-2">
            接入状态
            <div className="mt-2 flex flex-wrap gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormState((current) => ({ ...current, status }))}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    formState.status === status
                      ? "bg-accent text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  {openClawStatusMeta[status].label}
                </button>
              ))}
            </div>
          </div>

          <label className="text-sm text-muted md:col-span-2">
            通道备注
            <textarea
              value={formState.notes ?? ""}
              onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50"
              placeholder="记录联机校验、通道用途或风控说明"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "保存中..." : "保存 OpenClaw 配置"}
          </button>
          <Link href={`/players/${selectedPlayer.slug}`} className="btn-secondary">
            返回玩家主页
          </Link>
        </div>
        {message ? <p className="mt-4 text-sm text-accentSecondary">{message}</p> : null}
      </form>

      <div className="space-y-6">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">当前状态</p>
          <h2 className="mt-3 text-2xl font-semibold">{selectedPlayer.name} 的 OpenClaw 通道</h2>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className={`text-sm ${openClawStatusMeta[formState.status].tone}`}>{openClawStatusMeta[formState.status].label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{openClawStatusMeta[formState.status].description}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted">最近配置时间</p>
              <p className="mt-2 text-sm text-slate-200">
                {selectedPlayer.openClaw.configuredAt
                  ? new Date(selectedPlayer.openClaw.configuredAt).toLocaleString("zh-CN")
                  : "尚未配置"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted">最近校验时间</p>
              <p className="mt-2 text-sm text-slate-200">
                {selectedPlayer.openClaw.lastVerifiedAt
                  ? new Date(selectedPlayer.openClaw.lastVerifiedAt).toLocaleString("zh-CN")
                  : "等待首次校验"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-sm text-accent">接入规则</p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              “待校验”表示已经填好通道资料，但还没有通过最终联机校验。
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              只有“已就绪”才可以发起挑战、接受挑战，并进入奖池锁定流程。
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              如果某个通道需要暂停使用，可以切回“未接入”，平台会立即关闭相关对战入口。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
