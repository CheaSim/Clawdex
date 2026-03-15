import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { MatchListing } from "@/data/product-data";
import { runPluginLabSelfTest } from "@/lib/plugin-lab-selftest";

const preview = {
  winnerReward: "winner",
  loserPenalty: "loser",
  platformReturn: "platform",
  exposureBonus: "exposure",
};

function createChallenge(id: string): MatchListing {
  return {
    id,
    mode: "public-arena",
    challengerSlug: "challenger-slug",
    defenderSlug: "defender-slug",
    stake: 20,
    rewardPool: 40,
    scheduledFor: "即刻开战",
    visibility: "public",
    status: "pending",
    storyline: "storyline",
    createdAt: "2026-03-15T13:00:00.000Z",
    preview,
  };
}

describe("plugin lab self-test orchestration", () => {
  test("runs quick mode without mutating battle state", async () => {
    const calls: string[] = [];

    const result = await runPluginLabSelfTest(
      {
        getStatus: async () => {
          calls.push("status");
          return {
            ok: true,
            channel: "clawdex-channel",
            authMode: "open",
            stats: { players: 6, challenges: 5, readyPlayers: 6 },
          };
        },
        getDiscovery: async (origin) => {
          calls.push(`discovery:${origin}`);
          return {
            ok: true,
            channel: "clawdex-channel",
            authMode: "open",
            homepage: origin,
            routes: { openClawSetup: `${origin}/openclaw`, challenges: `${origin}/challenge` },
            recommendedFlow: ["discover", "create-pk"],
          };
        },
        provisionAccount: async () => {
          calls.push("provision");
          throw new Error("quick mode should not provision accounts");
        },
        getReadiness: async () => {
          calls.push("readiness");
          throw new Error("quick mode should not check readiness");
        },
        createChallenge: async () => {
          calls.push("create");
          throw new Error("quick mode should not create a challenge");
        },
        acceptChallenge: async () => {
          calls.push("accept");
          throw new Error("quick mode should not accept a challenge");
        },
        settleChallenge: async () => {
          calls.push("settle");
          throw new Error("quick mode should not settle a challenge");
        },
        getCredit: async () => {
          calls.push("credit");
          throw new Error("quick mode should not resolve credits");
        },
        now: () => 1700000000000,
      },
      { origin: "http://127.0.0.1", mode: "quick" },
    );

    assert.equal(result.mode, "quick");
    assert.deepEqual(calls, ["status", "discovery:http://127.0.0.1"]);
    assert.equal(result.status.stats.readyPlayers, 6);
    assert.deepEqual(result.discovery.recommendedFlow, ["discover", "create-pk"]);
  });

  test("runs full mode and returns structured links and winner summary", async () => {
    const calls: string[] = [];
    const settledChallenge: MatchListing = {
      ...createChallenge("challenge-001"),
      status: "settlement",
      settledAt: "2026-03-15T13:10:00.000Z",
      winnerSlug: "defender-slug",
      settlementSummary: "defender wins",
    };

    const result = await runPluginLabSelfTest(
      {
        getStatus: async () => {
          calls.push("status");
          return {
            ok: true,
            channel: "clawdex-channel",
            authMode: "open",
            stats: { players: 6, challenges: 5, readyPlayers: 6 },
          };
        },
        getDiscovery: async () => {
          calls.push("discovery");
          return {
            ok: true,
            channel: "clawdex-channel",
            authMode: "open",
            homepage: "http://127.0.0.1",
            routes: { openClawSetup: "http://127.0.0.1/openclaw", challenges: "http://127.0.0.1/challenge" },
            recommendedFlow: ["discover", "install-plugin", "create-pk"],
          };
        },
        provisionAccount: async ({ name }) => {
          calls.push(`provision:${name}`);
          return {
            player: {
              slug: name.includes("Challenger") ? "challenger-slug" : "defender-slug",
              name,
            },
          };
        },
        getReadiness: async (playerSlug) => {
          calls.push(`readiness:${playerSlug}`);
          return { playerSlug, ready: true };
        },
        createChallenge: async (payload) => {
          calls.push(`create:${payload.challengerSlug}->${payload.defenderSlug}`);
          return { challenge: createChallenge("challenge-001") };
        },
        acceptChallenge: async (challengeId) => {
          calls.push(`accept:${challengeId}`);
          return { challenge: { ...createChallenge(challengeId), status: "accepted", acceptedAt: "2026-03-15T13:05:00.000Z" } };
        },
        settleChallenge: async (challengeId, payload) => {
          calls.push(`settle:${challengeId}:${payload.winnerSlug}`);
          return settledChallenge;
        },
        getCredit: async ({ playerSlug }) => {
          calls.push(`credit:${playerSlug}`);
          return { player: { slug: playerSlug, clawPoints: playerSlug === "challenger-slug" ? 100 : 132 } };
        },
        now: () => 1710500000123,
      },
      {
        origin: "http://127.0.0.1",
        mode: "full",
        stake: 20,
        settleWinner: "defender",
        battleMode: "public-arena",
      },
    );

    assert.equal(result.mode, "full");
    assert.equal(result.summary.challengeId, "challenge-001");
    assert.equal(result.summary.winnerSlug, "defender-slug");
    assert.equal(result.links.replay, "http://127.0.0.1/replay/challenge-001");
    assert.equal(result.links.challengerPlayer, "http://127.0.0.1/players/challenger-slug");
    assert.deepEqual(calls, [
      "status",
      "discovery",
      "provision:Plugin Lab Challenger 0123",
      "provision:Plugin Lab Defender 0123",
      "readiness:challenger-slug",
      "readiness:defender-slug",
      "create:challenger-slug->defender-slug",
      "accept:challenge-001",
      "settle:challenge-001:defender-slug",
      "credit:challenger-slug",
      "credit:defender-slug",
    ]);
  });
});
