import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalForPrisma;

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.info("[prisma] Initializing new Prisma client");

    const accelerateUrl = process.env.PRISMA_ACCELERATE_URL?.trim();
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (!accelerateUrl && !databaseUrl) {
      throw new Error(
        "Prisma Client v7 requires PRISMA_ACCELERATE_URL or DATABASE_URL (used with @prisma/adapter-pg)."
      );
    }

    globalForPrisma.prisma = new PrismaClient({
      ...(accelerateUrl
        ? { accelerateUrl }
        : { adapter: new PrismaPg(databaseUrl as string) }),
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
