import { createBrowserClient } from '@supabase/ssr'
import { createClient } from './supabase/client'

// For client-side usage
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Supabase client for client-side operations
 * This is a convenience export of the client
 */
export const supabase = createClient(); 