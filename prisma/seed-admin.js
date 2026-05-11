const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables from .env
dotenv.config({ path: '.env' });

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

// Use the Service Role Key for Admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function main() {
  console.log('--- FarmFlow Admin Seeder ---');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
  }

  const name = 'LGU Admin';
  const email = 'admin@farmflow.ph';
  const password = 'Admin123!';

  console.log('\nCreating admin account...');

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'ADMIN'
      }
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('User already exists in Supabase Auth. Proceeding to check database...');
      } else {
        throw new Error(`Supabase Auth Error: ${authError.message}`);
      }
    }

    const userId = authData?.user?.id;
    let finalUserId = userId;

    if (!userId) {
       // Fetch existing user to get ID
       const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
       if (fetchError) throw new Error(`Could not fetch users: ${fetchError.message}`);
       
       const existingUser = users.find(u => u.email === email);
       if (!existingUser) throw new Error('Could not find existing user ID');
       finalUserId = existingUser.id;
    }

    // 2. Create or update user in public schema (Prisma)
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        name
      },
      create: {
        id: finalUserId,
        email,
        name,
        role: 'ADMIN'
      }
    });

    console.log('\n✅ Admin account successfully seeded!');
    console.log('-----------------------------------');
    console.log(`Email:    ${dbUser.email}`);
    console.log(`Role:     ${dbUser.role}`);
    console.log(`ID:       ${dbUser.id}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('\n❌ Error seeding admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
