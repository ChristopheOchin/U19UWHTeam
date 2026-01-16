/**
 * Strava OAuth Token Management
 *
 * Handles access token refresh using the coach's refresh token.
 * Implements caching to avoid unnecessary token refreshes.
 */

import { stravaConfig } from './config';
import { kv } from '@/lib/cache/redis';

const ACCESS_TOKEN_CACHE_KEY = 'strava:access_token';
const ACCESS_TOKEN_TTL = 6 * 60 * 60; // 6 hours in seconds

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

/**
 * Get a valid access token (from cache or refresh)
 */
export async function getAccessToken(): Promise<string> {
  try {
    // Check cache first
    const kvInstance = kv(); // Call function to get KV
    if (kvInstance) {
      const cached = (await kvInstance.get(ACCESS_TOKEN_CACHE_KEY)) as string | null;
      if (cached) {
        return cached;
      }
    }

    // Refresh token if not in cache
    const tokenData = await refreshAccessToken();

    // Cache the new access token (if KV available)
    if (kvInstance) {
      await kvInstance.set(ACCESS_TOKEN_CACHE_KEY, tokenData.access_token, {
        ex: ACCESS_TOKEN_TTL,
      });
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw new Error('Failed to authenticate with Strava');
  }
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<StravaTokenResponse> {
  const response = await fetch(stravaConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: stravaConfig.clientId,
      client_secret: stravaConfig.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: stravaConfig.refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${error}`);
  }

  const data: StravaTokenResponse = await response.json();

  // Note: If refresh_token changes in response, you'd need to update env var
  // For now, we assume the refresh token remains valid

  return data;
}

/**
 * Invalidate the cached access token (useful after API errors)
 */
export async function invalidateAccessToken(): Promise<void> {
  const kvInstance = kv(); // Call function to get KV
  if (kvInstance) {
    await kvInstance.del(ACCESS_TOKEN_CACHE_KEY);
  }
}
