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
  fetchPublicAthlete,
  fetchPublicAthleteActivities,
} from '@/lib/strava/api';
import { getTeamMemberIds } from '@/lib/strava/team-members';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import { kv } from '@/lib/cache/redis';
import type { StravaActivity, StravaAthlete } from '@/lib/strava/types';

const SYNC_CACHE_KEY = 'strava:last_sync';
const SYNC_CACHE_TTL = 30; // 30 seconds (matches frontend polling)

export async function GET(request: Request) {
  try {
    // Check if we recently synced (avoid unnecessary API calls)
    const kvInstance = kv(); // Call function to get KV
    const now = Date.now();

    if (kvInstance) {
      const lastSync = (await kvInstance.get(SYNC_CACHE_KEY)) as number | null;

      if (lastSync && now - lastSync < SYNC_CACHE_TTL * 1000) {
        const secondsAgo = Math.floor((now - lastSync) / 1000);
        console.log(`⚡ Cache hit: Last sync ${secondsAgo}s ago, skipping Strava API calls`);
        return NextResponse.json({
          success: true,
          cached: true,
          message: 'Data recently synced, using cache',
          lastSync: new Date(lastSync).toISOString(),
          secondsSinceLastSync: secondsAgo,
        });
      }
    }

    // Get all team member IDs
    const teamMemberIds = getTeamMemberIds();
    console.log(`\n🏊 Syncing activities for ${teamMemberIds.length} team members...`);

    // Fetch activities from last 7 days
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    // Track results per athlete
    const athleteResults: Array<{
      athleteId: number;
      name: string;
      activityCount: number;
      status: 'success' | 'private' | 'error';
      error?: string;
    }> = [];

    const allActivities: StravaActivity[] = [];
    const validAthletes: StravaAthlete[] = [];

    // Fetch activities for each team member
    // Use sequential fetching with rate limiting already handled by rateLimiter
    for (const athleteId of teamMemberIds) {
      try {
        console.log(`\n  Fetching athlete ${athleteId}...`);

        // Fetch athlete profile
        const athlete = await fetchPublicAthlete(athleteId);

        if (!athlete) {
          console.log(`    ⚠️  Profile not accessible (private or not found)`);
          athleteResults.push({
            athleteId,
            name: 'Unknown',
            activityCount: 0,
            status: 'private',
            error: 'Profile not accessible',
          });
          continue;
        }

        // Fetch activities for this athlete
        const activities = await fetchPublicAthleteActivities(
          athleteId,
          sevenDaysAgo,
          undefined,
          100 // Fetch up to 100 activities
        );

        const athleteName = `${athlete.firstname} ${athlete.lastname}`;

        if (activities.length === 0) {
          console.log(`    ℹ️  ${athleteName}: No public activities found`);
          athleteResults.push({
            athleteId,
            name: athleteName,
            activityCount: 0,
            status: 'success',
          });
        } else {
          console.log(`    ✓  ${athleteName}: ${activities.length} activities`);
          athleteResults.push({
            athleteId,
            name: athleteName,
            activityCount: activities.length,
            status: 'success',
          });
        }

        // Add to collections
        allActivities.push(...activities);
        validAthletes.push({
          id: athlete.id,
          username: athlete.username || '',
          firstname: athlete.firstname || '',
          lastname: athlete.lastname || '',
          profile: athlete.profile || '',
        });
      } catch (error) {
        console.log(`    ❌  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        athleteResults.push({
          athleteId,
          name: 'Unknown',
          activityCount: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`\n✓ Fetched ${allActivities.length} total activities from ${validAthletes.length} athletes`);

    // Store athletes in database
    if (validAthletes.length > 0) {
      console.log('Storing athletes in database...');
      await upsertAthletes(validAthletes);
    }

    // Score all activities
    if (allActivities.length > 0) {
      console.log(`Scoring ${allActivities.length} activities...`);
      const scoredActivities = scoreActivities(allActivities);

      // Store activities in database
      console.log('Storing activities in database...');
      await upsertActivities(scoredActivities);

      // Calculate statistics
      const swimmingCount = scoredActivities.filter((a) => a.is_swimming).length;
      const totalWeightedScore = scoredActivities.reduce(
        (sum, a) => sum + a.weighted_score,
        0
      );

      console.log(`  ✓ ${swimmingCount} swimming activities`);
      console.log(`  ✓ Total weighted score: ${Math.round(totalWeightedScore)}`);
    }

    // Refresh leaderboard materialized view
    console.log('Refreshing weekly leaderboard...');
    await refreshWeeklyLeaderboard();

    // Update cache (if available)
    if (kvInstance) {
      await kvInstance.set(SYNC_CACHE_KEY, now, { ex: SYNC_CACHE_TTL });
    }

    // Prepare summary
    const successfulAthletes = athleteResults.filter((a) => a.status === 'success');
    const privateAthletes = athleteResults.filter((a) => a.status === 'private');
    const errorAthletes = athleteResults.filter((a) => a.status === 'error');

    const swimmingCount = allActivities.filter((a) =>
      scoreActivities([a])[0]?.is_swimming
    ).length;
    const totalWeightedScore = scoreActivities(allActivities).reduce(
      (sum, a) => sum + a.weighted_score,
      0
    );

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      summary: {
        totalAthletes: teamMemberIds.length,
        successfulAthletes: successfulAthletes.length,
        privateAthletes: privateAthletes.length,
        errorAthletes: errorAthletes.length,
        totalActivities: allActivities.length,
        swimmingActivities: swimmingCount,
        totalWeightedScore: Math.round(totalWeightedScore),
      },
      athletes: athleteResults,
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
