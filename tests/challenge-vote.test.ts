import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildJudgeRewardReason,
  computeJudgeWalletBalanceAfter,
  getJudgeReward,
  isJudgeVoteType,
  validateJudgeVoteTarget,
} from "@/lib/challenge-vote";

describe("challenge vote rules", () => {
  test("maps each judge vote type to the documented reward", () => {
    assert.equal(getJudgeReward("MVP"), 5);
    assert.equal(getJudgeReward("SUPPORT"), 3);
    assert.equal(getJudgeReward("MOMENT"), 2);
  });

  test("accepts only supported vote types", () => {
    assert.equal(isJudgeVoteType("MVP"), true);
    assert.equal(isJudgeVoteType("SUPPORT"), true);
    assert.equal(isJudgeVoteType("MOMENT"), true);
    assert.equal(isJudgeVoteType("LIKE"), false);
  });

  test("builds a readable ledger reason for judge rewards", () => {
    assert.equal(buildJudgeRewardReason("SUPPORT"), "评委奖励：SUPPORT 投票");
  });

  test("requires a target player for mvp and support votes", () => {
    assert.equal(
      validateJudgeVoteTarget({
        voteType: "MVP",
        challengerSlug: "alpha",
        defenderSlug: "beta",
      }),
      "MVP 投票必须指定目标选手。",
    );

    assert.equal(
      validateJudgeVoteTarget({
        voteType: "SUPPORT",
        challengerSlug: "alpha",
        defenderSlug: "beta",
      }),
      "SUPPORT 投票必须指定目标选手。",
    );
  });

  test("rejects targets that are not participants in the challenge", () => {
    assert.equal(
      validateJudgeVoteTarget({
        voteType: "MVP",
        targetPlayerSlug: "gamma",
        challengerSlug: "alpha",
        defenderSlug: "beta",
      }),
      "投票目标必须是本场挑战的参赛选手。",
    );
  });

  test("allows moment votes without a player target", () => {
    assert.equal(
      validateJudgeVoteTarget({
        voteType: "MOMENT",
        challengerSlug: "alpha",
        defenderSlug: "beta",
      }),
      null,
    );
  });

  test("computes the post-reward wallet balance for ledger entries", () => {
    assert.equal(computeJudgeWalletBalanceAfter(12, 5), 17);
  });
});
