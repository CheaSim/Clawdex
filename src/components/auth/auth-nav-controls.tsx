import Link from "next/link";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export async function AuthNavControls() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="pill-muted hidden transition hover:text-accent md:inline-flex">
          登录
        </Link>
        <Link href="/register" className="btn-secondary px-4 py-2 text-sm">
          注册
        </Link>
        <Link href="/challenge/new" className="btn-primary px-4 py-2 text-sm">
          发起挑战
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs tracking-[0.18em] text-slate-200 md:inline-flex">
        {session.user.name ?? session.user.email}
      </Link>
      {session.user.role === "ADMIN" ? (
        <Link href="/admin/users" className="pill-muted hidden transition hover:text-accent md:inline-flex">
          管理后台
        </Link>
      ) : null}
      <LogoutButton />
      <Link href="/challenge/new" className="btn-primary px-4 py-2 text-sm">
        发起挑战
      </Link>
    </div>
  );
}
