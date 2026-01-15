# Phase 2: Strava Integration - COMPLETE ✅

## Summary

Phase 2 has been successfully implemented! The Strava API integration is now in place, allowing the application to fetch, score, and store team training activities.

## What Was Built

### 1. Strava OAuth Configuration
**Files**: `lib/strava/config.ts`, `lib/strava/oauth.ts`

- Lazy-loaded configuration with environment variable validation
- Automatic access token refresh using coach's refresh token
- 6-hour token caching to minimize API calls
- Error handling and retry logic

### 2. Strava API Client
**Files**: `lib/strava/api.ts`, `lib/strava/types.ts`

- Full Strava API integration with TypeScript types
- Built-in rate limiter (respects 100 requests per 15 minutes)
- Functions to fetch:
  - Followed athletes (team members)
  - Individual athlete activities
  - Team-wide activities
  - Weekly activities (last 7 days)
- Request queuing with exponential backoff
- Comprehensive error handling

### 3. Activity Scoring System
**Files**: `lib/scoring/activities.ts`, `lib/scoring/heartrate.ts`

#### Swimming Multiplier (1.5x)
- Detects swimming activities by type and keywords
- Base score: `(moving_time_minutes + distance_km)`
- Swimming score: `base_score × 1.5`
- Other activities: `base_score × 1.0`

**Swimming Detection**:
- Activity types: 'Swim', 'Pool Swim', 'Open Water Swim'
- Name keywords: 'swim', 'pool', 'laps', 'uwh', 'underwater hockey'

#### Composite Leaderboard Score
```
composite_score = (activity_count × 100 × 0.6) + (total_weighted_score × 0.4)
```

- **60% weight on consistency** (activity count)
- **40% weight on volume** (weighted score with swimming multiplier)
- Fair to all athletes regardless of HR monitor

#### Heart Rate Zones (Informational Only)
- Zone 1 (50-60%): Recovery
- Zone 2 (60-70%): Endurance
- Zone 3 (70-80%): Tempo
- Zone 4 (80-90%): Threshold
- Zone 5 (90-100%): VO2 Max
- **NOT used in leaderboard rankings**
- Displayed separately for athletes who track HR

### 4. Database Operations
**File**: `lib/db/queries.ts`

- `upsertAthlete()` / `upsertAthletes()` - Store team members
- `upsertActivity()` / `upsertActivities()` - Store activities with scores
- `deleteActivity()` - Remove activity (for webhook events)
- `getAthletes()` - Fetch all team members
- `getAthleteActivities()` - Get activities for one athlete
- `getActivities()` - Get all activities with date filtering
- `getRecentActivities()` - Activity feed data
- `refreshWeeklyLeaderboard()` - Update materialized view
- `getWeeklyLeaderboard()` - Get ranked athletes

### 5. Caching Layer
**File**: `lib/cache/redis.ts` (updated)

- Exported `kv` client for direct usage
- Helper functions: `getCached()`, `setCached()`, `deleteCached()`
- Cache invalidation: `invalidateLeaderboardCaches()`
- TTL configuration:
  - Access token: 6 hours
  - Leaderboard: 5 minutes
  - Activity feed: 2 minutes

### 6. API Endpoint
**File**: `app/api/strava/activities/route.ts`

#### GET /api/strava/activities
- Fetches all team activities from last 7 days
- Scores activities with swimming multiplier
- Stores in database
- Refreshes leaderboard materialized view
- Returns sync statistics
- Cached for 5 minutes to avoid excessive API calls

**Response Example**:
```json
{
  "success": true,
  "syncedAt": "2026-01-15T12:34:56.789Z",
  "stats": {
    "athletes": 15,
    "totalActivities": 143,
    "swimmingActivities": 62,
    "totalWeightedScore": 12847
  }
}
```

#### POST /api/strava/activities
- Force refresh (bypasses cache)
- Useful for manual sync triggers

### 7. Documentation & Testing
**Files**: `SETUP_STRAVA.md`, `lib/scoring/__tests__/activities.test.ts`

- Complete OAuth setup guide
- Environment variable configuration
- Testing procedures
- Troubleshooting tips
- Unit tests for scoring validation

## Environment Variables Required

Add these to `.env.local` (local) and Vercel (production):

```bash
# Strava API
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token
STRAVA_WEBHOOK_VERIFY_TOKEN=random_string
```

## Setup Instructions

See [SETUP_STRAVA.md](./SETUP_STRAVA.md) for detailed OAuth setup instructions.

## Testing the Integration

### 1. Run Unit Tests

```bash
# Run scoring tests
npx ts-node lib/scoring/__tests__/activities.test.ts
```

Expected output:
```
✓ Swimming detection working
✓ Weighted score calculation correct
✓ Swimming 1.5x multiplier verified
✓ Composite score formula correct
```

### 2. Test API Endpoint

```bash
# Start dev server
npm run dev

# In another terminal, test sync
curl http://localhost:3000/api/strava/activities
```

### 3. Verify Database

```sql
-- Check athletes were stored
SELECT COUNT(*) FROM athletes;

-- Check activities with scores
SELECT
  name,
  type,
  moving_time / 60 AS minutes,
  distance / 1000 AS km,
  weighted_score
FROM activities
ORDER BY start_date DESC
LIMIT 10;

-- Check leaderboard
SELECT * FROM weekly_leaderboard
ORDER BY composite_score DESC;
```

## Scoring Examples

### Example 1: Swimming Activity
```
Activity: "Morning pool laps"
Type: Swim
Time: 60 minutes
Distance: 2 km

Base score = 60 + 2 = 62
Weighted score = 62 × 1.5 = 93 ✓
```

### Example 2: Running Activity
```
Activity: "Morning run"
Type: Run
Time: 60 minutes
Distance: 10 km

Base score = 60 + 10 = 70
Weighted score = 70 × 1.0 = 70 ✓
```

### Example 3: Composite Score
```
Athlete: John Smith
Activities: 10
Total weighted score: 850

Activity component = 10 × 100 × 0.6 = 600
Weighted component = 850 × 0.4 = 340
Composite score = 600 + 340 = 940 ✓
```

## File Structure

```
/Users/cochin/Documents/U19UWHTeam/
├── lib/
│   ├── strava/
│   │   ├── config.ts              # API configuration
│   │   ├── oauth.ts               # Token management
│   │   ├── api.ts                 # API client
│   │   └── types.ts               # TypeScript types
│   ├── scoring/
│   │   ├── activities.ts          # Scoring logic
│   │   ├── heartrate.ts           # HR zones
│   │   └── __tests__/
│   │       └── activities.test.ts # Unit tests
│   ├── db/
│   │   └── queries.ts             # Database operations
│   └── cache/
│       └── redis.ts               # Caching (updated)
├── app/api/strava/activities/
│   └── route.ts                   # Sync endpoint
└── SETUP_STRAVA.md                # Setup guide
```

## Key Decisions & Rationale

### 1. Swimming 1.5x Multiplier (NOT 3x)
- Balanced incentive without being excessive
- Prevents gaming the system
- Still creates desired FOMO effect
- Discussed and approved by team

### 2. Composite Score Formula
- 60% activity count rewards consistency
- 40% weighted score rewards volume
- Encourages both frequency and quality
- Swimming multiplier embedded in weighted score

### 3. HR Zones Not in Rankings
- Fair to athletes without HR monitors
- Avoids equipment-based advantage
- HR data shown separately for insight only
- Keeps competition accessible to all

### 4. 7-Day Rolling Window
- Dynamic timeframe (not calendar week)
- Keeps leaderboard fresh
- Motivates recent activity
- Implemented via materialized view

### 5. Rate Limiting Strategy
- Conservative approach (stays under limits)
- Queue system prevents burst issues
- Caching reduces API calls
- Handles ~15 athletes well under 100 req/15min

## Known Limitations

1. **HR zone distribution**: Simplified calculation using average HR
   - Full zone distribution requires HR stream data (future enhancement)
   - Current approach is accurate enough for informational display

2. **Swimming detection**: Keyword-based fallback
   - Works well for most cases
   - Manual override option could be added later

3. **Rate limits**: No persistent tracking across deployments
   - In-memory counter resets on restart
   - KV-based tracking could be added if needed

4. **Materialized view**: Manual refresh required
   - Automatically refreshed after sync
   - Could add scheduled refresh in future

## Next Steps

### Phase 3: Leaderboard UI 🚀

Now that data fetching and scoring are complete, we can build the user interface:

1. **Leaderboard Components**:
   - `Leaderboard.tsx` - Main container with polling
   - `AthleteCard.tsx` - Ranked athlete display with FOMO elements
   - `ActivityFeed.tsx` - Real-time activity stream
   - Visual indicators (swimming glow, gap display, streaks)

2. **API Endpoint**:
   - `GET /api/leaderboard/data` - Serve formatted rankings

3. **FOMO Design Elements**:
   - Swimming spotlight (aqua glow)
   - Points behind leader indicator
   - Hot streak badges (🔥 consecutive days)
   - Real-time pulse (recent activity animation)
   - Toast notifications

4. **HR Intensity Dashboard**:
   - Separate informational view
   - Bar chart showing zone distribution
   - Only for athletes with HR data
   - No impact on rankings

### Phase 4: Webhooks (After Phase 3)

Real-time updates when athletes log activities:
- Register webhook subscription with Strava
- Process create/update/delete events
- Invalidate caches automatically
- Trigger client-side updates

## Success Criteria ✅

- [x] Strava OAuth setup complete
- [x] API client with rate limiting working
- [x] Swimming 1.5x multiplier implemented correctly
- [x] Composite score formula validated
- [x] HR zones calculated (informational)
- [x] Database operations functional
- [x] Caching layer integrated
- [x] API endpoint returns valid data
- [x] Unit tests passing
- [x] Documentation complete
- [x] Build succeeds without errors

## Notes

- **Security**: Never commit `.env.local` with real tokens
- **Rate Limits**: Monitor API usage in Strava developer dashboard
- **Refresh Token**: Doesn't expire but can be revoked by user
- **Access Token**: Auto-refreshes every 6 hours
- **Database**: Materialized view improves query performance

---

**Phase 2 Completed**: January 15, 2026
**Ready for Phase 3**: Leaderboard UI Development
**Contributors**: Claude (AI Assistant)

🎉 **Strava Integration Complete!**
