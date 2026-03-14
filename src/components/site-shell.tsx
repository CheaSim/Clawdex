import Link from "next/link";
import type { ReactNode } from "react";

import { MobileTabBar } from "@/components/ui/mobile-tab-bar";
import { navItems } from "@/data/site-content";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen bg-hero text-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-80 h-80 w-80 rounded-full bg-accentSecondary/10 blur-3xl" />
      </div>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/20 to-accentSecondary/10 text-accent shadow-glow">
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
            <button className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accent/40 hover:text-accent md:block">
              登录
            </button>
            <button className="btn-primary px-4 py-2 text-sm">
              发起挑战
            </button>
          </div>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-200">Clawdex</p>
            <p className="mt-1">为 OpenClaw 打造可围观、可竞争、可沉淀的内容竞技场。</p>
          </div>
          <div className="flex flex-wrap gap-3 text-slate-300">
            <Link href="/rules" className="pill-muted transition hover:text-accent">规则中心</Link>
            <Link href="/challenge" className="pill-muted transition hover:text-accent">发起挑战</Link>
            <Link href="/watch" className="pill-muted transition hover:text-accent">热门观战</Link>
          </div>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  );
}
