'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import {
  loginSchema,
  buyerRegisterSchema,
  farmerRegisterSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from '@/lib/validations/auth';
import { verifyIdentityMatch, getKycIdSpec } from '@/lib/kyc-utils';
import { sendAdminNotification } from '@/lib/notifications';
import { headers } from 'next/headers';

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
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { message: 'Please check your email and confirm your account before logging in.' };
    }
    return {
      message:
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
    };
  }

  // Fetch the user's role to redirect correctly
  const user = authData?.user;
  if (!user) return { message: 'Authentication failed. Please try again.' };

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile) {
    // If auth succeeds but no DB profile is found, it's a corrupted state.
    await supabase.auth.signOut();
    return { message: 'Your account setup is incomplete. Please contact support.' };
  }

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
  const firstName = (formData.get('firstName') as string) || '';
  const lastName = (formData.get('lastName') as string) || '';
  const rawName = (formData.get('name') as string) || `${firstName} ${lastName}`.trim();

  const raw = {
    name: rawName,
    email: (formData.get('email') as string) || '',
    phone: (formData.get('phone') as string) || '',
    idType: (formData.get('idType') as string) || '',
    idNumber: (formData.get('idNumber') as string) || '',
    confirmIdNumber:
      (formData.get('confirmIdNumber') as string) || (formData.get('idNumber') as string) || '',
    idNameOnDocument:
      (formData.get('idNameOnDocument') as string) || rawName,
    idPhotoUrl:
      (formData.get('idPhotoUrl') as string) || (formData.get('idDocumentUrl') as string) || '',
    password: (formData.get('password') as string) || '',
    confirmPassword: (formData.get('confirmPassword') as string) || '',
  };

  const parsed = buyerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Strict server-side KYC identity verification
  const kycResult = verifyIdentityMatch({
    registeredName: parsed.data.name,
    idNameOnDocument: parsed.data.idNameOnDocument,
    idType: parsed.data.idType,
    idNumber: parsed.data.idNumber,
    confirmIdNumber: parsed.data.confirmIdNumber,
    requireRsbsa: false,
    hasUploadedDocument: Boolean(parsed.data.idPhotoUrl),
  });

  if (!kycResult.isValid) {
    return {
      message: 'Identity verification failed. Please ensure your ID Name and ID Number match your profile.',
      errors: {
        ...(kycResult.errors.idNameOnDocument ? { idNameOnDocument: [kycResult.errors.idNameOnDocument] } : {}),
        ...(kycResult.errors.idNumber ? { idNumber: [kycResult.errors.idNumber] } : {}),
        ...(kycResult.errors.confirmIdNumber ? { confirmIdNumber: [kycResult.errors.confirmIdNumber] } : {}),
      },
    };
  }

  if (!parsed.data.idPhotoUrl || parsed.data.idPhotoUrl.trim() === '') {
    return {
      errors: {
        idPhotoUrl: ['A valid government or institutional ID photo/document is strictly required.'],
      },
    };
  }

  const supabase = await createClient();

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  // Pre-flight check: ensure email doesn't already exist in Prisma DB
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existingUser) {
    // Advanced Ghost User Detection
    const adminClient = await import('@/lib/supabase/server').then((m) => m.createAdminClient());
    const { data: authUser, error: authError } = await (
      await adminClient
    ).auth.admin.getUserById(existingUser.id);

    if (authError || !authUser?.user) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    } else {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
  }

  // 1. Create auth user in Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: 'BUYER',
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (signUpError) {
    const errorMsg = signUpError.message?.toLowerCase() || '';
    if (errorMsg.includes('already registered')) {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
    if (errorMsg.includes('rate limit') || errorMsg.includes('email rate limit exceeded')) {
      return {
        message: 'We are experiencing high registration volume. Please wait a moment and try again.',
      };
    }
    if (errorMsg === '{}' || signUpError.message === '{}') {
      return {
        message: 'Failed to send confirmation email. Please ensure your SMTP settings are correct.',
      };
    }
    return { message: signUpError.message || 'An unknown error occurred during registration.' };
  }

  if (!data.user) return { message: 'Registration failed. Please try again.' };

  const idSpec = getKycIdSpec(parsed.data.idType);

  // 2. Create User row in public DB with mandatory KYC verification details
  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        idType: idSpec.code,
        idNumber: parsed.data.idNumber,
        idPhotoUrl: parsed.data.idPhotoUrl,
        idDocumentUrl: parsed.data.idPhotoUrl,
        idNameOnDocument: parsed.data.idNameOnDocument,
        idVerifiedMatch: true,
        idMatchScore: kycResult.idMatchScore,
        role: 'BUYER',
      },
    });
  } catch (dbError: any) {
    const adminClient = await import('@/lib/supabase/server').then((m) => m.createAdminClient());
    await (await adminClient).auth.admin.deleteUser(data.user.id);
    return {
      message: `Failed to create account in database: ${dbError?.message || 'Unknown error'}`,
    };
  }

  sendAdminNotification({
    type: 'NEW_USER',
    title: 'New Buyer Registration (100% KYC Match)',
    message: `${parsed.data.name} registered as a Buyer with verified ${idSpec.shortLabel} (${parsed.data.idNumber}).`,
    relatedId: data.user.id,
    relatedType: 'user',
  });

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
  const firstName = (formData.get('firstName') as string) || '';
  const lastName = (formData.get('lastName') as string) || '';
  const rawName = (formData.get('name') as string) || `${firstName} ${lastName}`.trim();

  const raw = {
    name: rawName,
    email: (formData.get('email') as string) || '',
    phone: (formData.get('phone') as string) || '',
    password: (formData.get('password') as string) || '',
    farmName: (formData.get('farmName') as string) || '',
    barangay: (formData.get('barangay') as string) || '',
    landArea: (formData.get('landArea') as string) || '',
    crops: cropsRaw ? cropsRaw.split(',') : [],
    rsbsaNumber: (formData.get('rsbsaNumber') as string) || '',
    idType: (formData.get('idType') as string) || '',
    idNumber: (formData.get('idNumber') as string) || '',
    confirmIdNumber:
      (formData.get('confirmIdNumber') as string) || (formData.get('idNumber') as string) || '',
    idNameOnDocument:
      (formData.get('idNameOnDocument') as string) || rawName,
    idPhotoUrl:
      (formData.get('idPhotoUrl') as string) || (formData.get('idDocumentUrl') as string) || '',
    farmDocUrl: (formData.get('farmDocUrl') as string) || undefined,
    confirmPassword: (formData.get('confirmPassword') as string) || '',
  };

  const parsed = farmerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const kycResult = verifyIdentityMatch({
    registeredName: parsed.data.name,
    idNameOnDocument: parsed.data.idNameOnDocument,
    idType: parsed.data.idType,
    idNumber: parsed.data.idNumber,
    confirmIdNumber: parsed.data.confirmIdNumber,
    rsbsaNumber: parsed.data.rsbsaNumber,
    requireRsbsa: true,
    hasUploadedDocument: Boolean(parsed.data.idPhotoUrl),
  });

  if (!kycResult.isValid) {
    return {
      message: 'KYC Identity Matching failed. Please ensure your Name on ID, ID Number, and RSBSA Number match.',
      errors: {
        ...(kycResult.errors.idNameOnDocument ? { idNameOnDocument: [kycResult.errors.idNameOnDocument] } : {}),
        ...(kycResult.errors.idNumber ? { idNumber: [kycResult.errors.idNumber] } : {}),
        ...(kycResult.errors.confirmIdNumber ? { confirmIdNumber: [kycResult.errors.confirmIdNumber] } : {}),
        ...(kycResult.errors.rsbsaNumber ? { rsbsaNumber: [kycResult.errors.rsbsaNumber] } : {}),
      },
    };
  }

  if (!parsed.data.idPhotoUrl || parsed.data.idPhotoUrl.trim() === '') {
    return {
      errors: {
        idPhotoUrl: ['A valid government or RSBSA ID photo/document is strictly required.'],
      },
    };
  }

  const supabase = await createClient();

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  // Pre-flight check: ensure email doesn't already exist in Prisma DB
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existingUser) {
    const adminClient = await import('@/lib/supabase/server').then((m) => m.createAdminClient());
    const { data: authUser, error: authError } = await (
      await adminClient
    ).auth.admin.getUserById(existingUser.id);

    if (authError || !authUser?.user) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    } else {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
  }

  // 1. Create Supabase Auth user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: 'FARMER',
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (signUpError) {
    const errorMsg = signUpError.message?.toLowerCase() || '';
    if (errorMsg.includes('already registered')) {
      return { errors: { email: ['An account with this email already exists.'] } };
    }
    if (errorMsg.includes('rate limit') || errorMsg.includes('email rate limit exceeded')) {
      return {
        message: 'We are experiencing high registration volume. Please wait a moment and try again.',
      };
    }
    if (errorMsg === '{}' || signUpError.message === '{}') {
      return {
        message: 'Failed to send confirmation email. Please ensure your SMTP settings are correct.',
      };
    }
    return { message: signUpError.message || 'An unknown error occurred during registration.' };
  }

  if (!data.user) return { message: 'Registration failed. Please try again.' };

  const idSpec = getKycIdSpec(parsed.data.idType);

  // 2. Create User + Farm rows in a transaction with KYC verification data
  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.user.create({
        data: {
          id: data.user!.id,
          email: parsed.data.email,
          name: parsed.data.name,
          phone: parsed.data.phone,
          rsbsaNumber: parsed.data.rsbsaNumber,
          idType: idSpec.code,
          idNumber: parsed.data.idNumber,
          idPhotoUrl: parsed.data.idPhotoUrl,
          idDocumentUrl: parsed.data.idPhotoUrl,
          idNameOnDocument: parsed.data.idNameOnDocument,
          idVerifiedMatch: true,
          idMatchScore: kycResult.idMatchScore,
          role: 'FARMER',
        },
      });

      await tx.farm.create({
        data: {
          userId: data.user!.id,
          farmName: parsed.data.farmName,
          barangay: parsed.data.barangay,
          landArea: parsed.data.landArea,
          rsbsaNumber: parsed.data.rsbsaNumber,
          idType: idSpec.code,
          idNumber: parsed.data.idNumber,
          idPhotoUrl: parsed.data.idPhotoUrl,
          idDocumentUrl: parsed.data.idPhotoUrl,
          idNameOnDocument: parsed.data.idNameOnDocument,
          idVerifiedMatch: true,
          idMatchScore: kycResult.idMatchScore,
          farmDocUrl: parsed.data.farmDocUrl || null,
          status: 'PENDING',
        },
      });
    });
  } catch (dbError: any) {
    const adminClient = await import('@/lib/supabase/server').then((m) => m.createAdminClient());
    await (await adminClient).auth.admin.deleteUser(data.user.id);
    return {
      message: `Failed to create account in database: ${dbError?.message || 'Unknown error'}`,
    };
  }

  // Trigger notifications
  sendAdminNotification({
    type: 'NEW_USER',
    title: 'New Farmer Registration (100% KYC Match)',
    message: `${parsed.data.name} registered with RSBSA #${parsed.data.rsbsaNumber} and ${idSpec.shortLabel}.`,
    relatedId: data.user.id,
    relatedType: 'user',
  });
  sendAdminNotification({
    type: 'PENDING_FARMER',
    title: 'Farmer Pending LGU Verification',
    message: `${parsed.data.farmName} (${parsed.data.name}) passed 100% KYC Match. Review their uploaded ID to activate.`,
    relatedId: data.user.id,
    relatedType: 'farmer',
  });

  redirect('/auth/register/success?role=farmer');
}

// ─────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────
export async function forgotPasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get('email') as string,
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback/update-password`,
  });

  if (error) {
    if (error.message.includes('rate limit')) {
      return { message: 'Too many requests. Please try again later.' };
    }
  }

  return { message: 'success' };
}

// ─────────────────────────────────────────────────
// UPDATE PASSWORD
// ─────────────────────────────────────────────────
export async function updatePasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = updatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { message: error.message || 'Failed to update password. Please try again.' };
  }

  await supabase.auth.signOut();
  redirect('/auth/login?reset=success');
}

// ─────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
