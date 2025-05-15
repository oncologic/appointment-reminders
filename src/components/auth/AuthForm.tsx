'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { FaCheckCircle, FaGoogle, FaSpinner } from 'react-icons/fa';

import { createBrowserSupabaseClient } from '@/lib/supabase';

interface AuthFormProps {
  next?: string;
}

export default function AuthForm({ next = '/' }: AuthFormProps) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserSupabaseClient> | null>(
    null
  );
  const [origin, setOrigin] = useState<string>('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    setSupabase(client);
    setOrigin(window.location.origin);

    // Check if user is already signed in
    const checkUser = async () => {
      const { data } = await client.auth.getSession();
      setIsSignedIn(!!data.session);
    };
    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // User signed in, update state
        setIsSignedIn(true);

        // Try automatic redirect
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!supabase) return;

    try {
      setIsLoading(true);
      setMessage('');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Check your email for the login link');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setMessage('Error sending magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) return;

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setMessage('Error signing in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  if (!supabase || !origin) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm flex justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      {isSignedIn ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <FaCheckCircle className="text-2xl text-green-600" />
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Successfully signed in!</p>
          <p className="text-gray-600 mb-6">
            If you're not automatically redirected, please click the button below.
          </p>
          <button
            onClick={() => router.push('/')}
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Send Magic Link'}
            </button>
          </form>

          {message && (
            <div className="text-sm text-center font-medium text-blue-600">{message}</div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FaGoogle className="mr-2 text-red-600" />
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
