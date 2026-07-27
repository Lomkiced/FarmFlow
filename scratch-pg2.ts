import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL // Use DIRECT_URL for migrations/DDL
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT prosrc 
      FROM pg_proc 
      WHERE proname = 'handle_deleted_user';
    `);
    console.log("handle_deleted_user source code:");
    console.log(res.rows[0].prosrc);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
