"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginFormProps = {
  callbackUrl: string;
  errorMessage?: string;
  registered?: boolean;
};

export function LoginForm({ callbackUrl, errorMessage, registered = false }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(errorMessage ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setFormError("请先填写邮箱和密码。");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setFormError("邮箱或密码不正确。");
      setIsSubmitting(false);
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block text-sm text-muted">
        邮箱
        <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="you@clawdex.local" />
      </label>
      <label className="block text-sm text-muted">
        密码
        <input name="password" type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="至少 8 位" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "登录中..." : "登录"}
        </button>
        <Link href="/register" className="btn-secondary">没有账号？去注册</Link>
      </div>
      {registered ? <p className="text-sm text-accentSecondary">注册成功，现在可以登录了。</p> : null}
      {formError ? <p className="text-sm text-amber-200">{formError}</p> : null}
    </form>
  );
}
