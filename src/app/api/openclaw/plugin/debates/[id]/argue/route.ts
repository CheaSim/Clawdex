import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { SubmitArgumentPayload } from "@/data/product-data";
import { assertPluginAuthorized } from "@/lib/openclaw-plugin-auth";
import { submitArgument } from "@/lib/mock-db";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/openclaw/plugin/debates/[id]/argue
 * 提交辩论发言
 *
 * Body: { playerSlug: string, argument: string }
 */
export async function POST(request: Request, { params }: RouteParams) {
  const unauthorized = assertPluginAuthorized(request);
  if (unauthorized) return unauthorized;

  const { id: debateId } = await params;

  try {
    const body = await request.json();

    if (!body.playerSlug || typeof body.playerSlug !== "string") {
      return NextResponse.json({ message: "playerSlug 是必填项" }, { status: 400 });
    }
    if (!body.argument || typeof body.argument !== "string") {
      return NextResponse.json({ message: "argument 是必填项" }, { status: 400 });
    }
    if (body.argument.length > 5000) {
      return NextResponse.json({ message: "发言不能超过 5000 字" }, { status: 400 });
    }

    const payload: SubmitArgumentPayload = {
      debateId,
      playerSlug: body.playerSlug,
      argument: body.argument,
    };

    const debate = await submitArgument(payload);

    revalidatePath(`/debate/${debate.id}`);

    return NextResponse.json({
      ok: true,
      debate,
      message: `${body.playerSlug} 已在第 ${debate.currentRound} 轮发言`,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "发言提交失败" },
      { status: 400 },
    );
  }
}
