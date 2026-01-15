/**
 * Leaderboard Data API Endpoint
 *
 * GET /api/leaderboard/data
 * Returns ranked athletes with FOMO metrics and recent activity feed
 */

import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import {
  getWeeklyLeaderboard,
  getRecentActivities,
  getAthletes,
} from '@/lib/db/queries';
import { calculateSmartStreak } from '@/lib/leaderboard/streaks';
import { formatTimeAgo, isWithinHours } from '@/lib/leaderboard/utils';
import { isSwimmingActivity } from '@/lib/scoring/activities';
import type {
  LeaderboardResponse,
  EnrichedLeaderboardEntry,
  ActivityFeedItem,
} from '@/lib/leaderboard/types';

const CACHE_KEY = 'leaderboard:enriched';
const CACHE_TTL = 30; // 30 seconds (matches client polling interval)

export async function GET() {
  try {
    // Check cache first
    const cached = await kv.get<LeaderboardResponse>(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch fresh data
    const data = await fetchLeaderboardData();

    // Store in cache
    await kv.set(CACHE_KEY, data, { ex: CACHE_TTL });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

/**
 * Fetch and enrich leaderboard data with FOMO metrics
 */
async function fetchLeaderboardData(): Promise<LeaderboardResponse> {
  // Fetch base data
  const [leaderboardEntries, recentActivities, athletes] = await Promise.all([
    getWeeklyLeaderboard(),
    getRecentActivities(20),
    getAthletes(),
  ]);

  // Build athlete lookup map
  const athleteMap = new Map(athletes.map((a) => [a.id, a]));

  // Enrich leaderboard entries with FOMO metrics
  const enrichedLeaderboard = await Promise.all(
    leaderboardEntries.map(async (entry, index) => {
      const rank = index + 1;
      const leaderScore = leaderboardEntries[0]?.composite_score || 0;
      const previousScore =
        index > 0 ? leaderboardEntries[index - 1].composite_score : 0;

      // Calculate gaps
      const gapBehindLeader = Math.max(0, leaderScore - entry.composite_score);
      const gapBehindNext = index > 0 ? previousScore - entry.composite_score : 0;

      // Calculate swimming percentage
      const swimmingPercentage =
        entry.total_activities > 0
          ? (entry.swimming_activities / entry.total_activities) * 100
          : 0;

      const isSwimmingDominant = swimmingPercentage >= 50;

      // Calculate streak (cached)
      const streak = await calculateSmartStreak(entry.athlete_id);

      // Check if recent activity (< 6 hours)
      const hasRecentActivity = isWithinHours(entry.last_activity_at, 6);

      const enriched: EnrichedLeaderboardEntry = {
        athleteId: entry.athlete_id,
        rank,
        username: entry.username,
        firstname: entry.firstname,
        lastname: entry.lastname,
        profilePictureUrl: entry.profile_picture_url,
        totalActivities: entry.total_activities,
        swimmingActivities: entry.swimming_activities,
        totalWeightedScore: entry.total_weighted_score,
        compositeScore: entry.composite_score,
        lastActivityAt: entry.last_activity_at
          ? entry.last_activity_at.toISOString()
          : null,
        gapBehindLeader,
        gapBehindNext,
        swimmingPercentage,
        isSwimmingDominant,
        streak,
        hasRecentActivity,
      };

      return enriched;
    })
  );

  // Build activity feed
  const activityFeed: ActivityFeedItem[] = recentActivities.map((activity) => {
    const athlete = athleteMap.get(activity.athlete_id);
    const startDate = new Date(activity.start_date);

    return {
      id: activity.id,
      athleteId: activity.athlete_id,
      athleteFirstname: athlete?.firstname || 'Unknown',
      athleteLastname: athlete?.lastname || '',
      type: activity.type,
      name: activity.name,
      isSwimming: isSwimmingActivity({
        type: activity.type,
        sport_type: activity.type, // Use type as fallback for sport_type
        name: activity.name,
      } as any),
      weightedScore: activity.weighted_score,
      startDate: startDate.toISOString(),
      timeAgo: formatTimeAgo(startDate),
    };
  });

  // Calculate week start date (last Monday)
  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  return {
    leaderboard: enrichedLeaderboard,
    activityFeed,
    metadata: {
      weekStartDate: weekStart.toISOString(),
      lastUpdated: new Date().toISOString(),
      totalAthletes: enrichedLeaderboard.length,
    },
  };
}
