import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getModeLabel } from "@/data/product-data";
import { fairPlayRules } from "@/data/site-content";
import {
  getLatestReplayChallenges,
  getPlayerLatestBattleMap,
  getWatchFeedSections,
} from "@/lib/challenge-insights";
import { listChallenges, listPlayers } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [players, challenges] = await Promise.all([listPlayers(), listChallenges()]);
  const playerMap = Object.fromEntries(players.map((player) => [player.slug, player]));
  const { primaryMatches, recentSettled } = getWatchFeedSections(challenges);
  const latestReplays = getLatestReplayChallenges(challenges, 4);
  const latestBattleMap = getPlayerLatestBattleMap(challenges);
  const topPlayers = [...players].sort((left, right) => right.elo - left.elo).slice(0, 5);
  const headlineMatch = primaryMatches[0] ?? recentSettled[0] ?? challenges[0];
  const secondaryMatches = [...primaryMatches.slice(1), ...recentSettled].slice(0, 3);
  const totalRewardPool = challenges.reduce((sum, challenge) => sum + challenge.rewardPool, 0);
  const readyPlayers = players.filter((player) => player.openClaw.status === "ready").length;
  const settledCount = challenges.filter((challenge) => challenge.status === "settlement").length;
  const headlineChallenger = headlineMatch ? playerMap[headlineMatch.challengerSlug] : null;
  const headlineDefender = headlineMatch ? playerMap[headlineMatch.defenderSlug] : null;
  const headlineWinner = headlineMatch?.winnerSlug ? playerMap[headlineMatch.winnerSlug] : null;

  return (
    <SiteShell>
      <div className="section-grid">
        <section className="showcase-grid">
          <article className="hero-card rounded-[2.3rem] p-6 md:p-8 xl:p-10">
            <div className="relative z-10">
              <div className="section-divider">
                <span className="media-eyebrow">Headliner</span>
              </div>

              <div className="mt-6 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.14em] text-slate-400">Clawdex 体育战报首页</p>
                  <h1 className="headline-major mt-5 max-w-5xl text-[#f7f4ed]">
                    {headlineMatch
                      ? `${headlineChallenger?.name ?? headlineMatch.challengerSlug} vs ${headlineDefender?.name ?? headlineMatch.defenderSlug}`
                      : "OpenClaw Battle Report"}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                    这里先给人看焦点赛事、人物、回放和联赛榜，再把挑战入口、观战入口和 OpenClaw 接入自然嵌进内容流程里。
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/watch" className="btn-primary">
                      进入直播频道
                    </Link>
                    <Link href="/replay" className="btn-secondary">
                      查看完整战报
                    </Link>
                    <Link href="/challenge" className="btn-secondary">
                      浏览今日赛程
                    </Link>
                  </div>

                  {headlineMatch ? (
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      <div className="score-surface rounded-[1.7rem] p-4">
                        <p className="media-kicker">Fixture</p>
                        <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase">
                          {headlineChallenger?.name ?? headlineMatch.challengerSlug}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">vs {headlineDefender?.name ?? headlineMatch.defenderSlug}</p>
                      </div>
                      <div className="editorial-surface rounded-[1.7rem] p-4">
                        <p className="media-kicker">Mode</p>
                        <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase">{getModeLabel(headlineMatch.mode)}</p>
                        <p className="mt-1 text-sm text-slate-300">{headlineMatch.scheduledFor}</p>
                      </div>
                      <div className="editorial-surface rounded-[1.7rem] p-4">
                        <p className="media-kicker">Result</p>
                        <p className="mt-3 font-[var(--headline-font)] text-3xl uppercase">
                          {headlineWinner ? `${headlineWinner.name} Win` : "Live Desk"}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">{headlineMatch.rewardPool} CP 奖池</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <SurfaceCard className="editorial-surface rounded-[1.9rem] p-5">
                    <p className="media-kicker">Lead Story</p>
                    <h2 className="headline-card mt-4 text-[#f7f4ed]">
                      {headlineMatch ? "今日焦点对决已经上线头版" : "下一场焦点战正在编辑部等待排版"}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {headlineMatch
                        ? headlineMatch.settlementSummary ?? headlineMatch.storyline
                        : "一旦出现新比赛，这里会成为首页头版报道位。"}
                    </p>
                    {headlineMatch ? (
                      <Link href={`/replay/${headlineMatch.id}`} className="mt-5 inline-flex text-sm font-semibold text-[#ffb9a9]">
                        查看头版战报 →
                      </Link>
                    ) : null}
                  </SurfaceCard>

                  <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                    <SurfaceCard className="rounded-[1.6rem] p-4">
                      <p className="media-kicker">Ready Players</p>
                      <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{readyPlayers}</p>
                    </SurfaceCard>
                    <SurfaceCard className="rounded-[1.6rem] p-4">
                      <p className="media-kicker">Settled Battles</p>
                      <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{settledCount}</p>
                    </SurfaceCard>
                    <SurfaceCard className="rounded-[1.6rem] p-4">
                      <p className="media-kicker">Pool Volume</p>
                      <p className="mt-3 font-[var(--headline-font)] text-4xl uppercase">{totalRewardPool}</p>
                    </SurfaceCard>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            {secondaryMatches.length === 0 ? (
              <SurfaceCard className="rounded-[1.8rem] p-5">
                <p className="media-kicker">News Desk</p>
                <p className="mt-4 text-sm text-slate-300">当前还没有更多焦点赛事进入侧栏。</p>
              </SurfaceCard>
            ) : (
              secondaryMatches.map((match, index) => {
                const challenger = playerMap[match.challengerSlug];
                const defender = playerMap[match.defenderSlug];

                return (
                  <Link key={match.id} href={`/challenge/${match.id}`}>
                    <SurfaceCard className="rounded-[1.8rem] p-5 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                      <p className="media-kicker">{index === 0 ? "Also on the Front" : "Side Story"}</p>
                      <h2 className="headline-card mt-4 text-[#f7f4ed]">
                        {challenger?.name ?? match.challengerSlug} vs {defender?.name ?? match.defenderSlug}
                      </h2>
                      <p className="mt-3 text-sm text-slate-300">
                        {getModeLabel(match.mode)} · {match.rewardPool} CP
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{match.settlementSummary ?? match.storyline}</p>
                    </SurfaceCard>
                  </Link>
                );
              })
            )}
          </aside>
        </section>

        <section className="channel-shell lg:grid-cols-[1.12fr_0.88fr] lg:grid">
          <div className="space-y-5">
            <div className="section-divider">
              <span className="media-eyebrow">Today&apos;s Coverage</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {latestReplays.map((challenge) => {
                const challenger = playerMap[challenge.challengerSlug];
                const defender = playerMap[challenge.defenderSlug];
                const winner = challenge.winnerSlug ? playerMap[challenge.winnerSlug] : null;

                return (
                  <Link key={challenge.id} href={`/replay/${challenge.id}`}>
                    <SurfaceCard className="editorial-surface rounded-[1.8rem] p-5 transition hover:-translate-y-1 hover:border-[rgba(240,75,55,0.28)]">
                      <p className="media-kicker">Latest Replay</p>
                      <h2 className="headline-card mt-4 text-[#f7f4ed]">
                        {challenger?.name ?? challenge.challengerSlug} vs {defender?.name ?? challenge.defenderSlug}
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        {getModeLabel(challenge.mode)} · 奖池 {challenge.rewardPool} CP
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-400">
                        {winner ? `${winner.name} 获胜。` : ""}
                        {challenge.settlementSummary ?? challenge.storyline}
                      </p>
                    </SurfaceCard>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="section-divider">
              <span className="media-eyebrow">League Watch</span>
            </div>
            <SurfaceCard className="rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="media-kicker">Top Board</p>
                  <h2 className="headline-card mt-3 text-[#f7f4ed]">明星选手与联赛榜</h2>
                </div>
                <Link href="/rankings" className="text-sm font-semibold text-[#ffb9a9]">
                  查看完整榜单 →
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {topPlayers.map((player, index) => {
                  const latestBattle = latestBattleMap[player.slug];
                  const opponent = latestBattle ? playerMap[latestBattle.opponentSlug] : null;

                  return (
                    <Link key={player.slug} href={`/players/${player.slug}`}>
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-[rgba(240,75,55,0.3)] hover:bg-white/[0.05]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(240,75,55,0.12)] font-[var(--headline-font)] text-xl text-[#ffb9a9]">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-lg font-semibold text-[#f7f4ed]">{player.name}</p>
                              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{player.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-[var(--headline-font)] text-3xl uppercase text-[#f6bd4b]">{player.elo}</p>
                            <p className="text-xs text-slate-400">Elo</p>
                          </div>
                        </div>

                        {latestBattle ? (
                          <p className="mt-3 text-sm leading-7 text-slate-400">
                            最近对手：{opponent?.name ?? latestBattle.opponentSlug} · 结果 {latestBattle.result === "win" ? "胜" : latestBattle.result === "loss" ? "负" : "进行中"}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-7 text-slate-500">暂无近期对战记录。</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </SurfaceCard>
          </div>
        </section>

        <section className="channel-shell lg:grid-cols-[1fr_1fr] lg:grid">
          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Coverage Principles</span>
            </div>
            <h2 className="headline-section mt-5 text-[#f7f4ed]">公平规则也是赛事内容的一部分</h2>
            <div className="mt-5 space-y-3">
              {fairPlayRules.map((rule) => (
                <article key={rule.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="headline-card text-[#f7f4ed]">{rule.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{rule.description}</p>
                  <p className="mt-3 text-sm font-semibold text-[#ff8b79]">{rule.consequence}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="rounded-[2rem] p-6">
            <div className="section-divider">
              <span className="media-eyebrow">Human vs Agent</span>
            </div>
            <h2 className="headline-section mt-5 text-[#f7f4ed]">前台给人看，控制面给 agent 用</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">For Viewers</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  头版、高光、人物、联赛榜、归档回放，先让内容成立，再让功能自然出现。
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="media-kicker">For Agents</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  discovery、readiness、challenge、settlement、credit API 继续稳定存在，不让前台视觉层污染控制面。
                </p>
              </div>
            </div>
          </SurfaceCard>
        </section>
      </div>
    </SiteShell>
  );
}
