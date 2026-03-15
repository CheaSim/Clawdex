import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { openClawRegions, type OpenClawConnectionStatus, type OpenClawRegion, type UpdateOpenClawPayload } from "@/data/product-data";
import { canManagePlayer, getCurrentUserRecord } from "@/lib/auth-guard";
import { getPlayerBySlugFromDb, listChallenges, updatePlayerOpenClawRecord } from "@/lib/mock-db";

const validStatuses: OpenClawConnectionStatus[] = ["disconnected", "configured", "ready"];

function validatePayload(payload: Partial<UpdateOpenClawPayload>) {
  if (!payload.status || !validStatuses.includes(payload.status)) {
    return "请选择有效的 OpenClaw 连接状态";
  }

  if (!payload.region || !openClawRegions.includes(payload.region as OpenClawRegion)) {
    return "请选择有效的 OpenClaw 区域";
  }

  if (payload.status !== "disconnected") {
    if (!payload.channel?.trim()) {
      return "请输入 OpenClaw 通道名";
    }

    if (!payload.accountId?.trim()) {
      return "请输入 OpenClaw 账号标识";
    }

    if (!payload.clientVersion?.trim()) {
      return "请输入当前客户端版本";
    }
  }

  return null;
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const player = await getPlayerBySlugFromDb(slug);

  if (!player) {
    return NextResponse.json({ message: "玩家不存在" }, { status: 404 });
  }

  return NextResponse.json(player.openClaw);
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const currentUser = await getCurrentUserRecord();

  if (!currentUser) {
    return NextResponse.json({ message: "请先登录后再管理 OpenClaw 配置。" }, { status: 401 });
  }

  if (!canManagePlayer(currentUser, slug)) {
    return NextResponse.json({ message: "你只能修改自己绑定玩家的 OpenClaw 配置。" }, { status: 403 });
  }

  const payload = (await request.json()) as Partial<UpdateOpenClawPayload>;
  const validationError = validatePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const player = await updatePlayerOpenClawRecord(slug, payload as UpdateOpenClawPayload);
    const relatedChallenges = (await listChallenges()).filter(
      (challenge) => challenge.challengerSlug === slug || challenge.defenderSlug === slug,
    );

    revalidatePath("/openclaw");
    revalidatePath("/challenge");
    revalidatePath("/challenge/new");
    revalidatePath(`/players/${slug}`);

    for (const challenge of relatedChallenges) {
      revalidatePath(`/challenge/${challenge.id}`);
    }

    return NextResponse.json({
      message: player.openClaw.status === "ready" ? "OpenClaw 已完成校验，这名玩家现在可以参与对战。" : "OpenClaw 配置已保存。",
      player,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存 OpenClaw 配置失败";
    const status = message === "玩家不存在" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
