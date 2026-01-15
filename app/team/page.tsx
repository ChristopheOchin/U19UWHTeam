/**
 * Team Dashboard Page
 *
 * Main leaderboard and training activity view
 * (Placeholder for now - will build full leaderboard in Phase 3)
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Training Leaderboard - U19 USA Underwater Hockey',
  description: 'Team training activity and leaderboard',
};

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Training Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">
                Last 7 Days | Real-time updates
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              You've successfully accessed the team area. The full training
              leaderboard will be built in Phase 3.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-3">
                Coming Soon:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">🏊</span>
                  <span>
                    Weekly leaderboard with 1.5x swimming activity multiplier
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>
                    Rankings based on activity count (60%) + weighted score
                    (40%)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔥</span>
                  <span>Real-time updates via Strava webhooks</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">❤️</span>
                  <span>
                    HR Intensity Dashboard (informational - doesn't affect
                    rankings)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📱</span>
                  <span>Mobile-responsive design with FOMO elements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
