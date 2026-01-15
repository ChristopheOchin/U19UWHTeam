/**
 * Team Login Page
 *
 * Password-protected entry to team area
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import PasswordForm from '@/components/auth/PasswordForm';

export const metadata: Metadata = {
  title: 'Team Login - U19 USA Underwater Hockey',
  description: 'Access the U19 team training leaderboard',
};

export default function TeamLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">
              U19 USA UWH
            </h1>
            <p className="text-cyan-200">Training Leaderboard</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Team Members Only
            </h2>
            <p className="text-gray-600 text-sm">
              Enter the team password to access the training leaderboard
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <PasswordForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Don't have the password?{' '}
              <span className="font-medium">Contact your coach</span>
            </p>
          </div>
        </div>

        {/* Back to public site */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white hover:text-cyan-200 text-sm transition-colors"
          >
            ← Back to Team Website
          </Link>
        </div>
      </div>
    </div>
  );
}
