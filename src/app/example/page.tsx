'use client';

import Link from 'next/link';

import { useAuth } from '@/components/auth/AuthProvider';

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Appointment Reminders</h1>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              <p className="text-center">
                Welcome, <span className="font-semibold">{user.email}</span>
              </p>
              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition"
              >
                Sign In
              </Link>
              <p className="text-center text-sm text-gray-600">
                Sign in to access your appointment reminders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
