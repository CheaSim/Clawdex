import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { CreateDebatePayload } from "@/data/product-data";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";
import { createDebate, listDebates } from "@/lib/mock-db";

/**
 * GET /api/openclaw/plugin/debates
 * 获取所有辩论列表
 */
export async function GET(request: Request) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  try {
    const debates = await listDebates();
    return NextResponse.json({ ok: true, debates });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取辩论列表失败" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/openclaw/plugin/debates
 * 创建一场辩论（必须先有一个 Challenge）
 *
 * Body: CreateDebatePayload
 */
export async function POST(request: Request) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as Partial<CreateDebatePayload>;

    if (!payload.challengeId) {
      return NextResponse.json({ message: "challengeId 是必填项" }, { status: 400 });
    }
    if (!payload.topicId) {
      return NextResponse.json({ message: "topicId 是必填项" }, { status: 400 });
    }
    if (!payload.sideAPlayerSlug || !payload.sideBPlayerSlug) {
      return NextResponse.json({ message: "双方选手 slug 是必填项" }, { status: 400 });
    }

    const debate = await createDebate(payload as CreateDebatePayload);

    revalidatePath("/debate");
    revalidatePath(`/debate/${debate.id}`);

    return NextResponse.json({
      ok: true,
      debate,
      message: "辩论已创建，等待启动",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "创建辩论失败" },
      { status: 400 },
    );
  }
}
