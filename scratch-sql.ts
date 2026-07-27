import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function check() {
  try {
    // Attempt to delete a non-existent user in auth.users directly via SQL to see if there is a trigger
    // Actually, we can just delete a user and see what the Postgres error is.
    // Wait, prisma connects to `public`. We can query `pg_constraint`.
    const constraints = await prisma.$queryRaw`
      SELECT
        tc.table_schema, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE ccu.table_name = 'users' AND ccu.table_schema = 'auth';
    `;
    console.log("Constraints on auth.users:", constraints);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
