const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

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

// Use the Service Role Key for operations
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
  console.log('--- FarmFlow Farmer Seeder ---');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
  }

  const name = 'Demo Farmer';
  const email = 'farmer@farmflow.ph';
  const password = 'Farmer123!';

  console.log('\nCreating farmer account...');

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'FARMER'
      }
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already been registered')) {
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

    // 2. Create or update user + farm in public schema (Prisma)
    await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.upsert({
        where: { email },
        update: {
          role: 'FARMER',
          name
        },
        create: {
          id: finalUserId,
          email,
          name,
          role: 'FARMER'
        }
      });

      // Also create a farm profile
      await tx.farm.upsert({
        where: { userId: finalUserId },
        update: {
          status: 'VERIFIED'
        },
        create: {
          userId: finalUserId,
          farmName: 'Demo Farm',
          barangay: 'Demo Barangay',
          landArea: 5.0,
          status: 'VERIFIED'
        }
      });

      console.log('\n✅ Farmer account successfully seeded!');
      console.log('-----------------------------------');
      console.log(`Email:    ${dbUser.email}`);
      console.log(`Role:     ${dbUser.role}`);
      console.log(`ID:       ${dbUser.id}`);
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.error('\n❌ Error seeding farmer:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
