import { NextResponse } from "next/server";

import { getPlayerBySlugFromDb } from "@/lib/mock-db";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const player = await getPlayerBySlugFromDb(slug);

  if (!player) {
    return NextResponse.json({ message: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}
