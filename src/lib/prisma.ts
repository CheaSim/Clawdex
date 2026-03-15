import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://clawdex:change_me@127.0.0.1:5432/clawdex?schema=public";

const adapter = new PrismaPg({ connectionString });

declare global {
  var __clawdexPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__clawdexPrisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__clawdexPrisma__ = prisma;
}