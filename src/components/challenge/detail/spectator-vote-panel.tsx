"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SpectatorVotePanelProps = {
  challengeId: string;
  challengerSlug: string;
  challengerName: string;
  defenderSlug: string;
  defenderName: string;
};

export function SpectatorVotePanel({
  challengeId,
  challengerSlug,
  challengerName,
  defenderSlug,
  defenderName,
}: SpectatorVotePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  async function castVote(voteType: string, targetPlayerSlug?: string) {
    setFeedback(null);

    const response = await fetch(`/api/challenges/${challengeId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType, targetPlayerSlug }),
    });

    const data = await response.json();

    if (response.ok) {
      const rewardText = data.reward > 0 ? `获得 ${data.reward} Claw Points 评委奖励！` : "";
      setFeedback(`投票成功！${rewardText}`);
      startTransition(() => router.refresh());
    } else {
      setFeedback(data.message ?? "投票失败");
    }
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold">观众投票</h3>
      <p className="mt-2 text-sm text-muted">为你支持的选手投票，或标记名场面。每次投票可获得评委 Claw Points 奖励。</p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-accent">MVP 投票 <span className="text-accentSecondary">+5 CP</span></p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => castVote("MVP", challengerSlug)}
              className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50"
            >
              {challengerName}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => castVote("MVP", defenderSlug)}
              className="rounded-full border border-accentSecondary/30 bg-accentSecondary/10 px-4 py-2 text-sm text-accentSecondary transition hover:bg-accentSecondary/20 disabled:opacity-50"
            >
              {defenderName}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-accent">支持站队 <span className="text-accentSecondary">+3 CP</span></p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => castVote("SUPPORT", challengerSlug)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accent/30 hover:bg-white/5 disabled:opacity-50"
            >
              支持 {challengerName}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => castVote("SUPPORT", defenderSlug)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accentSecondary/30 hover:bg-white/5 disabled:opacity-50"
            >
              支持 {defenderName}
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => castVote("MOMENT")}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accent/30 hover:bg-white/5 disabled:opacity-50"
        >
          标记名场面 <span className="text-accentSecondary">+2 CP</span>
        </button>
      </div>

      {feedback && (
        <p className={`mt-3 text-sm ${feedback === "投票成功！" ? "text-accentSecondary" : "text-danger"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
