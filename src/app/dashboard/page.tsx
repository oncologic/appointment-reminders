'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { user, isLoading, refreshSession, signOut } = useAuth();

  useEffect(() => {
    // Force a session refresh when the dashboard loads
    const checkSession = async () => {
      await refreshSession();
    };

    checkSession();
  }, [user, isLoading, refreshSession]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {user && (
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            {user ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}</h2>
                <p className="mb-4">
                  This is a protected page that only authenticated users can access.
                </p>
                <div className="bg-gray-100 p-4 rounded-md mb-4 dark:bg-gray-700">
                  <h3 className="text-md font-semibold mb-2">Debug Info:</h3>
                  <p>User ID: {user.id}</p>
                  <p>Email: {user.email}</p>
                  <p>Auth Provider: {user.app_metadata?.provider || 'unknown'}</p>
                </div>
              </>
            ) : (
              <p>Loading user information...</p>
            )}

            <div className="mt-6">
              <Link
                href="/"
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
