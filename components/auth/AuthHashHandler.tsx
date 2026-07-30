'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const supabase = createClient();
        
        // Manually and deterministically set the session from the URL
        supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
          if (!error && data.session) {
            // Clear the hash from the URL visually
            window.history.replaceState(null, '', window.location.pathname);
            
            // Force redirect to update password page
            router.push('/auth/update-password');
          }
        });
      }
    }
  }, [router]);

  return null;
}
