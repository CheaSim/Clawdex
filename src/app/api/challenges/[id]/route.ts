import { NextResponse } from "next/server";

import { getChallengeById } from "@/lib/mock-db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return NextResponse.json({ message: "Challenge not found" }, { status: 404 });
  }

  return NextResponse.json(challenge);
}
