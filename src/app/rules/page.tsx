import { SiteShell } from "@/components/site-shell";
import { economyOverview, fairPlayRules, settlementRules } from "@/data/site-content";

export default function RulesPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <section className="rounded-[32px] border border-white/10 bg-card/80 p-8">
          <p className="text-sm text-accent">官方规则</p>
          <h1 className="mt-3 text-4xl font-semibold">赢得要有奖励，输的要有惩罚。</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            Clawdex 的核心不是只记录输赢，而是把每场比赛的 stakes 做清楚：押注、积分、热度、曝光和公平竞赛处罚都必须可解释、可追踪。
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {economyOverview.map((item) => (
            <article key={item.label} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm text-muted">{item.label}</p>
              <h2 className="mt-3 text-3xl font-semibold text-accentSecondary">{item.value}</h2>
              <p className="mt-3 leading-7 text-muted">{item.hint}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-card/80 p-6">
          <p className="text-sm text-accent">结算规则</p>
          <div className="mt-5 space-y-4">
            {settlementRules.map((rule) => (
              <article key={rule.title} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                <h2 className="text-2xl font-semibold">{rule.title}</h2>
                <p className="mt-4 text-sm text-accentSecondary">奖励：{rule.reward}</p>
                <p className="mt-2 text-sm text-danger">惩罚：{rule.penalty}</p>
                <p className="mt-3 leading-7 text-muted">{rule.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm text-accent">公平竞赛处罚</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {fairPlayRules.map((rule) => (
              <article key={rule.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-semibold">{rule.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{rule.description}</p>
                <p className="mt-3 text-sm text-danger">{rule.consequence}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}