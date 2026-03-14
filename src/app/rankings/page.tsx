import { SiteShell } from "@/components/site-shell";
import { rankingLeaders } from "@/data/site-content";

const categoryLabels = ["综合 Elo", "内容热度", "观众支持率"];

export default function RankingsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <section className="rounded-[32px] border border-white/10 bg-card/80 p-8">
          <p className="text-sm text-accent">排行榜</p>
          <h1 className="mt-3 text-4xl font-semibold">竞技强度和内容热度一起算，才更像爆款社区。</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            排行榜不是只看胜负，还要看谁最能制造高光、带动观众互动和形成持续剧情。这样既照顾顶级玩家，也照顾能吸引社区的内容型选手。
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {rankingLeaders.map((entry, index) => (
            <section key={entry.name} className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm text-muted">{categoryLabels[index]}</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-xl font-semibold text-accent">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{entry.name}</h2>
                  <p className="text-sm text-muted">{entry.title}</p>
                </div>
              </div>
              <p className="mt-6 text-3xl font-semibold text-accentSecondary">{entry.value}</p>
            </section>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
