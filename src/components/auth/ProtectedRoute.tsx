'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshSession } = useAuth()
  const router = useRouter()
  const [hasCheckedSession, setHasCheckedSession] = useState(false)

  useEffect(() => {
    // Ensure we refresh the session on mount
    const checkSession = async () => {
      if (!hasCheckedSession) {
        console.log('ProtectedRoute: Initial session check')
        await refreshSession()
        setHasCheckedSession(true)
      }
    }
    
    checkSession()
  }, [refreshSession, hasCheckedSession])

  useEffect(() => {
    // Only redirect if we've finished loading and checked the session
    if (!isLoading && hasCheckedSession && !user) {
      console.log('ProtectedRoute: No authenticated user, redirecting to login')
      router.push('/login')
    } else if (!isLoading && hasCheckedSession && user) {
      console.log('ProtectedRoute: User is authenticated:', user.email)
    }
  }, [isLoading, user, router, hasCheckedSession])

  if (isLoading || !hasCheckedSession) {
    console.log('ProtectedRoute: Loading state', { isLoading, hasCheckedSession })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If user is authenticated, render the children
  if (user) {
    return <>{children}</>
  }

  // This return is just for React, the actual redirect happens in the useEffect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
} 