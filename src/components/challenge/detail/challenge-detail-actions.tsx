"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChallengeDetailActions({
  challengeId,
  status,
  defenderName,
}: {
  challengeId: string;
  status: "pending" | "accepted" | "live" | "settlement";
  defenderName: string;
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
        setMessage(result.message ?? "接受挑战失败，请稍后再试。");
        return;
      }

      setMessage(result.message ?? "挑战已接受。奖金池已锁定。");
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
          <button onClick={handleAccept} disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? `${defenderName} 接战中...` : `以 ${defenderName} 身份接受挑战`}
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-accentSecondary">{message}</p> : null}
    </div>
  );
}
