/**
 * HR Zone Distribution Calculations
 *
 * Calculates time spent in each HR zone per athlete based on activities from last 7 days.
 * Uses simplified estimation: entire activity duration assigned to zone of average HR.
 */

import { getAthleteActivities, type DBThlete } from '@/lib/db/queries';
import { calculateHRZoneStats } from '@/lib/scoring/heartrate';
import type { HRZoneData, AthleteHRZoneData } from './types';

/**
 * Calculate HR zone distribution for a single athlete
 *
 * @param athleteId - Athlete ID from database
 * @param maxHeartrate - Athlete's max heart rate (default 190)
 * @returns HR zone data or null if no HR data available
 */
export async function calculateAthleteZoneDistribution(
  athleteId: number,
  maxHeartrate = 190
): Promise<HRZoneData | null> {
  // Fetch activities from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activities = await getAthleteActivities(athleteId, sevenDaysAgo);

  // Filter activities with HR data
  const activitiesWithHR = activities.filter(
    (a) => a.average_heartrate !== null && a.average_heartrate !== undefined
  );

  if (activitiesWithHR.length === 0) {
    return null; // No HR data available
  }

  // Calculate zone statistics using existing function
  const hrStats = calculateHRZoneStats(
    activitiesWithHR.map((a) => ({
      id: a.id,
      athlete: { id: athleteId },
      name: a.name,
      type: a.type,
      sport_type: a.type, // Use type as sport_type
      distance: a.distance || 0,
      moving_time: a.moving_time || 0,
      elapsed_time: a.moving_time || 0, // Use moving_time as elapsed_time
      total_elevation_gain: a.total_elevation_gain || 0,
      start_date: a.start_date.toISOString(),
      start_date_local: a.start_date.toISOString(),
      timezone: 'UTC',
      has_heartrate: true,
      average_heartrate: a.average_heartrate!,
      max_heartrate: a.max_heartrate || maxHeartrate,
    })),
    maxHeartrate
  );

  return {
    zone1Minutes: Math.round(hrStats.zoneMinutes.z1),
    zone2Minutes: Math.round(hrStats.zoneMinutes.z2),
    zone3Minutes: Math.round(hrStats.zoneMinutes.z3),
    zone4Minutes: Math.round(hrStats.zoneMinutes.z4),
    zone5Minutes: Math.round(hrStats.zoneMinutes.z5),
    totalMinutes: Math.round(hrStats.totalHRMinutes),
    activitiesWithHR: hrStats.activitiesWithHR,
  };
}

/**
 * Calculate HR zone distribution for all athletes
 *
 * @param athletes - Array of athletes from database
 * @returns Array of athlete HR zone data
 */
export async function calculateAllAthleteZones(
  athletes: DBThlete[]
): Promise<AthleteHRZoneData[]> {
  const athleteZones = await Promise.all(
    athletes.map(async (athlete) => {
      const hrZoneData = await calculateAthleteZoneDistribution(
        athlete.id,
        athlete.max_heartrate || 190
      );

      return {
        athleteId: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        profilePictureUrl: athlete.profile_picture_url,
        maxHeartrate: athlete.max_heartrate || 190,
        hrZoneData,
      };
    })
  );

  return athleteZones;
}

/**
 * Get week start date for metadata
 */
export function getWeekStartDate(): string {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return weekAgo.toISOString().split('T')[0];
}
