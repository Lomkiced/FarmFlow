import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();

    // Exchange the auth code for a session (PKCE flow)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Determine where to redirect based on role in DB
      const profile = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { role: true },
      });

      if (profile?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin));
      }
      if (profile?.role === 'FARMER') {
        return NextResponse.redirect(new URL('/farmer/dashboard', requestUrl.origin));
      }
      if (profile?.role === 'BUYER') {
        return NextResponse.redirect(new URL(next === '/' ? '/products' : next, requestUrl.origin));
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', requestUrl.origin));
}