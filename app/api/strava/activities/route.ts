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
  fetchAuthenticatedUserActivities,
} from '@/lib/strava/api';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import { kv } from '@/lib/cache/redis';
import type { StravaActivity, StravaAthlete } from '@/lib/strava/types';

const SYNC_CACHE_KEY = 'strava:last_sync';
const SYNC_CACHE_TTL = 5 * 60; // 5 minutes

export async function GET(request: Request) {
  try {
    // Check if we recently synced (avoid unnecessary API calls)
    const kvInstance = kv(); // Call function to get KV
    const now = Date.now();

    if (kvInstance) {
      const lastSync = (await kvInstance.get(SYNC_CACHE_KEY)) as number | null;

      if (lastSync && now - lastSync < SYNC_CACHE_TTL * 1000) {
        return NextResponse.json({
          success: true,
          cached: true,
          message: 'Data recently synced, using cache',
          lastSync: new Date(lastSync).toISOString(),
        });
      }
    }

    // Fetch activities from authenticated user (coach)
    // NOTE: Due to Strava privacy, we can only fetch the coach's activities
    // Team members need to make activities public or OAuth individually
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    console.log('Fetching authenticated user activities...');

    // Fetch coach's activities
    const activities = await fetchAuthenticatedUserActivities(
      sevenDaysAgo,
      undefined,
      100 // Fetch more activities
    );

    console.log(`  ✓ Found ${activities.length} activities from authenticated user`);

    // Get authenticated athlete info
    const athlete = await fetchAuthenticatedAthlete();

    // Store athlete in database
    const athletes: StravaAthlete[] = [{
      id: athlete.id,
      username: athlete.username || '',
      firstname: athlete.firstname || '',
      lastname: athlete.lastname || '',
      profile: athlete.profile || '',
    }];

    console.log(`  ✓ Athlete: ${athlete.firstname} ${athlete.lastname} (ID: ${athlete.id})`);

    // Store athlete in database
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

    // Update cache (if available)
    if (kvInstance) {
      await kvInstance.set(SYNC_CACHE_KEY, now, { ex: SYNC_CACHE_TTL });
    }

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
    const kvInstance = kv(); // Call function to get KV
    if (kvInstance) {
      await kvInstance.del(SYNC_CACHE_KEY);
    }

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
