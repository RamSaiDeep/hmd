import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  console.info("[prisma] createPrismaClient called");
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;

  if (accelerateUrl) {
    console.info("[prisma] Using PRISMA_ACCELERATE_URL for Prisma client initialization");
    return new PrismaClient({
      accelerateUrl,
      log: ["query", "info", "warn", "error"],
    });
  }

  console.error(
    "[prisma] Missing Prisma runtime configuration. PRISMA_ACCELERATE_URL is not set and no driver adapter is configured."
  );
  throw new Error(
    'Prisma Client v7 requires either PRISMA_ACCELERATE_URL, or a configured driver adapter. Install @prisma/adapter-pg and initialize PrismaClient with { adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) }.'
  );
}

function getPrismaClient(): PrismaClient {
  const globalForPrisma = globalThis as GlobalForPrisma;

  if (!globalForPrisma.prisma) {
    console.info("[prisma] No cached Prisma client found. Initializing new client instance.");
    globalForPrisma.prisma = createPrismaClient();
  } else {
    console.info("[prisma] Reusing cached Prisma client instance.");
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
