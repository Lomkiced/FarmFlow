import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function test() {
  // 1. Create a dummy user
  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email: 'test_delete_me@example.com',
    password: 'Password123!',
    email_confirm: true,
  });

  if (createError || !authData.user) {
    console.log("Create error:", createError);
    return;
  }
  
  const userId = authData.user.id;
  console.log("Created user:", userId);

  // 2. Try to delete the user immediately
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  console.log("Delete error:", deleteError);
}

test();
