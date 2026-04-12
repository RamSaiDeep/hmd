import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalForPrisma;

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.info("[prisma] Initializing new Prisma client");

    globalForPrisma.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  } else {
    console.info("[prisma] Reusing Prisma client");
  }

  return globalForPrisma.prisma;
}
