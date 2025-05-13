import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface UseUserResult {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if user is authenticated
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Then fetch user profile
      const response = await fetch('/api/users/me');
      
      if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.status}`);
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    await fetchUser();
  };

  return { user, isLoading, error, isAuthenticated, refetch };
}

export default useUser; 