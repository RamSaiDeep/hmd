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

  // Option 2: Direct Prisma client with SSL configuration
  if (databaseUrl) {
    console.info("[prisma] Using direct Prisma client");

    // Add SSL parameters to DATABASE_URL for Vercel deployment
    const modifiedDatabaseUrl = databaseUrl.includes('sslmode=')
      ? databaseUrl
      : `${databaseUrl}?sslmode=require&sslrejectunauthorized=false`;

    // Temporarily set the modified URL in environment
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = modifiedDatabaseUrl;

    const client = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });

    // Restore original URL
    process.env.DATABASE_URL = originalUrl;

    return client;
  }

  // Nothing configured
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