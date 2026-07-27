import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkStorage() {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .limit(10);
  console.log("Storage objects:", data, error);
}

checkStorage();
