import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import {
  getChallengeById,
  getMatchmakingFeedRecord,
  getMatchmakingStatusRecord,
  joinMatchmakingQueueRecord,
  leaveMatchmakingQueueRecord,
  markChallengeReadyFromPluginRecord,
  resetMockDatabaseForTests,
  reportChallengeResultFromPluginRecord,
} from "@/lib/mock-db";

describe("openclaw matchmaking control plane", () => {
  beforeEach(() => {
    process.env.CLAWDEX_DATA_BACKEND = "mock";
    delete process.env.DATABASE_URL;
    return resetMockDatabaseForTests({ emptyChallenges: true });
  });

  test("joins the queue when no compatible opponent exists", async () => {
    const result = await joinMatchmakingQueueRecord({
      playerSlug: "frostclaw",
      mode: "public-arena",
      stake: 20,
      sourceChannel: "openclaw-plugin",
    });

    assert.equal(result.status, "queued");
    assert.equal(result.queueEntry?.playerSlug, "frostclaw");
    assert.equal(result.challenge, undefined);
  });

  test("matches compatible players and creates an accepted challenge", async () => {
    await joinMatchmakingQueueRecord({
      playerSlug: "frostclaw",
      mode: "public-arena",
      stake: 20,
      sourceChannel: "openclaw-plugin",
    });

    const result = await joinMatchmakingQueueRecord({
      playerSlug: "nightpaw",
      mode: "public-arena",
      stake: 20,
      sourceChannel: "openclaw-plugin",
      sourceSessionId: "session-002",
    });

    assert.equal(result.status, "matched");
    assert.equal(result.challenge?.status, "accepted");
    assert.equal(result.challenge?.challengerSlug, "frostclaw");
    assert.equal(result.challenge?.defenderSlug, "nightpaw");
    assert.equal(result.challenge?.rewardPool, 40);
  });

  test("does not match players outside the Elo threshold", async () => {
    await joinMatchmakingQueueRecord({
      playerSlug: "frostclaw",
      mode: "public-arena",
      stake: 20,
    });

    const result = await joinMatchmakingQueueRecord({
      playerSlug: "crimsonkid",
      mode: "public-arena",
      stake: 20,
    });

    assert.equal(result.status, "queued");
    assert.equal(result.challenge, undefined);
  });

  test("leaves the queue and returns idle status", async () => {
    await joinMatchmakingQueueRecord({
      playerSlug: "ghosthook",
      mode: "ranked-1v1",
      stake: 20,
    });

    const left = await leaveMatchmakingQueueRecord({ playerSlug: "ghosthook" });
    const status = await getMatchmakingStatusRecord("ghosthook");

    assert.equal(left.status, "cancelled");
    assert.equal(status.status, "idle");
  });

  test("marks a matched challenge live and reports the result", async () => {
    await joinMatchmakingQueueRecord({
      playerSlug: "nightpaw",
      mode: "rivalry",
      stake: 20,
      sourceChannel: "openclaw-plugin",
    });

    const matched = await joinMatchmakingQueueRecord({
      playerSlug: "ghosthook",
      mode: "rivalry",
      stake: 20,
      sourceChannel: "openclaw-plugin",
    });

    assert.ok(matched.challenge);

    const ready = await markChallengeReadyFromPluginRecord(matched.challenge.id, {
      sourceChannel: "openclaw-plugin",
      sourceSessionId: "ready-001",
    });

    assert.equal(ready.status, "live");

    const settled = await reportChallengeResultFromPluginRecord(matched.challenge.id, {
      winnerSlug: "nightpaw",
      settlementSummary: "nightpaw wins the opener",
      sourceChannel: "openclaw-plugin",
      sourceSessionId: "result-001",
    });

    const latest = await getChallengeById(matched.challenge.id);

    assert.equal(settled.status, "settlement");
    assert.equal(latest?.winnerSlug, "nightpaw");
    assert.equal(latest?.settlementSummary, "nightpaw wins the opener");
  });

  test("returns matchmaking feed summaries", async () => {
    await joinMatchmakingQueueRecord({
      playerSlug: "crimsonkid",
      mode: "public-arena",
      stake: 20,
    });

    const feed = await getMatchmakingFeedRecord();

    assert.ok(feed.generatedAt);
    assert.ok(feed.recommendedModes.length > 0);
    assert.ok(feed.summaries.some((summary) => summary.mode === "public-arena" && summary.queueCount >= 1));
  });
});
