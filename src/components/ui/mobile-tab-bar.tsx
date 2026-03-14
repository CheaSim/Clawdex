import Link from "next/link";

import { navItems } from "@/data/site-content";

export function MobileTabBar() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
      <div className="glass-panel flex items-center justify-between rounded-full px-3 py-2 shadow-glow">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10 hover:text-accent">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
