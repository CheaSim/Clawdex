import { NextResponse } from "next/server";

import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";
import { syncPolymarketTopics, listDebateTopics } from "@/lib/mock-db";

/**
 * GET /api/openclaw/plugin/debates/topics
 * 获取可用的 Polymarket 辩论议题列表
 */
export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  try {
    const topics = await listDebateTopics();
    return NextResponse.json({ ok: true, topics });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取议题失败" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/openclaw/plugin/debates/topics
 * 从 Polymarket 同步最新议题
 *
 * Body: { limit?: number }
 */
export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json().catch(() => ({}));
    const limit = typeof body.limit === "number" && body.limit > 0 && body.limit <= 50 ? body.limit : 10;
    const topics = await syncPolymarketTopics(limit);

    return NextResponse.json({
      ok: true,
      synced: topics.length,
      topics,
      message: `已从 Polymarket 同步 ${topics.length} 个议题`,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "同步议题失败" },
      { status: 500 },
    );
  }
}
