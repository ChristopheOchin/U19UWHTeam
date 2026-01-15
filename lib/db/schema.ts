/**
 * Database Schema Definitions
 *
 * This file defines the TypeScript interfaces for our database tables.
 * The actual SQL schema is in migrations/001_initial.sql
 */

export interface Athlete {
  id: bigint;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
  max_heartrate: number;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: bigint;
  athlete_id: bigint;
  type: string;
  name: string;
  distance: number | null;
  moving_time: number | null;
  total_elevation_gain: number | null;
  start_date: Date;
  average_heartrate: number | null;
  max_heartrate: number | null;
  weighted_score: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Computed leaderboard entry
 */
export interface LeaderboardEntry {
  athlete_id: bigint;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
  total_activities: number;
  swimming_activities: number;
  total_weighted_score: number;
  composite_score: number;
  rank: number;
  last_activity_at: Date | null;
}

/**
 * HR Zone distribution for an athlete
 */
export interface HRZoneStats {
  athlete_id: bigint;
  zone_minutes: {
    z1: number;
    z2: number;
    z3: number;
    z4: number;
    z5: number;
  };
  total_hr_minutes: number;
  has_hr_data: boolean;
  activities_with_hr: number;
  total_activities: number;
}
