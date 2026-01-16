/**
 * Redis Cache Utilities
 *
 * Wrapper with optional KV support - gracefully falls back if KV is not available
 */

// Try to import KV, but don't fail if it's not configured
let kv: any = null;
try {
  const vercelKv = require('@vercel/kv');
  kv = vercelKv.kv;
} catch (error) {
  console.warn('⚠️ Vercel KV not available, caching disabled');
}

// Re-export KV client for direct usage (may be null)
export { kv };

// Cache key prefixes
export const CACHE_KEYS = {
  STRAVA_ACCESS_TOKEN: 'strava:access_token',
  LEADERBOARD: 'leaderboard:current',
  ACTIVITY_FEED: (limit: number) => `activities:recent:${limit}`,
  ATHLETE_STATS: (athleteId: string) => `athlete:${athleteId}:weekly_stats`,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  ACCESS_TOKEN: 6 * 60 * 60, // 6 hours (Strava token lifetime)
  LEADERBOARD: 5 * 60, // 5 minutes
  ACTIVITY_FEED: 2 * 60, // 2 minutes
  ATHLETE_STATS: 5 * 60, // 5 minutes
} as const;

/**
 * Check if KV is available
 */
function isKvAvailable(): boolean {
  return kv !== null && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
}

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!isKvAvailable()) {
    console.log(`⚠️ Cache disabled, skipping get: ${key}`);
    return null;
  }

  try {
    const value = await kv.get<T>(key);
    if (value) {
      console.log(`✅ Cache HIT: ${key}`);
    } else {
      console.log(`❌ Cache MISS: ${key}`);
    }
    return value;
  } catch (error) {
    console.error(`Cache get error for ${key}:`, error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  if (!isKvAvailable()) {
    console.log(`⚠️ Cache disabled, skipping set: ${key}`);
    return;
  }

  try {
    await kv.set(key, value, { ex: ttl });
    console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`Cache set error for ${key}:`, error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  if (!isKvAvailable()) {
    console.log(`⚠️ Cache disabled, skipping delete: ${key}`);
    return;
  }

  try {
    await kv.del(key);
    console.log(`✅ Cache DELETE: ${key}`);
  } catch (error) {
    console.error(`Cache delete error for ${key}:`, error);
  }
}

/**
 * Delete multiple cached values by pattern
 */
export async function deletePattern(pattern: string): Promise<void> {
  if (!isKvAvailable()) {
    console.log(`⚠️ Cache disabled, skipping pattern delete: ${pattern}`);
    return;
  }

  try {
    // Note: Vercel KV doesn't support SCAN, so we'll delete known keys
    // For athlete stats, we'll need to track athlete IDs separately
    console.log(`⚠️ Pattern delete not fully supported: ${pattern}`);
    // For now, we'll handle specific cases in the invalidation logic
  } catch (error) {
    console.error(`Cache pattern delete error for ${pattern}:`, error);
  }
}

/**
 * Invalidate all leaderboard-related caches
 * Call this when activities are added/updated
 */
export async function invalidateLeaderboardCaches(): Promise<void> {
  if (!isKvAvailable()) {
    console.log(`⚠️ Cache disabled, skipping invalidation`);
    return;
  }

  try {
    await Promise.all([
      deleteCached(CACHE_KEYS.LEADERBOARD),
      deleteCached(CACHE_KEYS.ACTIVITY_FEED(10)),
      deleteCached(CACHE_KEYS.ACTIVITY_FEED(20)),
      deleteCached(CACHE_KEYS.ACTIVITY_FEED(50)),
    ]);
    console.log('✅ Leaderboard caches invalidated');
  } catch (error) {
    console.error('❌ Failed to invalidate caches:', error);
  }
}
