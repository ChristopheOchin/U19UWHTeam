# Strava Integration Setup Guide

This guide walks you through setting up the Strava API integration for the U19 UWH Team leaderboard.

## Prerequisites

- Vercel account with Postgres and KV databases configured
- Strava account (coach's account that follows all team members)
- Node.js installed locally

## Step 1: Create Strava API Application

1. Go to https://www.strava.com/settings/api
2. Click "Create New App"
3. Fill in the form:
   - **Application Name**: U19 USA Underwater Hockey Team
   - **Category**: Training
   - **Website**: Your Vercel deployment URL (e.g., https://your-app.vercel.app)
   - **Authorization Callback Domain**: `localhost,your-app.vercel.app`
   - **Description**: Training leaderboard for U19 USA UWH team
4. Click "Create"
5. Note your **Client ID** and **Client Secret**

## Step 2: Authorize Coach's Strava Account

### 2.1 Get Authorization Code

Visit this URL in your browser (replace `YOUR_CLIENT_ID`):

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=activity:read_all,profile:read_email
```

**Scopes explained**:
- `activity:read_all`: Read all activities (including private)
- `profile:read_email`: Read profile information

### 2.2 Authorize Application

1. Log in with the coach's Strava account
2. Click "Authorize"
3. You'll be redirected to `http://localhost:3000/exchange_token?code=AUTHORIZATION_CODE`
4. Copy the `code` parameter from the URL

### 2.3 Exchange Code for Refresh Token

Run this curl command (replace placeholders):

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTHORIZATION_CODE \
  -d grant_type=authorization_code
```

**Response**:
```json
{
  "token_type": "Bearer",
  "expires_at": 1234567890,
  "expires_in": 21600,
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "access_token": "YOUR_ACCESS_TOKEN"
}
```

**Save the `refresh_token`** - this is what you'll add to your environment variables.

## Step 3: Configure Environment Variables

Add to `.env.local` (or Vercel environment variables):

```bash
# Strava API
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REFRESH_TOKEN=your_refresh_token_here

# Webhook verification (generate a random string)
STRAVA_WEBHOOK_VERIFY_TOKEN=your_random_string_here
```

### Generate Webhook Verify Token

```bash
openssl rand -base64 32
```

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Go to your Vercel project dashboard
3. Navigate to **Settings > Environment Variables**
4. Add all Strava environment variables from Step 3
5. Redeploy the application

## Step 5: Test the Integration

### 5.1 Local Testing

```bash
npm run dev
```

Visit: http://localhost:3000/api/strava/activities

You should see a JSON response with:
```json
{
  "success": true,
  "syncedAt": "2026-01-15T...",
  "stats": {
    "athletes": 15,
    "totalActivities": 143,
    "swimmingActivities": 62,
    "totalWeightedScore": 12847
  }
}
```

### 5.2 Production Testing

Visit: https://your-app.vercel.app/api/strava/activities

Check the Vercel logs for any errors.

## Step 6: Verify Database

Check that data was stored:

```sql
-- Check athletes
SELECT COUNT(*) FROM athletes;

-- Check activities
SELECT COUNT(*) FROM activities;

-- Check leaderboard
SELECT * FROM weekly_leaderboard LIMIT 5;
```

## Troubleshooting

### Error: "Access token expired"

- The refresh token is automatically used to get new access tokens
- Check that `STRAVA_REFRESH_TOKEN` is correct
- Re-authorize if needed (repeat Step 2)

### Error: "Rate limit exceeded"

- Strava limits: 100 requests per 15 minutes, 1000 per day
- The API client has built-in rate limiting
- Wait 15 minutes and try again

### Error: "Failed to fetch activities"

- Verify coach's account follows all team members on Strava
- Check that athletes have public profiles or are connected
- Review Strava API scopes (must include `activity:read_all`)

### No activities appearing

- Ensure activities are from the last 7 days
- Check that athletes have logged activities on Strava
- Verify `start_date` is within the rolling 7-day window

## Scoring Validation

Test the swimming multiplier:

```sql
SELECT
  name,
  type,
  moving_time / 60 AS time_minutes,
  distance / 1000 AS distance_km,
  weighted_score,
  CASE
    WHEN type IN ('Swim', 'Pool Swim', 'Open Water Swim')
    THEN 'Swimming (1.5x)'
    ELSE 'Other (1.0x)'
  END AS multiplier
FROM activities
ORDER BY start_date DESC
LIMIT 10;
```

**Expected**:
- Swimming activities should have ~1.5x higher weighted_score
- Verify: `weighted_score ≈ ((time_minutes + distance_km) × multiplier)`

## Next Steps

After Strava integration is working:

1. ✅ Phase 2 Complete: Strava Integration
2. 🚀 Phase 3: Build Leaderboard UI components
3. 🚀 Phase 4: Set up Strava webhooks for real-time updates
4. 🚀 Phase 5: Polish and production launch

## Security Notes

- ⚠️ Never commit `.env.local` to Git
- ⚠️ Keep `STRAVA_CLIENT_SECRET` and `STRAVA_REFRESH_TOKEN` private
- ⚠️ Refresh tokens don't expire but can be revoked by user
- ⚠️ Access tokens expire every 6 hours (auto-refreshed by the app)

## Strava API Documentation

- OAuth: https://developers.strava.com/docs/authentication/
- Activities API: https://developers.strava.com/docs/reference/#api-Activities
- Rate Limits: https://developers.strava.com/docs/rate-limits/

---

**Last Updated**: January 2026
