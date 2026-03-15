import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";
import { getDebateById, startDebate, endDebate } from "@/lib/mock-db";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/openclaw/plugin/debates/[id]
 * 获取辩论详情（含全部回合）
 */
export async function GET(request: Request, { params }: RouteParams) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const debate = await getDebateById(id);
    if (!debate) {
      return NextResponse.json({ message: "辩论不存在" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, debate });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取辩论失败" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/openclaw/plugin/debates/[id]
 * 辩论操作：启动 / 结束
 *
 * Body: { action: "start" | "end", summary?: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === "start") {
      const debate = await startDebate(id);
      revalidatePath("/debate");
      revalidatePath(`/debate/${id}`);
      return NextResponse.json({
        ok: true,
        debate,
        message: `辩论已启动！议题: ${debate.topic?.question ?? "未知"}。正方先发言。`,
      });
    }

    if (action === "end") {
      const debate = await endDebate(id, body.summary);
      revalidatePath("/debate");
      revalidatePath(`/debate/${id}`);
      return NextResponse.json({
        ok: true,
        debate,
        message: "辩论已结束，进入评审阶段",
      });
    }

    return NextResponse.json({ message: "未知操作，支持: start, end" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "辩论操作失败" },
      { status: 400 },
    );
  }
}
