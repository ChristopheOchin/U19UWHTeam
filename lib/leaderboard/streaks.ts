/**
 * Smart Streak Calculation
 *
 * Calculates consecutive weeks with 5+ training days.
 * Allows up to 2 rest days per week (recovery-friendly for young athletes).
 */

import { getAthleteActivities } from '../db/queries';
import { getMonday } from './utils';
import { kv } from '@vercel/kv';
import type { StreakCache } from './types';

const STREAK_CACHE_PREFIX = 'streak:';
const STREAK_CACHE_TTL = 5 * 60; // 5 minutes

/**
 * Calculate smart streak for an athlete (with caching)
 *
 * @param athleteId - Strava athlete ID
 * @returns Number of consecutive weeks with 5+ training days
 */
export async function calculateSmartStreak(
  athleteId: number
): Promise<number> {
  // Check cache first
  const cached = await getStreakFromCache(athleteId);
  if (cached !== null) return cached;

  // Calculate fresh streak
  const streak = await calculateStreakFromActivities(athleteId);

  // Store in cache
  await setStreakInCache(athleteId, streak);

  return streak;
}

/**
 * Calculate streak from athlete activities (no cache)
 */
async function calculateStreakFromActivities(
  athleteId: number
): Promise<number> {
  // Fetch activities for last 90 days (reasonable max streak ~12 weeks)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const activities = await getAthleteActivities(athleteId, ninetyDaysAgo);

  if (activities.length === 0) return 0;

  // Extract unique dates (YYYY-MM-DD format in UTC)
  const uniqueDates = new Set(
    activities.map((a) => new Date(a.start_date).toISOString().split('T')[0])
  );

  // Group by weeks (Monday = start of week)
  const weekMap = new Map<string, number>(); // weekKey -> activity count

  for (const dateStr of uniqueDates) {
    const date = new Date(dateStr);
    const weekStart = getMonday(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
  }

  // Sort weeks newest to oldest
  const weeks = Array.from(weekMap.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  // Count consecutive weeks with 5+ days
  let streak = 0;
  const currentWeekStart = getMonday(new Date()).toISOString().split('T')[0];

  for (const [weekKey, dayCount] of weeks) {
    // Streak requires 5+ training days (allows 2 rest days)
    if (dayCount >= 5) {
      streak++;
    } else {
      // Only break streak for past weeks
      // Current week in progress doesn't break streak yet
      if (weekKey !== currentWeekStart) {
        break;
      }
    }
  }

  return streak;
}

/**
 * Get streak from Redis cache
 */
async function getStreakFromCache(athleteId: number): Promise<number | null> {
  try {
    const cached = await kv.get<StreakCache>(
      `${STREAK_CACHE_PREFIX}${athleteId}`
    );

    if (!cached) return null;

    // Verify cache is still valid
    const age = Date.now() - cached.computedAt;
    if (age > STREAK_CACHE_TTL * 1000) {
      return null; // Expired
    }

    return cached.streak;
  } catch (error) {
    console.error('Error reading streak from cache:', error);
    return null;
  }
}

/**
 * Store streak in Redis cache
 */
async function setStreakInCache(
  athleteId: number,
  streak: number
): Promise<void> {
  try {
    const cacheEntry: StreakCache = {
      athleteId,
      streak,
      computedAt: Date.now(),
    };

    await kv.set(
      `${STREAK_CACHE_PREFIX}${athleteId}`,
      cacheEntry,
      { ex: STREAK_CACHE_TTL } // Redis TTL
    );
  } catch (error) {
    console.error('Error storing streak in cache:', error);
    // Don't throw - cache failure shouldn't break the app
  }
}

/**
 * Invalidate streak cache for an athlete
 * Call this after activity sync or webhook
 */
export async function invalidateStreakCache(athleteId: number): Promise<void> {
  try {
    await kv.del(`${STREAK_CACHE_PREFIX}${athleteId}`);
  } catch (error) {
    console.error('Error invalidating streak cache:', error);
  }
}

/**
 * Invalidate streak cache for all athletes
 * Call this after bulk activity sync
 */
export async function invalidateAllStreakCaches(
  athleteIds: number[]
): Promise<void> {
  try {
    const keys = athleteIds.map((id) => `${STREAK_CACHE_PREFIX}${id}`);
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating all streak caches:', error);
  }
}
