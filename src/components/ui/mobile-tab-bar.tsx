import Link from "next/link";

import { navItems } from "@/data/site-content";

const mobileItems = navItems.filter((item) => ["/", "/watch", "/challenge", "/replay", "/rankings"].includes(item.href));

export function MobileTabBar() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
      <div className="glass-panel grid grid-cols-5 gap-1 rounded-[1.6rem] px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1rem] px-2 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10 hover:text-[#ffb9a9]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
