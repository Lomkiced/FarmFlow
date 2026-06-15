// Prisma v7 configuration — database connection URLs live here, not in schema.prisma
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
    // directUrl bypasses PgBouncer pooler for migrations
    // @ts-expect-error - Prisma types might be outdated or missing directUrl
    directUrl: process.env['DIRECT_URL'],
  },
});
