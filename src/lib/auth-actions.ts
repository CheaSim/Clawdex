"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { UserRole, UserStatus } from "@/generated/prisma/client";
import { requireAdminUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(formData: FormData) {
  const name = normalizeText(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeText(formData.get("password"));
  const confirmPassword = normalizeText(formData.get("confirmPassword"));
  const playerSlug = normalizeText(formData.get("playerSlug"));

  if (!name || !email || !password) {
    redirect("/register?error=missing");
  }

  if (!EMAIL_RE.test(email)) {
    redirect("/register?error=email-format");
  }

  if (password.length < 8) {
    redirect("/register?error=password-length");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=password-match");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    redirect("/register?error=email-exists");
  }

  let playerId: string | null = null;

  if (playerSlug) {
    const player = await prisma.player.findUnique({ where: { slug: playerSlug } });

    if (!player) {
      redirect("/register?error=player-missing");
    }

    const linkedUser = await prisma.user.findFirst({ where: { playerId: player.id } });

    if (linkedUser) {
      redirect("/register?error=player-linked");
    }

    playerId = player.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      playerId,
    },
  });

  revalidatePath("/admin/users");
  redirect("/login?registered=1");
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = normalizeText(formData.get("userId"));
  const role = normalizeText(formData.get("role"));

  if (!userId || ![UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN].includes(role as UserRole)) {
    redirect("/admin/users?error=role");
  }

  if (currentUser.id === userId && role !== UserRole.ADMIN) {
    redirect("/admin/users?error=self-role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as UserRole },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=role");
}

export async function updateUserStatusAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = normalizeText(formData.get("userId"));
  const status = normalizeText(formData.get("status"));

  if (!userId || ![UserStatus.ACTIVE, UserStatus.SUSPENDED].includes(status as UserStatus)) {
    redirect("/admin/users?error=status");
  }

  if (currentUser.id === userId && status !== UserStatus.ACTIVE) {
    redirect("/admin/users?error=self-status");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: status as UserStatus },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=status");
}
