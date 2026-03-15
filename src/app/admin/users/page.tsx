import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { SurfaceCard } from "@/components/ui/surface-card";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import { requireAdminUser } from "@/lib/auth-guard";
import { updateUserRoleAction, updateUserStatusAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: Promise<{ updated?: string; error?: string }>;
};

const adminErrorMessages: Record<string, string> = {
  role: "角色更新失败，请检查参数。",
  status: "状态更新失败，请检查参数。",
  "self-role": "不能把自己的角色降级为非管理员。",
  "self-status": "不能把自己的账号设为非激活状态。",
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdminUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const users = await prisma.user.findMany({
    include: { player: true, sessions: true },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
  });

  return (
    <SiteShell>
      <div className="section-grid">
        <PageHero
          eyebrow="Admin"
          title="用户管理后台"
          description="在这里可以看到账号、角色、状态、会话数量和绑定的玩家身份，并执行基础的角色和状态管理。"
          actions={<Link href="/account" className="btn-secondary">返回账户中心</Link>}
        />

        {resolvedSearchParams?.updated ? (
          <SurfaceCard className="p-4 text-sm text-accentSecondary">
            已更新用户{resolvedSearchParams.updated === "role" ? "角色" : "状态"}。
          </SurfaceCard>
        ) : null}
        {resolvedSearchParams?.error ? (
          <SurfaceCard className="p-4 text-sm text-amber-200">
            {adminErrorMessages[resolvedSearchParams.error] ?? "更新失败，请重试。"}
          </SurfaceCard>
        ) : null}

        <section className="space-y-4">
          {users.map((user) => (
            <SurfaceCard key={user.id} className="p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-100">{user.name ?? user.email}</p>
                  <p className="mt-1 text-sm text-muted">{user.email}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    绑定玩家：{user.player?.name ?? "未绑定"} · 会话数：{user.sessions.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="role" defaultValue={user.role} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100">
                      {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <button className="btn-secondary px-3 py-2">更新角色</button>
                  </form>
                  <form action={updateUserStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="status" defaultValue={user.status} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100">
                      {Object.values(UserStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button className="btn-secondary px-3 py-2">更新状态</button>
                  </form>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
