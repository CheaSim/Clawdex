import { timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

export function getConfiguredPluginToken() {
  const token = process.env.CLAWDEX_PLUGIN_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

export function getPluginAuthMode() {
  return getConfiguredPluginToken() ? "token" : "open";
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(a, "utf-8"), Buffer.from(b, "utf-8"));
}

export function assertPluginAuthorized(request: Request) {
  const configuredToken = getConfiguredPluginToken();

  if (!configuredToken) {
    return null;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${configuredToken}`;

  if (!safeEqual(authorization, expected)) {
    return NextResponse.json({ message: "Unauthorized plugin request" }, { status: 401 });
  }

  return null;
}
