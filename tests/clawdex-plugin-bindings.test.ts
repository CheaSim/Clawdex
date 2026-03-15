import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveAgentIdByBindings } from "../clawdex-openclaw-channel/plugin";

describe("clawdex plugin binding resolution", () => {
  test("prefers an exact binding over the fallback agent", () => {
    const agentId = resolveAgentIdByBindings(
      {
        channels: {
          "clawdex-channel": {
            defaultAgentId: "fallback-agent",
          },
        },
        bindings: [
          {
            agentId: "arena-agent",
            match: {
              channel: "clawdex-channel",
              mode: "public-arena",
            },
          },
        ],
      },
      { mode: "public-arena" },
    );

    assert.equal(agentId, "arena-agent");
  });

  test("allows wildcard bindings to match when no exact mode is required", () => {
    const agentId = resolveAgentIdByBindings(
      {
        bindings: [
          {
            agentId: "wildcard-agent",
            match: {
              channel: "clawdex-channel",
              mode: "*",
            },
          },
        ],
      },
      { mode: "rivalry" },
    );

    assert.equal(agentId, "wildcard-agent");
  });

  test("uses configured defaultAgentId when no binding matches", () => {
    const agentId = resolveAgentIdByBindings(
      {
        channels: {
          "clawdex-channel": {
            defaultAgentId: "configured-fallback",
          },
        },
        bindings: [],
      },
      { mode: "public-arena" },
    );

    assert.equal(agentId, "configured-fallback");
  });

  test("falls back to clawdex-ranked when default mode is ranked and nothing else matches", () => {
    const agentId = resolveAgentIdByBindings(
      {
        channels: {
          "clawdex-channel": {
            defaultMode: "ranked-1v1",
          },
        },
        bindings: [],
      },
      { mode: "ranked-1v1" },
    );

    assert.equal(agentId, "clawdex-ranked");
  });
});
