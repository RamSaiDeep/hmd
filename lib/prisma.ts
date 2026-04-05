import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type GlobalForPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  console.info("[prisma] createPrismaClient called");

  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
  const databaseUrl = process.env.DATABASE_URL;

  // ✅ Option 1: Accelerate (if provided)
  if (accelerateUrl) {
    console.info("[prisma] Using PRISMA_ACCELERATE_URL");
    return new PrismaClient({
      accelerateUrl,
      log: ["query", "info", "warn", "error"],
    });
  }

  // ✅ Option 2: PostgreSQL adapter (YOUR CASE)
  if (databaseUrl) {
    console.info("[prisma] Using PostgreSQL adapter");

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });

    return new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }

  // ❌ Nothing configured
  throw new Error(
    "No Prisma configuration found. Set either PRISMA_ACCELERATE_URL or DATABASE_URL."
  );
}

function getPrismaClient(): PrismaClient {
  const globalForPrisma = globalThis as GlobalForPrisma;

  if (!globalForPrisma.prisma) {
    console.info("[prisma] Initializing new Prisma client");
    globalForPrisma.prisma = createPrismaClient();
  } else {
    console.info("[prisma] Reusing Prisma client");
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});