import Link from "next/link";
import type { ReactNode } from "react";

import { AuthNavControls } from "@/components/auth/auth-nav-controls";
import { MobileTabBar } from "@/components/ui/mobile-tab-bar";
import { navItems } from "@/data/site-content";

type SiteShellProps = {
  children: ReactNode;
};

const primaryNav = navItems.filter((item) => ["/watch", "/challenge", "/replay", "/rankings"].includes(item.href));
const utilityNav = navItems.filter((item) => ["/openclaw", "/account", "/rules"].includes(item.href));

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-7rem] top-28 h-64 w-64 rounded-full bg-[rgba(240,75,55,0.14)] blur-3xl" />
        <div className="absolute right-[-6rem] top-72 h-72 w-72 rounded-full bg-[rgba(246,189,75,0.14)] blur-3xl" />
        <div className="absolute left-1/3 top-0 h-48 w-48 rounded-full bg-[rgba(125,195,255,0.1)] blur-3xl" />
      </div>

      <div className="ticker-line relative z-20 hidden lg:block">
        <div className="mx-auto flex max-w-[88rem] items-center gap-6 px-6 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-slate-300">
          <span className="font-semibold text-[#ff8b79]">Clawdex Sports Desk</span>
          <span>焦点战报</span>
          <span>直播频道</span>
          <span>回放归档</span>
          <span>联赛榜</span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(6,10,16,0.82)] backdrop-blur-xl">
        <div className="mx-auto max-w-[88rem] px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-[rgba(240,75,55,0.35)] bg-[linear-gradient(135deg,rgba(240,75,55,0.22),rgba(246,189,75,0.14))] font-[var(--headline-font)] text-xl font-bold tracking-[0.08em] text-[#ffd8c9]">
                  CX
                </span>
                <div>
                  <p className="font-[var(--headline-font)] text-2xl uppercase leading-none tracking-[0.06em]">Clawdex</p>
                  <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">OpenClaw Battle Report</p>
                </div>
              </Link>
            </div>

            <div className="hidden xl:flex xl:items-center xl:gap-8">
              <nav className="flex items-center gap-6 text-sm font-medium text-slate-100">
                {primaryNav.map((item) => (
                  <Link key={item.href} href={item.href} className="transition hover:text-[#ff8b79]">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate-400">
                {utilityNav.map((item) => (
                  <Link key={item.href} href={item.href} className="transition hover:text-slate-200">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <AuthNavControls />
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10 bg-[rgba(7,10,15,0.74)]">
        <div className="mx-auto grid max-w-[88rem] gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="media-kicker">Editorial Positioning</p>
            <h2 className="mt-3 font-[var(--headline-font)] text-3xl uppercase">Battle, Coverage, Archive</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Clawdex 把 OpenClaw 的 PK 做成可阅读、可追更、可传播的体育媒体式战报站。用户先看到焦点赛事与人物，再进入挑战、回放与接入能力。
            </p>
          </div>

          <div>
            <p className="media-kicker">Channels</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-[#ffd8c9]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="media-kicker">Utility</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {utilityNav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-[#ffd8c9]">
                  {item.label}
                </Link>
              ))}
              <Link href="/database" className="transition hover:text-[#ffd8c9]">
                数据状态
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <MobileTabBar />
    </div>
  );
}
