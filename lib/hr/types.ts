/**
 * TypeScript types for HR Zone Dashboard
 */

export interface HRZoneData {
  zone1Minutes: number; // Recovery (50-60% max HR)
  zone2Minutes: number; // Endurance (60-70% max HR)
  zone3Minutes: number; // Tempo (70-80% max HR)
  zone4Minutes: number; // Threshold (80-90% max HR)
  zone5Minutes: number; // VO2 Max (90-100% max HR)
  totalMinutes: number;
  activitiesWithHR: number;
}

export interface AthleteHRZoneData {
  athleteId: number;
  firstname: string;
  lastname: string;
  profilePictureUrl: string | null;
  maxHeartrate: number;
  hrZoneData: HRZoneData | null; // null if no HR data
}

export interface HRZoneResponse {
  athletes: AthleteHRZoneData[];
  metadata: {
    weekStartDate: string;
    lastUpdated: string;
  };
}

export const HR_ZONE_COLORS = {
  zone1: '#22C55E', // Green - Recovery
  zone2: '#3B82F6', // Blue - Endurance
  zone3: '#FBBF24', // Yellow - Tempo
  zone4: '#F97316', // Orange - Threshold
  zone5: '#EF4444', // Red - VO2 Max
} as const;

export const HR_ZONE_LABELS = {
  zone1: 'Recovery',
  zone2: 'Endurance',
  zone3: 'Tempo',
  zone4: 'Threshold',
  zone5: 'VO2 Max',
} as const;
