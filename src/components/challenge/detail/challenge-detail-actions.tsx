"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChallengeDetailActions({
  challengeId,
  status,
  defenderName,
  defenderSlug,
  defenderReady,
}: {
  challengeId: string;
  status: "pending" | "accepted" | "live" | "settlement";
  defenderName: string;
  defenderSlug: string;
  defenderReady: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAccept() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/challenges/${challengeId}/accept`, {
        method: "POST",
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(result.message ?? "接受挑战失败，请稍后重试。");
        return;
      }

      setMessage(result.message ?? "挑战已接受，奖池已锁定。");
      router.refresh();
    } catch {
      setMessage("网络异常，暂时无法接受挑战。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Link href="/challenge" className="btn-secondary">
          返回擂台
        </Link>
        {status === "pending" ? (
          defenderReady ? (
            <button onClick={handleAccept} disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? `${defenderName} 接战中...` : `以 ${defenderName} 身份接受挑战`}
            </button>
          ) : (
            <Link href={`/openclaw?player=${defenderSlug}`} className="btn-primary">
              先完成 OpenClaw 接入
            </Link>
          )
        ) : null}
      </div>
      {status === "pending" && !defenderReady ? (
        <p className="text-sm text-amber-200">{defenderName} 还没有完成 OpenClaw 校验，当前不能直接接受这场挑战。</p>
      ) : null}
      {message ? <p className="text-sm text-accentSecondary">{message}</p> : null}
    </div>
  );
}
