import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { apiGet } from '@/lib/api';
import { useAuthStore, type UserProfile, type Family, type Child } from '@/stores/auth-store';

interface MeResponse {
  user: UserProfile;
  family: Family;
  children: Array<{
    id: string;
    name: string;
    date_of_birth: string;
    interests: string[];
    school_status: string;
  }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setProfile, setFamily, setChildren, setLoading, setInitialized, reset } =
    useAuthStore();

  const loadUserData = useCallback(async () => {
    try {
      const { data } = await apiGet<MeResponse>('/me');
      setProfile(data.user);
      setFamily(data.family);

      // Calculate ages
      const childrenWithAges: Child[] = data.children.map((c) => {
        const dob = new Date(c.date_of_birth);
        const age = Math.floor(
          (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        return { ...c, age };
      });
      setChildren(childrenWithAges);
    } catch {
      // User data load failed - might be a new user without profile
    }
  }, [setProfile, setFamily, setChildren]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData().finally(() => {
          setLoading(false);
          setInitialized(true);
        });
      } else {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        await loadUserData();
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        reset();
        setInitialized(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading, setInitialized, loadUserData, reset]);

  return <>{children}</>;
}
