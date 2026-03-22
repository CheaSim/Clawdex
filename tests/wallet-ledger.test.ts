import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { computeSettlementNumbers } from "@/lib/settlement";

type WalletState = {
  availableBalance: number;
  lockedBalance: number;
};

function lockChallengeStake(wallet: WalletState, stake: number) {
  return {
    availableBalance: wallet.availableBalance - stake,
    lockedBalance: wallet.lockedBalance + stake,
  };
}

function settleWinnerWallet(wallet: WalletState, stake: number, winnerClawPoints: number) {
  return {
    availableBalance: wallet.availableBalance + winnerClawPoints,
    lockedBalance: wallet.lockedBalance - stake,
  };
}

function settleLoserWallet(wallet: WalletState, stake: number) {
  return {
    availableBalance: wallet.availableBalance,
    lockedBalance: wallet.lockedBalance - stake,
  };
}

describe("wallet settlement flow", () => {
  test("locks challenger stake on challenge creation", () => {
    const result = lockChallengeStake({ availableBalance: 120, lockedBalance: 10 }, 20);

    assert.deepEqual(result, {
      availableBalance: 100,
      lockedBalance: 30,
    });
  });

  test("locks defender stake on challenge acceptance", () => {
    const result = lockChallengeStake({ availableBalance: 90, lockedBalance: 0 }, 20);

    assert.deepEqual(result, {
      availableBalance: 70,
      lockedBalance: 20,
    });
  });

  test("releases both stakes during settlement while only winner receives reward", () => {
    const nums = computeSettlementNumbers("public-arena", 20);
    const winnerWallet = settleWinnerWallet({ availableBalance: 80, lockedBalance: 20 }, 20, nums.winnerClawPoints);
    const loserWallet = settleLoserWallet({ availableBalance: 60, lockedBalance: 20 }, 20);

    assert.deepEqual(winnerWallet, {
      availableBalance: 123,
      lockedBalance: 0,
    });
    assert.deepEqual(loserWallet, {
      availableBalance: 60,
      lockedBalance: 0,
    });
  });
});
