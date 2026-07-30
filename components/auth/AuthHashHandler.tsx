'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const supabase = createClient();
      
      // Supabase automatically parses the hash and sets the session.
      supabase.auth.getSession().then(({ data, error }) => {
        if (!error && data.session) {
          // If it was a password recovery or an invite link
          if (hash.includes('type=recovery') || hash.includes('type=invite')) {
            // Clear the hash from the URL visually
            window.history.replaceState(null, '', window.location.pathname);
            
            // Force redirect to update password page
            router.push('/auth/update-password');
          }
        }
      });
    }
  }, [router]);

  return null;
}
