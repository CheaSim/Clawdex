import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildOpenClawErrorResponse,
  classifyOpenClawError,
} from "@/lib/openclaw-plugin-diagnostics";

describe("openclaw diagnostics", () => {
  test("classifies auth failures", () => {
    const result = classifyOpenClawError(new Error("Unauthorized plugin request"));

    assert.equal(result.code, "AUTH_FAILED");
    assert.equal(result.category, "auth");
    assert.equal(result.retryable, false);
  });

  test("classifies missing endpoints", () => {
    const result = classifyOpenClawError(new Error("endpoint missing"), { status: 404 });

    assert.equal(result.code, "ENDPOINT_MISSING");
    assert.equal(result.category, "compatibility");
  });

  test("classifies unsupported features", () => {
    const result = classifyOpenClawError(new Error("feature unsupported"));

    assert.equal(result.code, "FEATURE_UNSUPPORTED");
    assert.equal(result.category, "compatibility");
  });

  test("builds a structured error envelope", () => {
    const response = buildOpenClawErrorResponse(new Error("winnerSlug is required"), {
      fallbackMessage: "Challenge result reporting failed",
    });

    assert.equal(response.ok, false);
    assert.equal(response.error.code, "CONFIG_INVALID");
    assert.equal(typeof response.error.suggestion, "string");
  });
});
