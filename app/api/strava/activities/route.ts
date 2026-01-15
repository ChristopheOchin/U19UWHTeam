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
import {
  fetchAuthenticatedAthlete,
  fetchAuthenticatedAthleteActivities,
} from '@/lib/strava/api';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import { kv } from '@/lib/cache/redis';

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

    // NOTE: Strava's club activities endpoint doesn't provide full activity data
    // (no IDs, no dates, no athlete IDs). We use the authenticated athlete endpoint instead.
    //
    // For testing: Fetches coach's activities
    // For production: Expand to fetch all team member activities using stored athlete IDs
    // See: lib/strava/team-members.ts for team member ID management

    console.log('Fetching authenticated athlete info...');
    const athlete = await fetchAuthenticatedAthlete();

    console.log(`Authenticated as: ${athlete.firstname} ${athlete.lastname} (ID: ${athlete.id})`);

    // Store athlete in database
    await upsertAthletes([athlete]);

    // Fetch activities for the last 7 days
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    console.log('Fetching activities from last 7 days...');
    const activities = await fetchAuthenticatedAthleteActivities(sevenDaysAgo, undefined, 200);

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
      athlete: {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`,
      },
      stats: {
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
