import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schemaSyncPromise: Promise<void> | undefined;
};

const connectionString =
  process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Idempotent auto-sync for newly added KYC and Shopee/TikTok Logistics columns
 * Ensures zero runtime errors even if `prisma db push` was skipped or pooler port 5432 was asleep.
 */
async function ensureSchemaSynced() {
  if (connectionString.includes('dummy:dummy')) return;
  try {
    await pool.query(`
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "rsbsaNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "idNameOnDocument" TEXT,
        ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "idVerifiedMatch" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "idMatchScore" INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE "Farm"
        ADD COLUMN IF NOT EXISTS "rsbsaNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "idNameOnDocument" TEXT,
        ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "idVerifiedMatch" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "idMatchScore" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "practices" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

      ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "courierName" TEXT,
        ADD COLUMN IF NOT EXISTS "driverName" TEXT,
        ADD COLUMN IF NOT EXISTS "driverPhone" TEXT,
        ADD COLUMN IF NOT EXISTS "vehicleInfo" TEXT,
        ADD COLUMN IF NOT EXISTS "estimatedDelivery" TEXT,
        ADD COLUMN IF NOT EXISTS "proofOfDeliveryUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "buyerConfirmedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "freshnessRating" INTEGER,
        ADD COLUMN IF NOT EXISTS "buyerReview" TEXT,
        ADD COLUMN IF NOT EXISTS "logisticsLogs" JSONB;
    `);
  } catch (err) {
    // Non-fatal: table or connection may not be ready yet
    console.warn('[Prisma Auto-Sync] Schema column check skipped:', (err as Error)?.message);
  }
}

if (!globalForPrisma.schemaSyncPromise) {
  globalForPrisma.schemaSyncPromise = ensureSchemaSynced();
}
