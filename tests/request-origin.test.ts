import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolvePublicAppOrigin } from "@/lib/request-origin";

describe("request origin resolution", () => {
  test("prefers forwarded host and proto over internal request origin", () => {
    const origin = resolvePublicAppOrigin(
      new Headers({
        "x-forwarded-proto": "http",
        "x-forwarded-host": "127.0.0.1",
      }),
      "http://0.0.0.0:3000/api/openclaw/plugin-lab/selftest",
    );

    assert.equal(origin, "http://127.0.0.1");
  });

  test("falls back to APP_PUBLIC_URL when forwarded headers are absent", () => {
    const previousAppPublicUrl = process.env.APP_PUBLIC_URL;
    process.env.APP_PUBLIC_URL = "https://app.clawdex.example";

    try {
      const origin = resolvePublicAppOrigin(new Headers(), "http://0.0.0.0:3000/api/openclaw/plugin/discovery");
      assert.equal(origin, "https://app.clawdex.example");
    } finally {
      if (previousAppPublicUrl === undefined) {
        delete process.env.APP_PUBLIC_URL;
      } else {
        process.env.APP_PUBLIC_URL = previousAppPublicUrl;
      }
    }
  });

  test("falls back to request url origin when no public hints exist", () => {
    const origin = resolvePublicAppOrigin(new Headers(), "http://127.0.0.1:3000/api/openclaw/plugin/discovery");
    assert.equal(origin, "http://127.0.0.1:3000");
  });
});
