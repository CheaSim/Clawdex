import Link from "next/link";
import type { ReactNode } from "react";

import { navItems } from "@/data/site-content";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-hero text-ink">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent">
              OC
            </span>
            <div>
              <p>Clawdex</p>
              <p className="text-xs font-normal text-muted">OpenClaw 内容竞技场</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-accent">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accent/40 hover:text-accent">
              登录
            </button>
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white">
              发起挑战
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
