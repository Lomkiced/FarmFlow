import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL
});

async function check() {
  try {
    const res = await pool.query(`
      DELETE FROM auth.users WHERE id = 'f1273e38-b604-409f-b436-a23b03488651';
    `);
    console.log("Delete result:", res);
  } catch (err: any) {
    console.error("Postgres Error:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Detail:", err.detail);
    console.error("Hint:", err.hint);
    console.error("Where:", err.where);
  } finally {
    await pool.end();
  }
}

check();
