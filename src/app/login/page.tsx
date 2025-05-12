'use client'

import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Sign In or Sign Up</h1>
      <AuthForm />
    </div>
  )
} 