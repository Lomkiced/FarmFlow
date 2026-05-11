'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, type AuthUser } from '@/store/authStore';

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('User')
          .select('id, name, email, role, avatarUrl, farm:Farm(status)')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          const farmRow = Array.isArray(profile.farm) ? profile.farm[0] : profile.farm;
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as AuthUser['role'],
            avatarUrl: profile.avatarUrl,
            farmStatus: farmRow?.status ?? null,
          });
        } else {
          clearUser();
        }
      } else {
        clearUser();
      }
    };

    getInitialSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('User')
            .select('id, name, email, role, avatarUrl, farm:Farm(status)')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const farmRow = Array.isArray(profile.farm) ? profile.farm[0] : profile.farm;
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as AuthUser['role'],
              avatarUrl: profile.avatarUrl,
              farmStatus: farmRow?.status ?? null,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          clearUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}