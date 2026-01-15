/**
 * Database Queries for Athletes and Activities
 */

import { sql } from '@vercel/postgres';
import type { StravaAthlete, StravaActivity } from '../strava/types';
import type { ScoredActivity } from '../scoring/activities';

/**
 * Database athlete record
 */
export interface DBThlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
  max_heartrate: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Database activity record
 */
export interface DBActivity {
  id: number;
  athlete_id: number;
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
 * Upsert athlete record
 */
export async function upsertAthlete(athlete: StravaAthlete): Promise<void> {
  await sql`
    INSERT INTO athletes (
      id,
      username,
      firstname,
      lastname,
      profile_picture_url,
      updated_at
    ) VALUES (
      ${athlete.id},
      ${athlete.username},
      ${athlete.firstname},
      ${athlete.lastname},
      ${athlete.profile},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      username = EXCLUDED.username,
      firstname = EXCLUDED.firstname,
      lastname = EXCLUDED.lastname,
      profile_picture_url = EXCLUDED.profile_picture_url,
      updated_at = NOW()
  `;
}

/**
 * Upsert multiple athletes
 */
export async function upsertAthletes(athletes: StravaAthlete[]): Promise<void> {
  await Promise.all(athletes.map((athlete) => upsertAthlete(athlete)));
}

/**
 * Upsert activity record
 */
export async function upsertActivity(activity: ScoredActivity): Promise<void> {
  await sql`
    INSERT INTO activities (
      id,
      athlete_id,
      type,
      name,
      distance,
      moving_time,
      total_elevation_gain,
      start_date,
      average_heartrate,
      max_heartrate,
      weighted_score,
      updated_at
    ) VALUES (
      ${activity.id},
      ${activity.athlete.id},
      ${activity.type},
      ${activity.name},
      ${activity.distance},
      ${activity.moving_time},
      ${activity.total_elevation_gain},
      ${activity.start_date},
      ${activity.average_heartrate || null},
      ${activity.max_heartrate || null},
      ${activity.weighted_score},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      type = EXCLUDED.type,
      name = EXCLUDED.name,
      distance = EXCLUDED.distance,
      moving_time = EXCLUDED.moving_time,
      total_elevation_gain = EXCLUDED.total_elevation_gain,
      start_date = EXCLUDED.start_date,
      average_heartrate = EXCLUDED.average_heartrate,
      max_heartrate = EXCLUDED.max_heartrate,
      weighted_score = EXCLUDED.weighted_score,
      updated_at = NOW()
  `;
}

/**
 * Upsert multiple activities
 */
export async function upsertActivities(
  activities: ScoredActivity[]
): Promise<void> {
  await Promise.all(activities.map((activity) => upsertActivity(activity)));
}

/**
 * Delete activity by ID (for webhook delete events)
 */
export async function deleteActivity(activityId: number): Promise<void> {
  await sql`DELETE FROM activities WHERE id = ${activityId}`;
}

/**
 * Get all athletes
 */
export async function getAthletes(): Promise<DBThlete[]> {
  const result = await sql<DBThlete>`
    SELECT * FROM athletes
    ORDER BY firstname, lastname
  `;

  return result.rows;
}

/**
 * Get activities for an athlete within date range
 */
export async function getAthleteActivities(
  athleteId: number,
  startDate?: Date,
  endDate?: Date
): Promise<DBActivity[]> {
  if (startDate && endDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE athlete_id = ${athleteId}
        AND start_date >= ${startDate.toISOString()}
        AND start_date <= ${endDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else if (startDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE athlete_id = ${athleteId}
        AND start_date >= ${startDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else if (endDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE athlete_id = ${athleteId}
        AND start_date <= ${endDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else {
    const result = await sql`
      SELECT * FROM activities
      WHERE athlete_id = ${athleteId}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  }
}

/**
 * Get all activities within date range
 */
export async function getActivities(
  startDate?: Date,
  endDate?: Date
): Promise<DBActivity[]> {
  if (startDate && endDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE start_date >= ${startDate.toISOString()}
        AND start_date <= ${endDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else if (startDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE start_date >= ${startDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else if (endDate) {
    const result = await sql`
      SELECT * FROM activities
      WHERE start_date <= ${endDate.toISOString()}
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  } else {
    const result = await sql`
      SELECT * FROM activities
      ORDER BY start_date DESC
    `;
    return result.rows as DBActivity[];
  }
}

/**
 * Get recent activities (for activity feed)
 */
export async function getRecentActivities(limit = 20): Promise<DBActivity[]> {
  const result = await sql<DBActivity>`
    SELECT * FROM activities
    ORDER BY start_date DESC
    LIMIT ${limit}
  `;

  return result.rows;
}

/**
 * Refresh the weekly leaderboard materialized view
 */
export async function refreshWeeklyLeaderboard(): Promise<void> {
  await sql`SELECT refresh_weekly_leaderboard()`;
}

/**
 * Get weekly leaderboard data
 */
export interface WeeklyLeaderboardEntry {
  athlete_id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_picture_url: string | null;
  total_activities: number;
  swimming_activities: number;
  total_weighted_score: number;
  composite_score: number;
  last_activity_at: Date | null;
}

export async function getWeeklyLeaderboard(): Promise<
  WeeklyLeaderboardEntry[]
> {
  const result = await sql<WeeklyLeaderboardEntry>`
    SELECT * FROM weekly_leaderboard
    ORDER BY composite_score DESC, last_activity_at DESC NULLS LAST
  `;

  return result.rows;
}
