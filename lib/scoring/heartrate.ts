/**
 * Heart Rate Zone Calculations
 *
 * IMPORTANT: HR zone data is INFORMATIONAL ONLY and NOT used in leaderboard rankings.
 * This ensures fairness for athletes without HR monitors.
 *
 * Zones based on percentage of max heart rate:
 * - Zone 1: 50-60% (Recovery)
 * - Zone 2: 60-70% (Endurance)
 * - Zone 3: 70-80% (Tempo)
 * - Zone 4: 80-90% (Threshold)
 * - Zone 5: 90-100% (VO2 Max / Anaerobic)
 */

import type { StravaActivity } from '../strava/types';

export interface HRZoneDistribution {
  z1: number; // minutes in zone 1
  z2: number; // minutes in zone 2
  z3: number; // minutes in zone 3
  z4: number; // minutes in zone 4
  z5: number; // minutes in zone 5
}

export interface HRZoneStats {
  zoneMinutes: HRZoneDistribution;
  totalHRMinutes: number;
  totalActivities: number;
  activitiesWithHR: number;
  hasHRData: boolean;
}

/**
 * Determine which HR zone a given heart rate falls into
 */
export function getHRZone(heartRate: number, maxHR: number): number {
  const percent = (heartRate / maxHR) * 100;

  if (percent >= 90) return 5;
  if (percent >= 80) return 4;
  if (percent >= 70) return 3;
  if (percent >= 60) return 2;
  return 1;
}

/**
 * Calculate HR zone distribution for a single activity
 *
 * Note: This is a simplified calculation using average HR.
 * For more accurate zone distribution, we'd need detailed HR stream data.
 */
export function calculateActivityHRZones(
  activity: StravaActivity,
  maxHR: number
): HRZoneDistribution {
  const zones: HRZoneDistribution = {
    z1: 0,
    z2: 0,
    z3: 0,
    z4: 0,
    z5: 0,
  };

  // Skip if no HR data
  if (!activity.has_heartrate || !activity.average_heartrate) {
    return zones;
  }

  const durationMinutes = activity.moving_time / 60;
  const zone = getHRZone(activity.average_heartrate, maxHR);

  // Assign all time to the average zone (simplified)
  zones[`z${zone}` as keyof HRZoneDistribution] = durationMinutes;

  return zones;
}

/**
 * Calculate HR zone statistics for multiple activities
 */
export function calculateHRZoneStats(
  activities: StravaActivity[],
  maxHR = 190
): HRZoneStats {
  const zoneMinutes: HRZoneDistribution = {
    z1: 0,
    z2: 0,
    z3: 0,
    z4: 0,
    z5: 0,
  };

  let activitiesWithHR = 0;

  activities.forEach((activity) => {
    if (activity.has_heartrate && activity.average_heartrate) {
      activitiesWithHR++;

      const activityZones = calculateActivityHRZones(activity, maxHR);

      // Sum up zone minutes
      zoneMinutes.z1 += activityZones.z1;
      zoneMinutes.z2 += activityZones.z2;
      zoneMinutes.z3 += activityZones.z3;
      zoneMinutes.z4 += activityZones.z4;
      zoneMinutes.z5 += activityZones.z5;
    }
  });

  const totalHRMinutes =
    zoneMinutes.z1 +
    zoneMinutes.z2 +
    zoneMinutes.z3 +
    zoneMinutes.z4 +
    zoneMinutes.z5;

  return {
    zoneMinutes,
    totalHRMinutes,
    totalActivities: activities.length,
    activitiesWithHR,
    hasHRData: activitiesWithHR > 0,
  };
}

/**
 * Format zone minutes for display
 */
export function formatZoneMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}

/**
 * Get zone color for UI display
 */
export function getZoneColor(zone: number): string {
  const colors = {
    1: '#86EFAC', // green-300
    2: '#FDE047', // yellow-300
    3: '#FCA5A5', // red-300
    4: '#F87171', // red-400
    5: '#DC2626', // red-600
  };

  return colors[zone as keyof typeof colors] || '#9CA3AF';
}

/**
 * Get zone name
 */
export function getZoneName(zone: number): string {
  const names = {
    1: 'Recovery',
    2: 'Endurance',
    3: 'Tempo',
    4: 'Threshold',
    5: 'VO2 Max',
  };

  return names[zone as keyof typeof names] || 'Unknown';
}
