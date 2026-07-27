import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT
        tc.table_schema, 
        tc.table_name, 
        kcu.column_name,
        tc.constraint_type
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE ccu.table_name = 'users' AND ccu.table_schema = 'auth';
    `);
    console.log("Foreign keys referencing auth.users:");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
