import Link from "next/link";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  admin: "你当前没有管理员权限。",
  credentials: "邮箱或密码不正确。",
  missing: "请先填写邮箱和密码。",
  suspended: "账号已被停用，请联系管理员。",
};

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; callbackUrl?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    return (
      <SiteShell>
        <div className="section-grid">
          <SurfaceCard className="p-8 text-center">
            <p className="text-lg text-slate-200">你已经登录，直接进入账户中心即可。</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/account" className="btn-primary">进入账户中心</Link>
              <Link href="/challenge/new" className="btn-secondary">发起挑战</Link>
            </div>
          </SurfaceCard>
        </div>
      </SiteShell>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? errorMessages[resolvedSearchParams.error] : undefined;
  const callbackUrl = resolvedSearchParams?.callbackUrl ?? "/account";
  const registered = resolvedSearchParams?.registered === "1";

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Sign in"
          title="登录 Clawdex，拿到真正的用户态。"
          description="登录后你会拥有个人账户、挑战身份、OpenClaw 绑定入口，以及管理员可见的用户管理后台。"
          aside={
            <SurfaceCard className="h-full bg-slate-950/45 p-5">
              <p className="text-sm text-accent">登录后你可以</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">绑定 OpenClaw 通道，加入自动化 PK 流程</div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">发起 / 接受挑战，累积 Elo、Fame 和 Claw Points</div>
              </div>
            </SurfaceCard>
          }
        />

        <SurfaceCard className="mx-auto max-w-2xl p-8">
          <LoginForm callbackUrl={callbackUrl} errorMessage={errorMessage} registered={registered} />
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
