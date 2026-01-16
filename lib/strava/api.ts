/**
 * Strava API Client
 *
 * Handles all interactions with the Strava API including:
 * - Fetching athlete data
 * - Fetching activities
 * - Rate limiting
 * - Error handling with retries
 */

import { getAccessToken, invalidateAccessToken } from './oauth';
import { stravaConfig } from './config';
import type { StravaAthlete, StravaActivity } from './types';

/**
 * Rate limiter to prevent hitting Strava API limits
 */
class RateLimiter {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private requestCount = 0;
  private resetTime = Date.now() + 15 * 60 * 1000; // 15 minutes

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      void this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    // Reset counter if 15 minutes have passed
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 15 * 60 * 1000;
    }

    // Wait if we've hit the rate limit
    if (this.requestCount >= stravaConfig.rateLimit.perFifteenMinutes - 5) {
      const waitTime = this.resetTime - Date.now();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.resetTime = Date.now() + 15 * 60 * 1000;
      }
    }

    const task = this.queue.shift();
    if (task) {
      this.requestCount++;
      await task();
    }

    this.processing = false;

    // Process next item
    if (this.queue.length > 0) {
      void this.processQueue();
    }
  }
}

const rateLimiter = new RateLimiter();

/**
 * Make an authenticated request to Strava API
 */
async function stravaRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${stravaConfig.apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    await invalidateAccessToken();
    throw new Error('Access token expired, please retry');
  }

  // Handle rate limiting
  if (response.status === 429) {
    throw new Error('Rate limit exceeded');
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava API error: ${response.status} ${error}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch list of athletes the authenticated user (coach) follows
 *
 * Note: Strava deprecated the /athlete/friends endpoint in 2024.
 * Alternative: Use club members endpoint or manually track athlete IDs.
 * For now, returns authenticated athlete only for testing.
 */
export async function fetchFollowedAthletes(): Promise<StravaAthlete[]> {
  return rateLimiter.execute(async () => {
    try {
      // Try the friends endpoint first (may not work with current scopes)
      const athletes = await stravaRequest<StravaAthlete[]>(
        '/athlete/friends?per_page=200'
      );
      return athletes;
    } catch (error) {
      // Fallback: Return authenticated athlete only
      console.warn('⚠️  Friends endpoint failed, returning authenticated athlete only');
      console.warn('    To track team members, use Strava club members endpoint instead.');
      const athlete = await stravaRequest<StravaAthlete>('/athlete');
      return [athlete];
    }
  });
}

/**
 * Fetch activities for the authenticated user (coach)
 */
export async function fetchAuthenticatedUserActivities(
  after?: number, // Unix timestamp
  before?: number, // Unix timestamp
  perPage = 30
): Promise<StravaActivity[]> {
  return rateLimiter.execute(async () => {
    // Build query params
    const params = new URLSearchParams({
      per_page: perPage.toString(),
    });

    if (after) {
      params.append('after', after.toString());
    }

    if (before) {
      params.append('before', before.toString());
    }

    // Use /athlete/activities (singular) for authenticated user
    const activities = await stravaRequest<StravaActivity[]>(
      `/athlete/activities?${params.toString()}`
    );

    return activities;
  });
}

/**
 * Fetch activities for a specific athlete
 * NOTE: This only works for the authenticated user due to Strava privacy.
 * Use fetchAuthenticatedUserActivities() instead for the coach's activities.
 */
export async function fetchAthleteActivities(
  athleteId: number,
  after?: number, // Unix timestamp
  before?: number, // Unix timestamp
  perPage = 30
): Promise<StravaActivity[]> {
  return rateLimiter.execute(async () => {
    // Build query params
    const params = new URLSearchParams({
      per_page: perPage.toString(),
    });

    if (after) {
      params.append('after', after.toString());
    }

    if (before) {
      params.append('before', before.toString());
    }

    const activities = await stravaRequest<StravaActivity[]>(
      `/athletes/${athleteId}/activities?${params.toString()}`
    );

    return activities;
  });
}

/**
 * Fetch all team activities within a date range
 *
 * This fetches activities for all followed athletes (team members)
 */
export async function fetchTeamActivities(
  after?: number, // Unix timestamp
  before?: number // Unix timestamp
): Promise<StravaActivity[]> {
  // Get all team members
  const athletes = await fetchFollowedAthletes();

  // Fetch activities for each athlete in parallel (rate limiter handles throttling)
  const activityPromises = athletes.map((athlete) =>
    fetchAthleteActivities(athlete.id, after, before, 30).catch((error) => {
      console.error(`Failed to fetch activities for ${athlete.username}:`, error);
      return []; // Return empty array for failed requests
    })
  );

  const activitiesArrays = await Promise.all(activityPromises);

  // Flatten and sort by date
  const allActivities = activitiesArrays.flat();
  allActivities.sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return allActivities;
}

/**
 * Fetch activities for the last 7 days
 */
export async function fetchWeeklyActivities(): Promise<StravaActivity[]> {
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  return fetchTeamActivities(sevenDaysAgo);
}

/**
 * Fetch activities for the authenticated athlete (coach)
 *
 * This is useful for testing since we can always get the coach's activities.
 * Returns full activity objects with all fields including dates and IDs.
 */
export async function fetchAuthenticatedAthleteActivities(
  after?: number,
  before?: number,
  perPage = 30
): Promise<StravaActivity[]> {
  return rateLimiter.execute(async () => {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
    });

    if (after) {
      params.append('after', after.toString());
    }

    if (before) {
      params.append('before', before.toString());
    }

    const activities = await stravaRequest<StravaActivity[]>(
      `/athlete/activities?${params.toString()}`
    );

    return activities;
  });
}

/**
 * Fetch authenticated athlete info
 */
export async function fetchAuthenticatedAthlete(): Promise<StravaAthlete> {
  return rateLimiter.execute(async () => {
    return stravaRequest<StravaAthlete>('/athlete');
  });
}

/**
 * Fetch a single activity by ID (useful for webhook updates)
 */
export async function fetchActivity(
  activityId: number
): Promise<StravaActivity> {
  return rateLimiter.execute(async () => {
    return stravaRequest<StravaActivity>(`/activities/${activityId}`);
  });
}

/**
 * Fetch club members from a Strava club
 *
 * The team has a Strava club: https://www.strava.com/clubs/1853738
 * Note: Club members endpoint returns limited data (no IDs).
 * Better to use fetchClubActivities() to get athlete info with activities.
 *
 * @param clubId - Strava club ID (1853738 for U19 USA UWH)
 */
export async function fetchClubMembers(
  clubId: number = 1853738
): Promise<StravaAthlete[]> {
  return rateLimiter.execute(async () => {
    const members = await stravaRequest<StravaAthlete[]>(
      `/clubs/${clubId}/members?per_page=200`
    );
    return members;
  });
}

/**
 * Fetch recent activities from a Strava club
 *
 * This is the best way to get team activities - it returns full activity objects
 * with athlete IDs embedded, solving the "no athlete IDs in members" problem.
 *
 * @param clubId - Strava club ID (1853738 for U19 USA UWH)
 * @param page - Page number (default 1)
 * @param perPage - Results per page (default 200, max 200)
 */
export async function fetchClubActivities(
  clubId: number = 1853738,
  page = 1,
  perPage = 200
): Promise<StravaActivity[]> {
  return rateLimiter.execute(async () => {
    const activities = await stravaRequest<StravaActivity[]>(
      `/clubs/${clubId}/activities?page=${page}&per_page=${perPage}`
    );
    return activities;
  });
}

/**
 * Fetch all recent club activities (last 7 days worth)
 *
 * Fetches multiple pages if needed to get all recent activities.
 */
export async function fetchAllRecentClubActivities(
  clubId: number = 1853738
): Promise<StravaActivity[]> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const allActivities: StravaActivity[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) {
    // Safety limit: max 5 pages
    const activities = await fetchClubActivities(clubId, page, 200);

    if (activities.length === 0) {
      hasMore = false;
      break;
    }

    // Filter activities from last 7 days
    const recentActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.start_date).getTime();
      return activityDate >= sevenDaysAgo;
    });

    allActivities.push(...recentActivities);

    // If we got fewer results than requested, or oldest activity is > 7 days old, stop
    if (activities.length < 200 || recentActivities.length < activities.length) {
      hasMore = false;
    }

    page++;
  }

  return allActivities;
}
