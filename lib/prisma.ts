import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Prisma - DATABASE_URL exists:", !!connectionString);
  console.log("Prisma - DATABASE_URL length:", connectionString?.length || 0);
  console.log("Prisma - DATABASE_URL preview:", connectionString?.substring(0, 50) + "...");
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Clean up potential newlines or whitespace
  const cleanConnectionString = connectionString.trim().replace(/\s+/g, ' ');
  console.log("Prisma - Cleaned connection string length:", cleanConnectionString.length);

  // PrismaNeon expects a neon PoolConfig (e.g. { connectionString }), not a Pool instance.
  const adapter = new PrismaNeon({ connectionString: cleanConnectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;