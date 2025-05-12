'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  next?: string;
}

export default function AuthForm({ next = '/' }: AuthFormProps) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserSupabaseClient> | null>(null)
  const [origin, setOrigin] = useState<string>('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const client = createBrowserSupabaseClient()
    setSupabase(client)
    setOrigin(window.location.origin)

    // Check if user is already signed in
    const checkUser = async () => {
      const { data } = await client.auth.getSession()
      setIsSignedIn(!!data.session)
    }
    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // User signed in, update state
        console.log('User signed in, updating state...')
        setIsSignedIn(true)
        
        // Try automatic redirect
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (!supabase || !origin) return <div>Loading...</div>

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {isSignedIn ? (
        <div className="text-center my-8">
          <p className="text-green-500 mb-4">Successfully signed in!</p>
          <p className="text-gray-300 mb-6">If you're not automatically redirected, please click the button below.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="sign_in"
          theme="dark"
          showLinks={true}
          providers={['google']}
          redirectTo={`${origin}/dashboard`}
          onlyThirdPartyProviders={false}
        />
      )}
    </div>
  )
} 