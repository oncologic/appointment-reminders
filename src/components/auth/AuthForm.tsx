'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

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
        console.log('User signed in, updating state...');
        setIsSignedIn(true);

        // Try automatic redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

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
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: {
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontWeight: '500'
              },
              container: {
                borderRadius: '0.5rem',
              },
              divider: {
                marginTop: '1.5rem',
                marginBottom: '1.5rem'
              },
              label: {
                color: '#4B5563',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }
            }
          }}
          view="sign_in"
          theme="default"
          showLinks={false}
          providers={['google']}
          redirectTo={`${origin}/`}
          onlyThirdPartyProviders={true}
        />
      )}
    </div>
  );
}
