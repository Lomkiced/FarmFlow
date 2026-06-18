import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'FARMER' | 'BUYER';
  avatarUrl: string | null;
  farmId?: string | null;
  farmStatus?: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | null;
};

// ─── Core Session Verification ───────────────────────────────────────────────

/**
 * Verifies the current Supabase session and returns the DB user profile.
 * Results are memoized per request via React's `cache()`.
 * Returns null if unauthenticated (does NOT redirect).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  );

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) return null;

  // Fetch the full profile from our DB (role is source of truth here)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      farm: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as SessionUser['role'],
    avatarUrl: dbUser.avatarUrl,
    farmId: dbUser.farm?.id ?? null,
    farmStatus: dbUser.farm?.status as SessionUser['farmStatus'] ?? null,
  };
});

// ─── Authorization Guards ─────────────────────────────────────────────────────

/**
 * Requires an authenticated session. Redirects to /auth/login if not.
 * Use in Server Actions and Server Components that require login.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');
  return user;
}

/**
 * Requires a specific role. Redirects to the appropriate dashboard if wrong role.
 * Use this at the top of admin/farmer-only server actions.
 */
export async function requireRole(
  role: 'ADMIN' | 'FARMER' | 'BUYER'
): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    if (user.role === 'ADMIN') redirect('/admin');
    if (user.role === 'FARMER') redirect('/farmer/dashboard');
    redirect('/products');
  }
  return user;
}

/**
 * Requires FARMER role and returns the farm ID.
 * Redirects if the user is not a verified farmer.
 */
export async function requireFarmer(): Promise<SessionUser & { farmId: string }> {
  const user = await requireRole('FARMER');
  if (!user.farmId) {
    // Farmer account exists but no farm row — data integrity issue
    redirect('/auth/login');
  }

  if (user.farmStatus !== 'VERIFIED') {
    redirect('/auth/login');
  }

  return { ...user, farmId: user.farmId! };
}

/**
 * Requires ADMIN role. Redirects if not admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('ADMIN');
}
