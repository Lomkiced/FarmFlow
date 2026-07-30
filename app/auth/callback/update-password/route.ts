import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Successfully authenticated via invite/reset link.
      // Redirect to the update password page to set a new password.
      return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin));
    }
  }

  // Fallback redirect if something fails
  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', requestUrl.origin));
}
