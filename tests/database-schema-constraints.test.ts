import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

describe("database schema constraints", () => {
  test("prevents duplicate spectator votes per challenge, voter, and vote type", () => {
    assert.match(schema, /model SpectatorVote[\s\S]*@@unique\(\[challengeId, voterId, voteType\]\)/);
  });

  test("stores challenge winner as a real player relation", () => {
    assert.match(schema, /winnerPlayerId\s+String\?/);
    assert.match(schema, /winner\s+Player\?\s+@relation\("ChallengeWinner", fields: \[winnerPlayerId\], references: \[id\]/);
  });

  test("links debate rounds to player records", () => {
    assert.match(schema, /model DebateRound[\s\S]*playerId\s+String[\s\S]*player\s+Player\s+@relation\(/);
  });

  test("enforces one active matchmaking queue key per player", () => {
    assert.match(schema, /model MatchmakingQueueEntry[\s\S]*activeKey\s+String\?\s+@unique/);
  });
});
