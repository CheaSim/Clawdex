import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import {
  OpenClawConnectionStatus,
  OpenClawRegion,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";
import { isPrismaBackendEnabled } from "@/lib/data-backend";
import { getPlayerBySlugFromDb, listChallenges } from "@/lib/mock-db";
import { prisma } from "@/lib/prisma";

export type PluginProvisionAccountInput = {
  email?: string;
  name?: string;
  password?: string;
  preferredPlayerSlug?: string;
  playerName?: string;
  channel?: string;
  accountId?: string;
  region?: string;
  clientVersion?: string;
  notes?: string;
  openClawStatus?: string;
  autoReady?: boolean;
};

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: string | null | undefined) {
  return normalizeText(value).toLowerCase();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function createFallbackEmail(seed: string) {
  const localPart = slugify(seed) || `agent-${randomUUID().slice(0, 8)}`;
  return `${localPart}@agents.clawdex.local`;
}

function createTempPassword() {
  return `Clawdex-${randomUUID().slice(0, 8)}-${randomUUID().slice(0, 8)}`;
}

function parseRegion(region?: string) {
  const value = normalizeText(region).toUpperCase();

  if ([OpenClawRegion.CN, OpenClawRegion.SEA, OpenClawRegion.EU, OpenClawRegion.NA].includes(value as OpenClawRegion)) {
    return value as OpenClawRegion;
  }

  return OpenClawRegion.CN;
}

function parseStatus(status?: string, autoReady?: boolean, hasBindingData?: boolean) {
  if (autoReady) {
    return OpenClawConnectionStatus.READY;
  }

  const value = normalizeText(status).toLowerCase();

  if (value === "ready") {
    return OpenClawConnectionStatus.READY;
  }

  if (value === "configured") {
    return OpenClawConnectionStatus.CONFIGURED;
  }

  if (value === "disconnected") {
    return OpenClawConnectionStatus.DISCONNECTED;
  }

  return hasBindingData ? OpenClawConnectionStatus.CONFIGURED : OpenClawConnectionStatus.DISCONNECTED;
}

async function reservePlayerSlug(base: string) {
  const normalizedBase = slugify(base) || `player-${randomUUID().slice(0, 6)}`;
  let candidate = normalizedBase;
  let index = 1;

  while (await prisma.player.findUnique({ where: { slug: candidate } })) {
    candidate = `${normalizedBase}-${index}`;
    index += 1;
  }

  return candidate;
}

async function resolveProvisionPlayer(input: PluginProvisionAccountInput, currentUserId?: string | null) {
  const preferredPlayerSlug = slugify(normalizeText(input.preferredPlayerSlug));
  const displayName = normalizeText(input.playerName) || normalizeText(input.name) || "Clawdex Agent";

  if (preferredPlayerSlug) {
    const existingPlayer = await prisma.player.findUnique({
      where: { slug: preferredPlayerSlug },
      include: { user: true, openClawAccount: true },
    });

    if (!existingPlayer) {
      const createdPlayer = await prisma.player.create({
        data: {
          slug: preferredPlayerSlug,
          name: displayName,
          title: "OpenClaw Auto-Provisioned Player",
          avatar: displayName.slice(0, 2).toUpperCase(),
          bio: "由 OpenClaw agent 自动创建，已准备接入 Clawdex PK 流程。",
          clawPoints: 120,
          tags: ["openclaw", "autoprovisioned"],
          recentMoments: ["通过 OpenClaw 自动接入 Clawdex"],
        },
        include: { openClawAccount: true },
      });

      return { player: createdPlayer, playerCreated: true };
    }

    if (existingPlayer.user && existingPlayer.user.id !== currentUserId) {
      throw new Error("该 player slug 已经绑定到其他账号，无法自动接管。");
    }

    return { player: existingPlayer, playerCreated: false };
  }

  const generatedSlug = await reservePlayerSlug(displayName);
  const createdPlayer = await prisma.player.create({
    data: {
      slug: generatedSlug,
      name: displayName,
      title: "OpenClaw Auto-Provisioned Player",
      avatar: displayName.slice(0, 2).toUpperCase(),
      bio: "由 OpenClaw agent 自动创建，已准备接入 Clawdex PK 流程。",
      clawPoints: 120,
      tags: ["openclaw", "autoprovisioned"],
      recentMoments: ["通过 OpenClaw 自动接入 Clawdex"],
    },
    include: { openClawAccount: true },
  });

  return { player: createdPlayer, playerCreated: true };
}

function assertProvisioningBackend() {
  if (!isPrismaBackendEnabled()) {
    throw new Error("自动注册需要启用 Prisma + PostgreSQL 后端。请先设置 CLAWDEX_DATA_BACKEND=prisma 和 DATABASE_URL。");
  }
}

export async function provisionPluginAccount(input: PluginProvisionAccountInput) {
  assertProvisioningBackend();

  const email = normalizeEmail(input.email)
    || createFallbackEmail(normalizeText(input.accountId) || normalizeText(input.preferredPlayerSlug) || normalizeText(input.name));
  const displayName = normalizeText(input.name) || normalizeText(input.playerName) || email.split("@")[0] || "Clawdex Agent";
  const requestedPassword = normalizeText(input.password);

  let user = await prisma.user.findUnique({
    where: { email },
    include: { player: { include: { openClawAccount: true } } },
  });

  let tempPassword: string | null = null;
  let userCreated = false;
  let playerCreated = false;
  let player = user?.player ?? null;

  if (!player) {
    const resolvedPlayer = await resolveProvisionPlayer(input, user?.id ?? null);
    player = resolvedPlayer.player;
    playerCreated = resolvedPlayer.playerCreated;
  }

  if (!user) {
    tempPassword = requestedPassword || createTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    user = await prisma.user.create({
      data: {
        email,
        name: displayName,
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        playerId: player.id,
      },
      include: { player: { include: { openClawAccount: true } } },
    });
    userCreated = true;
  } else if (!user.playerId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { playerId: player.id, name: user.name ?? displayName },
      include: { player: { include: { openClawAccount: true } } },
    });
  }

  const channel = normalizeText(input.channel) || "OpenClaw";
  const accountId = normalizeText(input.accountId) || slugify(player.slug) || player.slug;
  const clientVersion = normalizeText(input.clientVersion) || "autoprovisioned";
  const notes = normalizeText(input.notes) || "由 OpenClaw 自动化注册流程写入。";
  const hasBindingData = Boolean(channel || accountId || clientVersion || notes || input.region || input.openClawStatus || input.autoReady);

  if (hasBindingData) {
    const existingBinding = await prisma.openClawAccount.findFirst({
      where: {
        channel,
        accountId,
        NOT: { playerId: player.id },
      },
    });

    if (existingBinding) {
      throw new Error("该 OpenClaw 账号已经绑定到其他玩家，无法重复自动接入。");
    }

    const status = parseStatus(input.openClawStatus, input.autoReady, hasBindingData);
    const now = new Date();
    await prisma.openClawAccount.upsert({
      where: { playerId: player.id },
      update: {
        channel,
        accountId,
        region: parseRegion(input.region),
        clientVersion,
        status,
        notes,
        sourceChannel: "clawdex-channel",
        configuredAt: status === OpenClawConnectionStatus.DISCONNECTED ? null : now,
        lastVerifiedAt: status === OpenClawConnectionStatus.READY ? now : null,
      },
      create: {
        playerId: player.id,
        channel,
        accountId,
        region: parseRegion(input.region),
        clientVersion,
        status,
        notes,
        sourceChannel: "clawdex-channel",
        configuredAt: status === OpenClawConnectionStatus.DISCONNECTED ? null : now,
        lastVerifiedAt: status === OpenClawConnectionStatus.READY ? now : null,
      },
    });
  }

  const hydratedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { player: { include: { openClawAccount: true } } },
  });

  if (!hydratedUser?.player) {
    throw new Error("自动注册完成后未能加载玩家资料。");
  }

  return {
    ok: true,
    userCreated,
    playerCreated,
    tempPassword,
    user: {
      id: hydratedUser.id,
      email: hydratedUser.email,
      name: hydratedUser.name,
      role: hydratedUser.role,
      status: hydratedUser.status,
    },
    player: {
      slug: hydratedUser.player.slug,
      name: hydratedUser.player.name,
      clawPoints: hydratedUser.player.clawPoints,
      openClaw: hydratedUser.player.openClawAccount
        ? {
            channel: hydratedUser.player.openClawAccount.channel,
            accountId: hydratedUser.player.openClawAccount.accountId,
            region: hydratedUser.player.openClawAccount.region,
            clientVersion: hydratedUser.player.openClawAccount.clientVersion,
            status: hydratedUser.player.openClawAccount.status,
          }
        : null,
    },
    guidance: {
      loginUrl: "/login",
      accountUrl: "/account",
      onboardingUrl: "/get-started",
      openClawSetupUrl: `/openclaw?player=${hydratedUser.player.slug}`,
      tempPasswordShouldRotate: Boolean(tempPassword),
    },
  };
}

export async function getPluginCreditSnapshot(input: { playerSlug?: string; email?: string }) {
  const requestedPlayerSlug = normalizeText(input.playerSlug);
  const requestedEmail = normalizeEmail(input.email);

  let playerSlug = requestedPlayerSlug;

  if (!playerSlug && requestedEmail) {
    assertProvisioningBackend();

    const user = await prisma.user.findUnique({
      where: { email: requestedEmail },
      include: { player: true },
    });

    if (!user?.player) {
      throw new Error("没有找到与该账号关联的玩家身份。");
    }

    playerSlug = user.player.slug;
  }

  if (!playerSlug) {
    throw new Error("playerSlug 或 email 至少需要提供一个。");
  }

  const player = await getPlayerBySlugFromDb(playerSlug);

  if (!player) {
    throw new Error("未找到对应的 Clawdex 玩家。");
  }

  const challenges = await listChallenges();
  const totalChallenges = challenges.filter(
    (challenge) => challenge.challengerSlug === player.slug || challenge.defenderSlug === player.slug,
  ).length;

  return {
    ok: true,
    player: {
      slug: player.slug,
      name: player.name,
      clawPoints: player.clawPoints,
      elo: player.elo,
      fame: player.fame,
      winRate: player.winRate,
      readiness: player.openClaw.status,
    },
    summary: {
      credit: player.clawPoints,
      totalChallenges,
      ready: player.openClaw.status === "ready",
    },
  };
}
