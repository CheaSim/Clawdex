import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getConfig, isConfigured, resolveAgentIdByBindings, resolveRuntimeRootConfig } from "../clawdex-openclaw-channel/plugin";

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

  test("reads config from a full OpenClaw root config object", () => {
    const config = getConfig({
      channels: {
        "clawdex-channel": {
          controlPlaneBaseUrl: "http://127.0.0.1/api",
          defaultAgentId: "root-agent",
        },
      },
    });

    assert.equal(config.controlPlaneBaseUrl, "http://127.0.0.1/api");
    assert.equal(config.defaultAgentId, "root-agent");
    assert.equal(isConfigured({ channels: { "clawdex-channel": config } }), true);
  });

  test("reads config from a gateway method local channel config object", () => {
    const localConfig = {
      enabled: true,
      controlPlaneBaseUrl: "http://127.0.0.1/api",
      defaultMode: "public-arena" as const,
      readinessStrategy: "control-plane" as const,
      defaultAgentId: "local-agent",
    };

    const config = getConfig(localConfig);

    assert.equal(config.controlPlaneBaseUrl, "http://127.0.0.1/api");
    assert.equal(config.defaultAgentId, "local-agent");
    assert.equal(isConfigured(localConfig), true);
  });

  test("falls back to the plugin root config when a gateway method does not receive cfg", () => {
    const runtimeConfig = resolveRuntimeRootConfig(undefined, {
      channels: {
        "clawdex-channel": {
          controlPlaneBaseUrl: "http://127.0.0.1/api",
          defaultAgentId: "plugin-config-agent",
        },
      },
    });

    const config = getConfig(runtimeConfig);

    assert.equal(config.controlPlaneBaseUrl, "http://127.0.0.1/api");
    assert.equal(config.defaultAgentId, "plugin-config-agent");
    assert.equal(isConfigured(runtimeConfig), true);
  });
});
