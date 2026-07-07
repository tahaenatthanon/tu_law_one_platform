import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn("[Prisma] DATABASE_URL not set — database features unavailable.");
    return new PrismaClient();
  }

  // Use pg Pool with explicit timeout so failed connections fail fast
  // instead of hanging the entire request (default: no timeout = hang forever)
  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,  // 5 วินาที — ถ้าต่อไม่ได้ให้ throw ทันที
    max: 5,
  });

  pool.on("error", (err) => {
    console.error("[Prisma] Unexpected pool error:", err.message);
  });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
