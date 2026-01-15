/**
 * API Route: Fetch and Store Strava Activities
 *
 * GET /api/strava/activities
 * - Fetches activities from Strava API
 * - Scores and stores them in database
 * - Refreshes leaderboard materialized view
 * - Returns summary of sync operation
 */

import { NextResponse } from 'next/server';
import { fetchAllRecentClubActivities } from '@/lib/strava/api';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import { kv } from '@/lib/cache/redis';
import type { StravaAthlete } from '@/lib/strava/types';

const SYNC_CACHE_KEY = 'strava:last_sync';
const SYNC_CACHE_TTL = 5 * 60; // 5 minutes

export async function GET(request: Request) {
  try {
    // Check if we recently synced (avoid unnecessary API calls)
    const lastSync = await kv.get<number>(SYNC_CACHE_KEY);
    const now = Date.now();

    if (lastSync && now - lastSync < SYNC_CACHE_TTL * 1000) {
      return NextResponse.json({
        success: true,
        cached: true,
        message: 'Data recently synced, using cache',
        lastSync: new Date(lastSync).toISOString(),
      });
    }

    // Fetch activities from Strava club (ID: 1853738)
    // This gets us both activities AND athlete info in one call
    console.log('Fetching recent activities from Strava club (last 7 days)...');
    const activities = await fetchAllRecentClubActivities(1853738);

    // Extract unique athletes from activities
    const athleteMap = new Map<number, StravaAthlete>();
    activities.forEach((activity) => {
      if (activity.athlete && activity.athlete.id) {
        // Store unique athletes
        if (!athleteMap.has(activity.athlete.id)) {
          athleteMap.set(activity.athlete.id, {
            id: activity.athlete.id,
            username: '',
            firstname: '',
            lastname: '',
            profile: '',
          } as StravaAthlete);
        }
      }
    });

    const athletes = Array.from(athleteMap.values());

    // Store athletes in database
    console.log(`Storing ${athletes.length} athletes from activities...`);
    await upsertAthletes(athletes);

    // Score activities
    console.log(`Scoring ${activities.length} activities...`);
    const scoredActivities = scoreActivities(activities);

    // Store activities in database
    console.log('Storing activities in database...');
    await upsertActivities(scoredActivities);

    // Refresh leaderboard materialized view
    console.log('Refreshing weekly leaderboard...');
    await refreshWeeklyLeaderboard();

    // Update cache
    await kv.set(SYNC_CACHE_KEY, now, { ex: SYNC_CACHE_TTL });

    // Calculate statistics
    const swimmingCount = scoredActivities.filter((a) => a.is_swimming).length;
    const totalWeightedScore = scoredActivities.reduce(
      (sum, a) => sum + a.weighted_score,
      0
    );

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      stats: {
        athletes: athletes.length,
        totalActivities: scoredActivities.length,
        swimmingActivities: swimmingCount,
        totalWeightedScore: Math.round(totalWeightedScore),
      },
    });
  } catch (error) {
    console.error('Failed to sync Strava activities:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync activities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strava/activities
 * Force refresh (bypass cache)
 */
export async function POST(request: Request) {
  try {
    // Clear sync cache to force refresh
    await kv.del(SYNC_CACHE_KEY);

    // Call GET handler
    return GET(request);
  } catch (error) {
    console.error('Failed to force sync:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to force sync',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
