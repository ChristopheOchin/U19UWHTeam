# Strava Integration Setup - COMPLETE! ✅

## Summary

Your Strava OAuth is configured and the integration is ready to use! The app will fetch activities from your U19 USA UWH Strava club (ID: 1853738).

## What's Working

✅ **Strava OAuth**: Access token refresh working
✅ **Club Access**: Successfully fetching from club 1853738
✅ **Club Members**: 12 team members detected
✅ **Activities Endpoint**: Club activities API responding
✅ **Scoring System**: Swimming 1.5x multiplier implemented
✅ **Athlete Detection**: Extracting athlete info from activities

## Your Credentials

```bash
Client ID: 195839
Client Secret: 1ed43... (configured ✓)
Refresh Token: 3ccb0... (configured ✓)
Club ID: 1853738
```

## Test Results

```
🏊 Club: U19 USA UWH
✓ 12 team members in club
✓ 200 activities fetchable
⚠️  0 activities in last 7 days (team needs to log activities)
```

## Next Steps

### 1. Add Database Credentials

You still need to add your Vercel Postgres and KV credentials to `.env.local`:

```bash
# Get these from https://vercel.com/dashboard
POSTGRES_URL=postgres://...
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### 2. Test the Full Integration

Once database credentials are added:

```bash
# Start dev server
npm run dev

# In another terminal, test sync
curl http://localhost:3000/api/strava/activities
```

Expected response:
```json
{
  "success": true,
  "syncedAt": "2026-01-15T...",
  "stats": {
    "athletes": 12,
    "totalActivities": 0,
    "swimmingActivities": 0,
    "totalWeightedScore": 0
  }
}
```

### 3. Get Team Members to Log Activities

For the leaderboard to show data, team members need to:
1. Join the Strava club: https://www.strava.com/clubs/1853738
2. Log activities on Strava (swimming, running, biking, etc.)
3. Wait for sync (happens automatically every 5 minutes)

## How It Works

### Activity Fetching Flow

```
1. App calls: /api/strava/activities
2. Fetches club activities from Strava API
3. Filters activities from last 7 days
4. Extracts athlete info from activity data
5. Scores activities (swimming gets 1.5x multiplier)
6. Stores in Postgres database
7. Refreshes leaderboard materialized view
8. Caches result for 5 minutes
```

### Scoring Formula

```typescript
// Base score
base_score = (moving_time_minutes + distance_km)

// Apply swimming multiplier
weighted_score = base_score × (is_swimming ? 1.5 : 1.0)

// Composite leaderboard score
composite_score = (activity_count × 100 × 0.6) + (total_weighted_score × 0.4)
```

### Swimming Detection

Activities are considered swimming if:
- Type is 'Swim', 'Pool Swim', or 'Open Water Swim'
- Name contains: 'swim', 'pool', 'laps', 'uwh', 'underwater hockey'

## Testing Scripts Available

```bash
# Test Strava API connection
node scripts/test-strava-connection.js

# Test club member access
node scripts/test-club-access.js

# Test club activities fetch
node scripts/test-club-activities.js

# Get new OAuth tokens (if needed)
node scripts/get-strava-token.js
```

## Troubleshooting

### No Activities Showing Up

**Problem**: API returns 0 activities
**Solution**: Team members need to log activities on Strava in the last 7 days

### "Failed to sync activities"

**Problem**: Database error
**Solution**: Add database credentials to `.env.local` from Vercel dashboard

### "Rate limit exceeded"

**Problem**: Too many API requests
**Solution**: Wait 15 minutes, or check if multiple syncs are running

### Activities Not Scoring Correctly

**Problem**: Swimming not getting 1.5x multiplier
**Solution**: Check activity type or add swimming keywords to activity name

## Current Status

✅ **Phase 1**: Authentication & Database - COMPLETE
✅ **Phase 2**: Strava Integration - COMPLETE
🚀 **Phase 3**: Leaderboard UI - NEXT

## Phase 3 Preview

Next, we'll build the user interface:

1. **Leaderboard Display**
   - Ranked athlete cards
   - Swimming activity spotlight (aqua glow)
   - Gap indicators ("234 points behind leader")
   - Hot streak badges (🔥 consecutive days)

2. **Activity Feed**
   - Real-time updates (30-second polling)
   - Toast notifications for new activities
   - Swimming activities highlighted

3. **HR Intensity Dashboard**
   - Separate informational view
   - Zone distribution charts
   - Only for athletes with HR monitors
   - Not used in rankings (fair to all)

## Important Notes

- ⚠️ Club activities endpoint returns last ~200 activities (not time-filtered by API)
- ⚠️ The app filters to last 7 days client-side
- ⚠️ Athlete IDs come from activity.athlete.id field
- ✅ This approach is more reliable than the deprecated friends endpoint
- ✅ Works with current Strava API (as of January 2026)

## Resources

- **Strava Club**: https://www.strava.com/clubs/1853738
- **Strava API Docs**: https://developers.strava.com/docs/reference/
- **Setup Guide**: See [SETUP_STRAVA.md](./SETUP_STRAVA.md)
- **Phase 2 Complete**: See [PHASE2_COMPLETE.md](./PHASE2_COMPLETE.md)

---

**Setup Complete**: January 15, 2026
**Ready for**: Database connection + Phase 3 UI
**Contributors**: Claude (AI Assistant)

🎉 **Strava OAuth Working! Ready to build the leaderboard UI!**
