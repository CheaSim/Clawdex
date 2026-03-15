export type ClawdexDataBackend = "mock" | "prisma";

export function getConfiguredDataBackend(): ClawdexDataBackend {
  return process.env.CLAWDEX_DATA_BACKEND === "prisma" ? "prisma" : "mock";
}

export function isPrismaBackendEnabled() {
  return getConfiguredDataBackend() === "prisma" && Boolean(process.env.DATABASE_URL);
}