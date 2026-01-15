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
  fetchAthleteActivities,
} from '@/lib/strava/api';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import { kv } from '@/lib/cache/redis';
import { getTeamMemberIds } from '@/lib/strava/team-members';
import type { StravaActivity, StravaAthlete } from '@/lib/strava/types';

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

    // Fetch activities from all team members
    // Team member IDs are maintained in lib/strava/team-members.ts
    const teamMemberIds = getTeamMemberIds();
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    console.log(`Fetching activities for ${teamMemberIds.length} team members...`);

    // Fetch activities for each team member
    const allActivities: StravaActivity[] = [];
    const athletes: StravaAthlete[] = [];

    for (const athleteId of teamMemberIds) {
      try {
        console.log(`  Fetching activities for athlete ID: ${athleteId}`);

        const activities = await fetchAthleteActivities(
          athleteId,
          sevenDaysAgo,
          undefined,
          30
        );

        allActivities.push(...activities);
        console.log(`    ✓ Found ${activities.length} activities`);

        // Extract athlete info from activities
        if (activities.length > 0 && activities[0].athlete) {
          // Note: Activities only have athlete.id, not full athlete details
          // We'll store minimal athlete records
          athletes.push({
            id: athleteId,
            username: '',
            firstname: '',
            lastname: '',
            profile: '',
          });
        }
      } catch (error) {
        console.error(`    ✗ Failed to fetch activities for athlete ${athleteId}:`, error);
        // Continue with other athletes even if one fails
      }
    }

    console.log(`Total activities fetched: ${allActivities.length}`);

    // Store athletes in database
    if (athletes.length > 0) {
      await upsertAthletes(athletes);
    }

    const activities = allActivities;

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
        teamMembers: teamMemberIds.length,
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
