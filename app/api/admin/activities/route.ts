/**
 * Admin API Route: Manually Add Activities
 *
 * POST /api/admin/activities
 * - Accepts activity data for any athlete
 * - Intended for manual data entry (e.g., via Claude Desktop scraping Strava)
 * - Requires admin authentication
 */

import { NextResponse } from 'next/server';
import { scoreActivities } from '@/lib/scoring/activities';
import {
  upsertAthletes,
  upsertActivities,
  refreshWeeklyLeaderboard,
} from '@/lib/db/queries';
import type { StravaActivity, StravaAthlete } from '@/lib/strava/types';

// Simple admin key authentication
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'change-me-in-production';

interface AdminActivitySubmission {
  athlete: {
    id: number;
    username?: string;
    firstname: string;
    lastname: string;
    profile?: string;
  };
  activities: Array<{
    id: number;
    name: string;
    type: string;
    sport_type?: string;
    start_date: string; // ISO 8601
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time?: number;
    average_heartrate?: number;
    max_heartrate?: number;
  }>;
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');

    if (providedKey !== ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as AdminActivitySubmission;

    // Validate required fields
    if (!body.athlete || !body.activities) {
      return NextResponse.json(
        { success: false, error: 'Missing athlete or activities data' },
        { status: 400 }
      );
    }

    console.log(`\n📝 Manual activity submission for athlete ${body.athlete.id}...`);

    // Prepare athlete data
    const athlete: StravaAthlete = {
      id: body.athlete.id,
      username: body.athlete.username || '',
      firstname: body.athlete.firstname,
      lastname: body.athlete.lastname,
      profile: body.athlete.profile || '',
    };

    // Prepare activity data (convert to StravaActivity format)
    const activities: StravaActivity[] = body.activities.map((activity) => ({
      id: activity.id,
      athlete: { id: body.athlete.id },
      name: activity.name,
      type: activity.type,
      sport_type: activity.sport_type,
      start_date: activity.start_date,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time || activity.moving_time,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
    }));

    console.log(`  ✓ ${activities.length} activities to add`);

    // Store athlete in database
    await upsertAthletes([athlete]);

    // Score activities
    console.log('Scoring activities...');
    const scoredActivities = scoreActivities(activities);

    // Store activities in database
    console.log('Storing activities in database...');
    await upsertActivities(scoredActivities);

    // Refresh leaderboard materialized view
    console.log('Refreshing weekly leaderboard...');
    await refreshWeeklyLeaderboard();

    // Calculate statistics
    const swimmingCount = scoredActivities.filter((a) => a.is_swimming).length;
    const totalWeightedScore = scoredActivities.reduce(
      (sum, a) => sum + a.weighted_score,
      0
    );

    console.log(`  ✓ Added ${activities.length} activities (${swimmingCount} swims)`);
    console.log(`  ✓ Total weighted score: ${Math.round(totalWeightedScore)}`);

    return NextResponse.json({
      success: true,
      athlete: {
        id: athlete.id,
        name: `${athlete.firstname} ${athlete.lastname}`,
      },
      stats: {
        totalActivities: activities.length,
        swimmingActivities: swimmingCount,
        totalWeightedScore: Math.round(totalWeightedScore),
      },
    });
  } catch (error) {
    console.error('Failed to add manual activities:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add activities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/activities
 * - Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Admin activities endpoint is ready',
    usage: 'POST with admin key to add activities',
  });
}
