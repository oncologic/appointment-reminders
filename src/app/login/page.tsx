'use client'

import AuthForm from '@/components/auth/AuthForm'
import { FaUserMd } from 'react-icons/fa'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <FaUserMd className="text-2xl text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to HealthTracker</h1>
        <p className="text-gray-600">Sign in to access your health dashboard</p>
      </div>
      <AuthForm />
    </div>
  )
} 