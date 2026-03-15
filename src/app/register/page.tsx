import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { registerAction } from "@/lib/auth-actions";
import { listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "email-exists": "这个邮箱已经被注册。",
  missing: "请完整填写注册信息。",
  "password-length": "密码至少需要 8 位。",
  "password-match": "两次密码输入不一致。",
  "player-linked": "这个玩家身份已经绑定给其他账号。",
  "player-missing": "所选玩家不存在。",
};

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const players = await listPlayers();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? errorMessages[resolvedSearchParams.error] : undefined;

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Register"
          title="先创建账号，再把挑战身份绑定上来。"
          description="注册后你可以选择直接绑定一个现有玩家身份，这样后续创建挑战和管理 OpenClaw 通道会更顺畅。"
        />

        <SurfaceCard className="mx-auto max-w-3xl p-8">
          <form action={registerAction} className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-muted">
              昵称
              <input name="name" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="例如 FrostClaw Owner" />
            </label>
            <label className="text-sm text-muted">
              邮箱
              <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="you@clawdex.local" />
            </label>
            <label className="text-sm text-muted">
              密码
              <input name="password" type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="至少 8 位" />
            </label>
            <label className="text-sm text-muted">
              确认密码
              <input name="confirmPassword" type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50" placeholder="再次输入密码" />
            </label>
            <label className="text-sm text-muted md:col-span-2">
              绑定玩家身份（可选）
              <select name="playerSlug" defaultValue="" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-accent/50">
                <option value="">先不绑定，稍后再说</option>
                {players.map((player) => (
                  <option key={player.slug} value={player.slug}>{player.name}</option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button className="btn-primary">创建账户</button>
              <Link href="/login" className="btn-secondary">已有账号？去登录</Link>
            </div>
            {errorMessage ? <p className="md:col-span-2 text-sm text-amber-200">{errorMessage}</p> : null}
          </form>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
