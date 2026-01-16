/**
 * Leaderboard Container Component
 *
 * Main leaderboard with 30-second polling for real-time updates
 * Layout: 60% leaderboard, 40% activity feed (desktop)
 *         Stacked (mobile)
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { LeaderboardResponse } from '@/lib/leaderboard/types';
import AthleteCard from './AthleteCard';
import ActivityFeed from './ActivityFeed';

interface LeaderboardProps {
  initialData: LeaderboardResponse;
}

export default function Leaderboard({ initialData }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/leaderboard/data');

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const newData = await response.json();
      setData(newData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to update leaderboard');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set up 30-second polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Training Leaderboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Last 7 Days
                {lastUpdate && (
                  <span className="ml-2">
                    · Updated {formatTimeAgo(lastUpdate)}
                  </span>
                )}
                {isUpdating && (
                  <span className="ml-2 text-blue-600">· Updating...</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/team/hr-zones"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                📊 HR Zones
              </Link>
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Website
              </a>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-red-800">{error}</span>
              <button
                onClick={fetchLeaderboard}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Leaderboard - 60% on desktop */}
          <div className="w-full lg:w-[60%]">
            {data.leaderboard.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">🏊</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  No Athletes Yet
                </h2>
                <p className="text-gray-600">
                  Log activities on Strava to appear on the leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.leaderboard.map((athlete) => (
                  <AthleteCard key={athlete.athleteId} athlete={athlete} />
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed - 40% on desktop */}
          <div className="w-full lg:w-[40%]">
            <div className="lg:sticky lg:top-24">
              <ActivityFeed activities={data.activityFeed} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Simple time ago formatter for header
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}
