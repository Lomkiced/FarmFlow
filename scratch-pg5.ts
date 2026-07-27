import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL
});

async function fix() {
  try {
    const res = await pool.query(`
      CREATE OR REPLACE FUNCTION public.handle_deleted_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $function$
      BEGIN
        DELETE FROM public."User" WHERE id = OLD.id::text;
        RETURN OLD;
      END;
      $function$;
    `);
    console.log("Function replaced successfully:", res);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

fix();
