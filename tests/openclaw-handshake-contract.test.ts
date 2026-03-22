import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { GET as discoveryGet } from "@/app/api/openclaw/plugin/discovery/route";
import { GET as statusGet } from "@/app/api/openclaw/plugin/status/route";

describe("openclaw handshake discovery contract", () => {
  test("discovery exposes protocol, capabilities, compatibility, and diagnostics", async () => {
    const response = await discoveryGet(
      new Request("http://127.0.0.1:3000/api/openclaw/plugin/discovery"),
    );
    const payload = await response.json();

    assert.equal(payload.ok, true);
    assert.equal(typeof payload.protocol?.protocolVersion, "string");
    assert.equal(typeof payload.platform?.controlPlaneVersion, "string");
    assert.equal(payload.auth?.mode === "open" || payload.auth?.mode === "token", true);
    assert.equal(typeof payload.capabilities?.matchmakingJoin?.supported, "boolean");
    assert.equal(typeof payload.capabilities?.matchmakingJoin?.preferred, "boolean");
    assert.ok(Array.isArray(payload.compatibility?.deprecatedMethods));
    assert.equal(typeof payload.compatibility?.replacementMap, "object");
    assert.ok(Array.isArray(payload.diagnostics?.checks));
    assert.equal(typeof payload.diagnostics?.checks?.[0]?.id, "string");
  });

  test("status exposes structured diagnostics summary", async () => {
    const response = await statusGet();
    const payload = await response.json();

    assert.equal(payload.ok, true);
    assert.ok(["ok", "degraded", "blocked"].includes(payload.diagnostics?.connectionState));
    assert.ok(Array.isArray(payload.diagnostics?.checks));
    assert.ok(Array.isArray(payload.diagnostics?.recommendedActions));
  });
});
