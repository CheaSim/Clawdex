import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { MatchListing } from "@/data/product-data";
import {
  getAdjacentChallenges,
  getLatestReplayChallenges,
  getPlayerBattleHistory,
  getPlayerLatestBattleMap,
  getWatchFeedSections,
} from "@/lib/challenge-insights";

const preview = {
  winnerReward: "winner",
  loserPenalty: "loser",
  platformReturn: "platform",
  exposureBonus: "exposure",
};

const challenges: MatchListing[] = [
  {
    id: "accepted-1",
    mode: "public-arena",
    challengerSlug: "alpha",
    defenderSlug: "beta",
    stake: 20,
    rewardPool: 40,
    scheduledFor: "2026-03-15 10:00",
    visibility: "public",
    status: "accepted",
    storyline: "accepted battle",
    createdAt: "2026-03-15T09:00:00.000Z",
    acceptedAt: "2026-03-15T10:00:00.000Z",
    preview,
  },
  {
    id: "live-1",
    mode: "rivalry",
    challengerSlug: "gamma",
    defenderSlug: "alpha",
    stake: 25,
    rewardPool: 50,
    scheduledFor: "2026-03-15 11:00",
    visibility: "public",
    status: "live",
    storyline: "live battle",
    createdAt: "2026-03-15T10:20:00.000Z",
    acceptedAt: "2026-03-15T11:00:00.000Z",
    preview,
  },
  {
    id: "settled-1",
    mode: "ranked-1v1",
    challengerSlug: "alpha",
    defenderSlug: "gamma",
    stake: 15,
    rewardPool: 30,
    scheduledFor: "2026-03-15 09:00",
    visibility: "followers",
    status: "settlement",
    storyline: "settled battle one",
    createdAt: "2026-03-15T08:30:00.000Z",
    acceptedAt: "2026-03-15T08:40:00.000Z",
    settledAt: "2026-03-15T09:00:00.000Z",
    winnerSlug: "gamma",
    settlementSummary: "gamma wins",
    preview,
  },
  {
    id: "settled-2",
    mode: "public-arena",
    challengerSlug: "beta",
    defenderSlug: "alpha",
    stake: 30,
    rewardPool: 60,
    scheduledFor: "2026-03-15 12:00",
    visibility: "public",
    status: "settlement",
    storyline: "settled battle two",
    createdAt: "2026-03-15T11:10:00.000Z",
    acceptedAt: "2026-03-15T11:20:00.000Z",
    settledAt: "2026-03-15T12:00:00.000Z",
    winnerSlug: "alpha",
    settlementSummary: "alpha wins",
    preview,
  },
  {
    id: "pending-1",
    mode: "rivalry",
    challengerSlug: "delta",
    defenderSlug: "gamma",
    stake: 18,
    rewardPool: 18,
    scheduledFor: "2026-03-15 08:00",
    visibility: "public",
    status: "pending",
    storyline: "pending battle",
    createdAt: "2026-03-15T08:00:00.000Z",
    preview,
  },
];

describe("challenge insights", () => {
  test("keeps settled matches out of the watch primary feed", () => {
    const result = getWatchFeedSections(challenges);

    assert.deepEqual(
      result.primaryMatches.map((challenge) => challenge.id),
      ["live-1", "accepted-1"],
    );
    assert.deepEqual(
      result.recentSettled.map((challenge) => challenge.id),
      ["settled-2", "settled-1"],
    );
  });

  test("builds player battle history with opponent, result, and destination", () => {
    const history = getPlayerBattleHistory(challenges, "alpha");

    assert.deepEqual(
      history.map((entry) => ({
        challengeId: entry.challenge.id,
        opponentSlug: entry.opponentSlug,
        result: entry.result,
        href: entry.href,
      })),
      [
        { challengeId: "settled-2", opponentSlug: "beta", result: "win", href: "/replay/settled-2" },
        { challengeId: "live-1", opponentSlug: "gamma", result: "in-progress", href: "/challenge/live-1" },
        { challengeId: "accepted-1", opponentSlug: "beta", result: "in-progress", href: "/challenge/accepted-1" },
        { challengeId: "settled-1", opponentSlug: "gamma", result: "loss", href: "/replay/settled-1" },
      ],
    );
  });

  test("finds previous and next challenges by descending activity time", () => {
    const adjacent = getAdjacentChallenges(challenges, "accepted-1");

    assert.equal(adjacent.previous?.id, "live-1");
    assert.equal(adjacent.next?.id, "settled-1");
  });

  test("returns only the latest settled replays", () => {
    const latestReplays = getLatestReplayChallenges(challenges, 2);

    assert.deepEqual(
      latestReplays.map((challenge) => challenge.id),
      ["settled-2", "settled-1"],
    );
  });

  test("tracks the latest battle summary for each player", () => {
    const latestBattleMap = getPlayerLatestBattleMap(challenges);

    assert.deepEqual(latestBattleMap.alpha, {
      challengeId: "settled-2",
      href: "/replay/settled-2",
      opponentSlug: "beta",
      result: "win",
      status: "settlement",
    });
    assert.deepEqual(latestBattleMap.gamma, {
      challengeId: "live-1",
      href: "/challenge/live-1",
      opponentSlug: "alpha",
      result: "in-progress",
      status: "live",
    });
  });
});
