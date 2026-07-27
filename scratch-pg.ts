import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL // Use DIRECT_URL for migrations/DDL
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT 
        event_object_schema as table_schema,
        event_object_table as table_name,
        trigger_schema,
        trigger_name,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'users' AND event_object_schema = 'auth';
    `);
    console.log("Triggers on auth.users:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
