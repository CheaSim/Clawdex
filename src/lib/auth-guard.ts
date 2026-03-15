import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserRole, UserStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CurrentUserRecord = Prisma.UserGetPayload<{
  include: { player: { include: { openClawAccount: true } } };
}>;

export async function getCurrentUserRecord() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { player: { include: { openClawAccount: true } } },
  });
}

export async function requireCurrentUser() {
  const user = await getCurrentUserRecord();

  if (!user) {
    redirect("/login");
  }

  if (user.status !== UserStatus.ACTIVE) {
    redirect("/login?error=suspended");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (user.role !== UserRole.ADMIN) {
    redirect("/account?error=admin");
  }

  return user;
}

export function canManagePlayer(user: CurrentUserRecord, slug: string) {
  return user.role === UserRole.ADMIN || user.player?.slug === slug;
}

export function canCreateChallengeForPlayer(user: CurrentUserRecord, slug: string) {
  return user.role === UserRole.ADMIN || user.player?.slug === slug;
}

export function canAcceptChallengeForPlayer(user: CurrentUserRecord, slug: string) {
  return user.role === UserRole.ADMIN || user.player?.slug === slug;
}
