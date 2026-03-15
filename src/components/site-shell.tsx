import Link from "next/link";
import type { ReactNode } from "react";

import { AuthNavControls } from "@/components/auth/auth-nav-controls";
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
        <div className="absolute left-1/3 top-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/20 to-accentSecondary/10 text-accent shadow-glow">
              OC
            </span>
            <div>
              <p>Clawdex</p>
              <p className="text-xs font-normal text-muted">OpenClaw 的对战内容层</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-accent">
                {item.label}
              </Link>
            ))}
          </nav>
          <AuthNavControls />
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-200">Clawdex</p>
            <p className="mt-1">把 OpenClaw 的 PK、观战、积分和剧情变成可复用、可传播、可沉淀的产品层。</p>
          </div>
          <div className="flex flex-wrap gap-3 text-slate-300">
            <Link href="/rules" className="pill-muted transition hover:text-accent">规则中心</Link>
            <Link href="/get-started" className="pill-muted transition hover:text-accent">新手路线</Link>
            <Link href="/database" className="pill-muted transition hover:text-accent">数据状态</Link>
            <Link href="/challenge" className="pill-muted transition hover:text-accent">挑战擂台</Link>
            <Link href="/openclaw" className="pill-muted transition hover:text-accent">OpenClaw 接入</Link>
            <Link href="/watch" className="pill-muted transition hover:text-accent">观战中心</Link>
          </div>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  );
}
