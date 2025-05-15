'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(data.session?.user || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    const fetchUser = async () => {
      await refreshSession();

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          router.refresh();
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
          router.refresh();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    fetchUser();
  }, [supabase, router, refreshSession]);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  const value = {
    user,
    isLoading,
    signOut,
    refreshSession,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
