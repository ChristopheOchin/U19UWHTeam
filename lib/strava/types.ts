/**
 * Strava API Type Definitions
 */

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile: string; // Profile picture URL
  city?: string;
  state?: string;
  country?: string;
}

export interface StravaActivity {
  id: number;
  athlete: {
    id: number;
  };
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string; // 'Run', 'Swim', 'Ride', etc.
  sport_type: string; // More specific type
  start_date: string; // ISO 8601
  start_date_local: string; // ISO 8601
  timezone: string;
  average_speed?: number; // meters/second
  max_speed?: number; // meters/second
  average_heartrate?: number; // BPM
  max_heartrate?: number; // BPM
  has_heartrate: boolean;
}

/**
 * Club activity summary (limited fields returned by /clubs/{id}/activities)
 */
export interface StravaClubActivity {
  resource_state: number;
  athlete: {
    resource_state: number;
    firstname: string;
    lastname: string;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: number | null;
  device_name?: string;
  // Note: NO id, NO start_date, NO athlete.id
  // This endpoint only provides summaries
}

export interface StravaDetailedActivity extends StravaActivity {
  description?: string;
  calories?: number;
  device_name?: string;
  gear_id?: string;
}

/**
 * Activity types that should be considered swimming
 */
export const SWIMMING_ACTIVITY_TYPES = [
  'Swim',
  'Pool Swim',
  'Open Water Swim',
  'IceSwim',
] as const;

/**
 * Keywords that indicate swimming activity in activity name
 */
export const SWIMMING_KEYWORDS = [
  'swim',
  'pool',
  'laps',
  'uwh',
  'underwater hockey',
  'aquatic',
] as const;
