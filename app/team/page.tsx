/**
 * Team Dashboard Page
 *
 * Training leaderboard with real-time updates
 */

import { Metadata } from 'next';
import Leaderboard from '@/components/team/Leaderboard';
import type { LeaderboardResponse } from '@/lib/leaderboard/types';

export const metadata: Metadata = {
  title: 'Training Leaderboard - U19 USA Underwater Hockey',
  description: 'Team training activity and leaderboard',
};

// Disable caching for this page (always fetch fresh data)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TeamPage() {
  // Fetch initial leaderboard data server-side
  let initialData: LeaderboardResponse;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/leaderboard/data`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard data');
    }

    initialData = await response.json();
  } catch (error) {
    console.error('Error fetching initial leaderboard data:', error);

    // Return empty data if fetch fails
    initialData = {
      leaderboard: [],
      activityFeed: [],
      metadata: {
        weekStartDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalAthletes: 0,
      },
    };
  }

  return <Leaderboard initialData={initialData} />;
}
