/**
 * API Route: Fetch HR Zone Data for All Athletes
 *
 * GET /api/team/hr-zones
 * - Returns HR zone distribution for all athletes
 * - Shows time spent in each zone (estimated from average HR)
 * - Only includes athletes with HR data from last 7 days
 * - Informational only - NOT used for leaderboard rankings
 */

import { NextResponse } from 'next/server';
import { getAthletes } from '@/lib/db/queries';
import { calculateAllAthleteZones, getWeekStartDate } from '@/lib/hr/zones';
import type { HRZoneResponse } from '@/lib/hr/types';

export async function GET() {
  try {
    console.log('Fetching HR zone data for all athletes...');

    // Get all athletes
    const athletes = await getAthletes();

    if (athletes.length === 0) {
      return NextResponse.json({
        athletes: [],
        metadata: {
          weekStartDate: getWeekStartDate(),
          lastUpdated: new Date().toISOString(),
        },
      } as HRZoneResponse);
    }

    // Calculate zone distribution for each athlete
    const athleteZones = await calculateAllAthleteZones(athletes);

    console.log(
      `  ✓ Calculated HR zones for ${athleteZones.length} athletes`
    );

    const response: HRZoneResponse = {
      athletes: athleteZones,
      metadata: {
        weekStartDate: getWeekStartDate(),
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch HR zone data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch HR zone data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
