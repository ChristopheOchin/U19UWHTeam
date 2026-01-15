/**
 * Strava API Configuration
 *
 * Environment variables required:
 * - STRAVA_CLIENT_ID: Strava app client ID
 * - STRAVA_CLIENT_SECRET: Strava app client secret
 * - STRAVA_REFRESH_TOKEN: Coach's OAuth refresh token
 */

export const stravaConfig = {
  get clientId() {
    const value = process.env.STRAVA_CLIENT_ID;
    if (!value) {
      throw new Error('STRAVA_CLIENT_ID is not set in environment variables');
    }
    return value;
  },

  get clientSecret() {
    const value = process.env.STRAVA_CLIENT_SECRET;
    if (!value) {
      throw new Error('STRAVA_CLIENT_SECRET is not set in environment variables');
    }
    return value;
  },

  get refreshToken() {
    const value = process.env.STRAVA_REFRESH_TOKEN;
    if (!value) {
      throw new Error('STRAVA_REFRESH_TOKEN is not set in environment variables');
    }
    return value;
  },

  get webhookVerifyToken() {
    const value = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
    if (!value) {
      throw new Error('STRAVA_WEBHOOK_VERIFY_TOKEN is not set in environment variables');
    }
    return value;
  },

  // API endpoints
  tokenUrl: 'https://www.strava.com/oauth/token',
  apiBaseUrl: 'https://www.strava.com/api/v3',

  // Rate limits
  rateLimit: {
    perFifteenMinutes: 100,
    perDay: 1000,
  },
};
