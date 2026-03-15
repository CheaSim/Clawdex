import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient, ChallengeStatus, MatchMode, OpenClawConnectionStatus, OpenClawRegion, UserRole, UserStatus } from "../src/generated/prisma/client";
import { seedDatabase } from "../src/data/product-data";

const connectionString = process.env.DATABASE_URL ?? "postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const modeToPrisma = {
  "public-arena": MatchMode.PUBLIC_ARENA,
  rivalry: MatchMode.RIVALRY,
  "ranked-1v1": MatchMode.RANKED_1V1,
} as const;

const statusToPrisma = {
  pending: ChallengeStatus.PENDING,
  accepted: ChallengeStatus.ACCEPTED,
  live: ChallengeStatus.LIVE,
  settlement: ChallengeStatus.SETTLEMENT,
} as const;

const openClawStatusToPrisma = {
  disconnected: OpenClawConnectionStatus.DISCONNECTED,
  configured: OpenClawConnectionStatus.CONFIGURED,
  ready: OpenClawConnectionStatus.READY,
} as const;

async function main() {
  const demoPasswordHash = await bcrypt.hash("Clawdex123!", 10);
  const adminPasswordHash = await bcrypt.hash("ClawdexAdmin!2026", 10);

  for (const player of seedDatabase.players) {
    await prisma.player.upsert({
      where: { slug: player.slug },
      update: {
        name: player.name,
        title: player.title,
        avatar: player.avatar,
        elo: player.elo,
        fame: player.fame,
        streak: player.streak,
        winRate: Number.parseFloat(player.winRate.replace("%", "")) || 0,
        clawPoints: player.clawPoints,
        preferredMode: modeToPrisma[player.preferredMode],
        bio: player.bio,
        tags: player.tags,
        recentMoments: player.recentMoments,
        openClawAccount: {
          upsert: {
            create: {
              channel: player.openClaw.channel,
              accountId: player.openClaw.accountId,
              region: player.openClaw.region as OpenClawRegion,
              clientVersion: player.openClaw.clientVersion,
              status: openClawStatusToPrisma[player.openClaw.status],
              configuredAt: player.openClaw.configuredAt ? new Date(player.openClaw.configuredAt) : null,
              lastVerifiedAt: player.openClaw.lastVerifiedAt ? new Date(player.openClaw.lastVerifiedAt) : null,
              notes: player.openClaw.notes,
            },
            update: {
              channel: player.openClaw.channel,
              accountId: player.openClaw.accountId,
              region: player.openClaw.region as OpenClawRegion,
              clientVersion: player.openClaw.clientVersion,
              status: openClawStatusToPrisma[player.openClaw.status],
              configuredAt: player.openClaw.configuredAt ? new Date(player.openClaw.configuredAt) : null,
              lastVerifiedAt: player.openClaw.lastVerifiedAt ? new Date(player.openClaw.lastVerifiedAt) : null,
              notes: player.openClaw.notes,
            },
          },
        },
      },
      create: {
        slug: player.slug,
        name: player.name,
        title: player.title,
        avatar: player.avatar,
        elo: player.elo,
        fame: player.fame,
        streak: player.streak,
        winRate: Number.parseFloat(player.winRate.replace("%", "")) || 0,
        clawPoints: player.clawPoints,
        preferredMode: modeToPrisma[player.preferredMode],
        bio: player.bio,
        tags: player.tags,
        recentMoments: player.recentMoments,
        openClawAccount: {
          create: {
            channel: player.openClaw.channel,
            accountId: player.openClaw.accountId,
            region: player.openClaw.region as OpenClawRegion,
            clientVersion: player.openClaw.clientVersion,
            status: openClawStatusToPrisma[player.openClaw.status],
            configuredAt: player.openClaw.configuredAt ? new Date(player.openClaw.configuredAt) : null,
            lastVerifiedAt: player.openClaw.lastVerifiedAt ? new Date(player.openClaw.lastVerifiedAt) : null,
            notes: player.openClaw.notes,
          },
        },
      },
    });
  }

  for (const player of seedDatabase.players) {
    const playerRecord = await prisma.player.findUniqueOrThrow({ where: { slug: player.slug } });

    await prisma.user.upsert({
      where: { email: `${player.slug}@clawdex.local` },
      update: {
        name: player.name,
        image: null,
        passwordHash: demoPasswordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        playerId: playerRecord.id,
      },
      create: {
        name: player.name,
        email: `${player.slug}@clawdex.local`,
        passwordHash: demoPasswordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        playerId: playerRecord.id,
      },
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@clawdex.local" },
    update: {
      name: "Clawdex Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      playerId: null,
    },
    create: {
      name: "Clawdex Admin",
      email: "admin@clawdex.local",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  for (const challenge of seedDatabase.challenges) {
    const [challenger, defender] = await Promise.all([
      prisma.player.findUniqueOrThrow({ where: { slug: challenge.challengerSlug } }),
      prisma.player.findUniqueOrThrow({ where: { slug: challenge.defenderSlug } }),
    ]);

    await prisma.challenge.upsert({
      where: { id: challenge.id },
      update: {
        mode: modeToPrisma[challenge.mode],
        challengerId: challenger.id,
        defenderId: defender.id,
        stake: challenge.stake,
        rewardPool: challenge.rewardPool,
        visibility: challenge.visibility === "public" ? "PUBLIC" : "FOLLOWERS",
        status: statusToPrisma[challenge.status],
        scheduledLabel: challenge.scheduledFor,
        storyline: challenge.storyline,
        rulesNote: challenge.rulesNote,
        preview: challenge.preview,
        createdAt: new Date(challenge.createdAt),
        acceptedAt: challenge.acceptedAt ? new Date(challenge.acceptedAt) : null,
      },
      create: {
        id: challenge.id,
        mode: modeToPrisma[challenge.mode],
        challengerId: challenger.id,
        defenderId: defender.id,
        stake: challenge.stake,
        rewardPool: challenge.rewardPool,
        visibility: challenge.visibility === "public" ? "PUBLIC" : "FOLLOWERS",
        status: statusToPrisma[challenge.status],
        scheduledLabel: challenge.scheduledFor,
        storyline: challenge.storyline,
        rulesNote: challenge.rulesNote,
        preview: challenge.preview,
        createdAt: new Date(challenge.createdAt),
        acceptedAt: challenge.acceptedAt ? new Date(challenge.acceptedAt) : null,
      },
    });
  }

  await prisma.openClawBinding.upsert({
    where: { id: "seed-binding-public-arena" },
    update: {
      agentId: "clawdex-main",
      mode: MatchMode.PUBLIC_ARENA,
      enabled: true,
      priority: 10,
    },
    create: {
      id: "seed-binding-public-arena",
      agentId: "clawdex-main",
      mode: MatchMode.PUBLIC_ARENA,
      enabled: true,
      priority: 10,
    },
  });

  await prisma.openClawBinding.upsert({
    where: { id: "seed-binding-ranked" },
    update: {
      agentId: "clawdex-ranked",
      mode: MatchMode.RANKED_1V1,
      enabled: true,
      priority: 20,
    },
    create: {
      id: "seed-binding-ranked",
      agentId: "clawdex-ranked",
      mode: MatchMode.RANKED_1V1,
      enabled: true,
      priority: 20,
    },
  });

  console.log("Clawdex Prisma seed completed.");
  console.log("Demo admin: admin@clawdex.local / ClawdexAdmin!2026");
  console.log("Demo player accounts: <player-slug>@clawdex.local / Clawdex123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });