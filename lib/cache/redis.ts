/**
 * Redis Cache Utilities
 *
 * Wrapper with optional KV support - gracefully falls back if KV is not available
 */

// Lazily initialize KV only when needed and configured
let kv: any = null;
let kvInitialized = false;

function getKv() {
  if (kvInitialized) return kv;

  // Check if environment variables are set
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn('⚠️ Vercel KV not configured, caching disabled');
    kvInitialized = true;
    return null;
  }

  try {
    const { kv: vercelKv } = require('@vercel/kv');
    kv = vercelKv;
    kvInitialized = true;
    console.log('✅ Vercel KV initialized');
    return kv;
  } catch (error) {
    console.warn('⚠️ Failed to initialize Vercel KV:', error);
    kvInitialized = true;
    return null;
  }
}

// Export lazy KV getter
export { getKv as kv };

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
  const kvInstance = getKv();
  return kvInstance !== null;
}

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const kvInstance = getKv();
  if (!kvInstance) {
    console.log(`⚠️ Cache disabled, skipping get: ${key}`);
    return null;
  }

  try {
    const value = await kvInstance.get<T>(key);
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
  const kvInstance = getKv();
  if (!kvInstance) {
    console.log(`⚠️ Cache disabled, skipping set: ${key}`);
    return;
  }

  try {
    await kvInstance.set(key, value, { ex: ttl });
    console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`Cache set error for ${key}:`, error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  const kvInstance = getKv();
  if (!kvInstance) {
    console.log(`⚠️ Cache disabled, skipping delete: ${key}`);
    return;
  }

  try {
    await kvInstance.del(key);
    console.log(`✅ Cache DELETE: ${key}`);
  } catch (error) {
    console.error(`Cache delete error for ${key}:`, error);
  }
}

/**
 * Delete multiple cached values by pattern
 */
export async function deletePattern(pattern: string): Promise<void> {
  const kvInstance = getKv();
  if (!kvInstance) {
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
  const kvInstance = getKv();
  if (!kvInstance) {
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
