'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { loginSchema, buyerRegisterSchema, farmerRegisterSchema } from '@/lib/validations/auth';

// ─────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────
export type AuthActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { message: error.message === 'Invalid login credentials'
      ? 'Invalid email or password. Please try again.'
      : error.message
    };
  }

  // Fetch the user's role to redirect correctly
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication failed. Please try again.' };

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile) return { message: 'User profile not found. Please contact support.' };

  // Role-based redirect
  if (profile.role === 'ADMIN') redirect('/admin');
  if (profile.role === 'FARMER') redirect('/farmer/dashboard');
  redirect('/products');
}

// ─────────────────────────────────────────────────
// REGISTER — BUYER
// ─────────────────────────────────────────────────
export async function registerBuyerAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = buyerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  // 1. Create auth user in Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: 'BUYER',
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('already registered')) {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
    return { message: signUpError.message };
  }

  if (!data.user) return { message: 'Registration failed. Please try again.' };

  // 2. Create User row in public DB (synced with Supabase Auth UID)
  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: 'BUYER',
      },
    });
  } catch (dbError) {
    // Rollback: delete auth user if DB insert fails
    const adminClient = await import('@/lib/supabase/server').then(m => m.createAdminClient());
    await (await adminClient).auth.admin.deleteUser(data.user.id);
    return { message: 'Failed to create account. Please try again.' };
  }

  redirect('/auth/register/success?role=buyer');
}

// ─────────────────────────────────────────────────
// REGISTER — FARMER
// ─────────────────────────────────────────────────
export async function registerFarmerAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const cropsRaw = formData.get('crops') as string;
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
    farmName: formData.get('farmName') as string,
    barangay: formData.get('barangay') as string,
    landArea: formData.get('landArea') as string,
    crops: cropsRaw ? cropsRaw.split(',') : [],
  };

  const parsed = farmerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  // 1. Create Supabase Auth user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: 'FARMER',
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('already registered')) {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
    return { message: signUpError.message };
  }

  if (!data.user) return { message: 'Registration failed. Please try again.' };

  // 2. Create User + Farm rows in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: data.user!.id,
          email: parsed.data.email,
          name: parsed.data.name,
          phone: parsed.data.phone,
          role: 'FARMER',
        },
      });

      await tx.farm.create({
        data: {
          userId: data.user!.id,
          farmName: parsed.data.farmName,
          barangay: parsed.data.barangay,
          landArea: parsed.data.landArea,
          status: 'PENDING',
        },
      });
    });
  } catch {
    const adminClient = await import('@/lib/supabase/server').then(m => m.createAdminClient());
    await (await adminClient).auth.admin.deleteUser(data.user.id);
    return { message: 'Failed to create account. Please try again.' };
  }

  redirect('/auth/register/success?role=farmer');
}

// ─────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
