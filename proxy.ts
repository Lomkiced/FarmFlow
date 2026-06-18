import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Role-based route protection matrix
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/farmer': ['FARMER'],
};

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Build Supabase server client that can refresh session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Always call getUser() to refresh the session token
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── If not logged in ──────────────────────────────────────────────────────
  if (!user) {
    // Block protected routes
    const isProtected = Object.keys(PROTECTED_ROUTES).some(prefix =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (isProtected) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // ── User is logged in ─────────────────────────────────────────────────────
  // Read role from JWT user_metadata (set during signup/seeding).
  // This avoids a DB roundtrip in the proxy and bypasses RLS issues
  // with the Prisma-managed User table.
  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase();

  // Redirect away from auth pages if already logged in
  if (AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'FARMER') return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
    return NextResponse.redirect(new URL('/products', request.url));
  }

  // Enforce role-based access for protected routes
  for (const [prefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!role || !allowedRoles.includes(role)) {
        // Wrong role — send to their own dashboard
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'FARMER') return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
        return NextResponse.redirect(new URL('/products', request.url));
      }
      break;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
