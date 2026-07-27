import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function check() {
  try {
    const triggers = await prisma.$queryRaw`
      SELECT 
        event_object_schema as table_schema,
        event_object_table as table_name,
        trigger_schema,
        trigger_name,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'users' AND event_object_schema = 'auth';
    `;
    console.log("Triggers on auth.users:", triggers);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
