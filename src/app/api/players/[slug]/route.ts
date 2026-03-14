import { NextResponse } from "next/server";

import { getPlayerBySlug } from "@/data/product-data";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    return NextResponse.json({ message: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}
