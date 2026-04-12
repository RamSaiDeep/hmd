import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalForPrisma;

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.info("[prisma] Initializing new Prisma client");

    globalForPrisma.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });

  } else {
    console.info("[prisma] Reusing Prisma client");
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();