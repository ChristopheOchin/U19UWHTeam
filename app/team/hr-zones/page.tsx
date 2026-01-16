/**
 * HR Zones Dashboard Page
 *
 * Server-rendered page showing heart rate zone distribution for all athletes.
 * Protected by auth middleware (same as /team route).
 *
 * Route: /team/hr-zones
 */

import { getAthletes } from '@/lib/db/queries';
import { calculateAllAthleteZones, getWeekStartDate } from '@/lib/hr/zones';
import HRZoneDashboard from '@/components/team/HRZoneDashboard';
import type { HRZoneResponse } from '@/lib/hr/types';

export const metadata = {
  title: 'HR Zone Dashboard | U19 USA UWH Team',
  description:
    'Heart rate zone distribution for U19 USA Underwater Hockey team members',
};

export default async function HRZonesPage() {
  let initialData: HRZoneResponse;

  try {
    // Fetch athletes
    const athletes = await getAthletes();

    if (athletes.length === 0) {
      // No athletes yet
      initialData = {
        athletes: [],
        metadata: {
          weekStartDate: getWeekStartDate(),
          lastUpdated: new Date().toISOString(),
        },
      };
    } else {
      // Calculate zone distribution for all athletes
      const athleteZones = await calculateAllAthleteZones(athletes);

      initialData = {
        athletes: athleteZones,
        metadata: {
          weekStartDate: getWeekStartDate(),
          lastUpdated: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error('Error fetching HR zone data:', error);

    // Return empty data on error
    initialData = {
      athletes: [],
      metadata: {
        weekStartDate: getWeekStartDate(),
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  return <HRZoneDashboard initialData={initialData} />;
}
