/**
 * Activity Scoring Algorithms
 *
 * Scoring system for activity tracking:
 * - Base score calculated from time and distance
 * - Swimming activities are tracked but no multiplier applied
 * - Composite score: 60% activity count + 40% weighted score
 * - HR zones calculated separately (informational only)
 */

import type { StravaActivity } from '../strava/types';
import {
  SWIMMING_ACTIVITY_TYPES,
  SWIMMING_KEYWORDS,
} from '../strava/types';

/**
 * Determine if an activity is swimming-related
 */
export function isSwimmingActivity(activity: StravaActivity): boolean {
  // Check activity type
  if (SWIMMING_ACTIVITY_TYPES.includes(activity.type as never)) {
    return true;
  }

  if (SWIMMING_ACTIVITY_TYPES.includes(activity.sport_type as never)) {
    return true;
  }

  // Check activity name for swimming keywords
  const nameLower = activity.name.toLowerCase();
  return SWIMMING_KEYWORDS.some((keyword) => nameLower.includes(keyword));
}

/**
 * Calculate weighted score for an activity
 *
 * Base score = (moving_time in minutes) + (distance in km)
 * No multipliers applied - all activities scored equally
 *
 * @param activity - Strava activity object
 * @returns Weighted score (number)
 */
export function calculateWeightedScore(activity: StravaActivity): number {
  // Base score components
  const timeMinutes = activity.moving_time / 60;
  const distanceKm = activity.distance / 1000;

  // Base score (no multipliers)
  const baseScore = timeMinutes + distanceKm;

  return baseScore;
}

/**
 * Calculate composite leaderboard score
 *
 * Formula: (activityCount * 100 * 0.6) + (totalWeightedScore * 0.4)
 *
 * This emphasizes consistency (60%) while rewarding volume (40%)
 *
 * @param activityCount - Number of activities in period
 * @param totalWeightedScore - Sum of all weighted scores
 * @returns Composite score
 */
export function calculateCompositeScore(
  activityCount: number,
  totalWeightedScore: number
): number {
  return activityCount * 100 * 0.6 + totalWeightedScore * 0.4;
}

/**
 * Activity with computed score
 */
export interface ScoredActivity extends StravaActivity {
  weighted_score: number;
  is_swimming: boolean;
}

/**
 * Process a Strava activity and add scoring metadata
 */
export function scoreActivity(activity: StravaActivity): ScoredActivity {
  const weighted_score = calculateWeightedScore(activity);
  const is_swimming = isSwimmingActivity(activity);

  return {
    ...activity,
    weighted_score,
    is_swimming,
  };
}

/**
 * Process multiple activities and add scoring
 */
export function scoreActivities(activities: StravaActivity[]): ScoredActivity[] {
  return activities.map(scoreActivity);
}
