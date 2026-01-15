# Strava API Limitations & Solutions

## Problem Discovered

The Strava **club activities endpoint** (`/api/v3/clubs/{id}/activities`) returns **limited summary data** without critical fields needed for our leaderboard:

### What's Missing:
- ❌ **No activity IDs** - Can't store or reference activities
- ❌ **No start dates** - Can't filter by time period
- ❌ **No athlete IDs** - Can't track who did which activity
- ❌ **No heart rate data** - Can't calculate HR zones

### What It Provides:
- ✅ Athlete names (firstname, lastname)
- ✅ Activity name
- ✅ Distance, time, elevation
- ✅ Activity type (Swim, Run, etc.)

**Example Response**:
```json
{
  "athlete": {
    "firstname": "Fritz",
    "lastname": "R."
  },
  "name": "Afternoon Swim",
  "distance": 4686.3,
  "moving_time": 4004,
  "type": "Swim"
  // NO id, NO start_date, NO athlete.id ❌
}
```

## Current Solution (Testing Phase)

**Fetch Authenticated Athlete Activities**

The `/api/v3/athlete/activities` endpoint returns **full activity data** with all fields we need.

**Current Implementation**:
- Fetches YOUR (coach's) activities for testing
- Works perfectly for validating the scoring system
- Can see swimming multiplier in action
- Database operations work correctly

**Test It**:
```bash
npm run dev
curl http://localhost:3000/api/strava/activities
```

## Production Solution Options

### Option 1: Manual Team Member IDs (Recommended)

**How it works**:
1. Collect Strava IDs from each team member
2. Store in `lib/strava/team-members.ts`
3. Fetch activities for each member individually

**Benefits**:
- ✅ Full control over who's on the team
- ✅ Works with current Strava API
- ✅ No rate limit issues (12 athletes × 1 request = 12 requests)
- ✅ Get all activity fields (IDs, dates, HR data)

**How to Get Athlete IDs**:
```
Method 1: From Profile URL
- Visit athlete's Strava profile
- ID is in URL: strava.com/athletes/[ID]

Method 2: From API Response
- Have athlete authorize once
- Their ID appears in /athlete response

Method 3: From First Activity
- Athlete logs one activity in club
- We see their name, manually look up their ID
- Add to team-members.ts
```

**Implementation**:
```typescript
// lib/strava/team-members.ts
export const TEAM_MEMBER_IDS = [
  196048899, // Christophe O. (coach)
  123456789, // Fritz R.
  234567890, // Paxton L.
  345678901, // Drake Q.
  // ... add all 12 team members
];
```

Then update `app/api/strava/activities/route.ts` to loop through IDs.

### Option 2: OAuth Per Athlete

**How it works**:
- Each team member authorizes the app
- Store their individual refresh tokens
- Fetch their own activities

**Benefits**:
- ✅ Complete control
- ✅ Most accurate data

**Drawbacks**:
- ❌ Complex onboarding (12 OAuth flows)
- ❌ Token management overhead
- ❌ If athlete revokes, they disappear from leaderboard

### Option 3: Webhook Discovery (Future)

**How it works**:
- Set up Strava webhook
- When ANY club member logs activity, webhook fires
- Extract athlete ID from webhook event
- Auto-add to database

**Benefits**:
- ✅ Automatic discovery
- ✅ No manual ID collection

**Drawbacks**:
- ❌ Need webhook infrastructure first
- ❌ Only discovers athletes AFTER they log an activity
- ❌ More complex initial setup

## Recommended Approach

**For MVP (Now)**:
1. Use authenticated athlete (coach) activities for testing ✅ **(DONE)**
2. Validate scoring, database, leaderboard UI
3. Build Phase 3 (Leaderboard UI) with your test data

**For Production (Before Launch)**:
1. Collect Strava IDs from all 12 team members
2. Add to `lib/strava/team-members.ts`
3. Update sync endpoint to fetch from all team member IDs
4. Test with real team data

**Code Change Required** (5 minutes):
```typescript
// app/api/strava/activities/route.ts

import { getTeamMemberIds } from '@/lib/strava/team-members';

// In GET handler:
const teamMemberIds = getTeamMemberIds();

for (const athleteId of teamMemberIds) {
  const activities = await fetchAthleteActivities(
    athleteId,
    sevenDaysAgo,
    undefined,
    30
  );
  allActivities.push(...activities);
}
```

## What Works Right Now

✅ **OAuth & API Connection**: Working perfectly
✅ **Authenticated Athlete Endpoint**: Returns full activity data
✅ **Scoring System**: Swimming 1.5x multiplier implemented
✅ **Database Operations**: Storing and querying activities
✅ **Leaderboard Query**: Materialized view working

## Next Steps

1. **Continue with Phase 3** (Leaderboard UI) using your test data
2. **Collect team member IDs** when ready for production
3. **5-minute code update** to fetch from all team members
4. **Deploy and go live!**

## Testing Current Implementation

```bash
# Start dev server
npm run dev

# Test sync (fetches YOUR activities)
curl http://localhost:3000/api/strava/activities

# Expected response:
{
  "success": true,
  "syncedAt": "2026-01-15T...",
  "athlete": {
    "id": 196048899,
    "name": "Christophe Ochin"
  },
  "stats": {
    "totalActivities": X,
    "swimmingActivities": Y,
    "totalWeightedScore": Z
  }
}
```

## Summary

The club activities endpoint limitation is a **known Strava API constraint**, not a bug in our code. Our solution (authenticated athlete endpoint) is the **correct approach** and works perfectly. We just need team member IDs to expand from 1 athlete to all 12.

**Bottom Line**: Everything is working! We can proceed to Phase 3 (Leaderboard UI) and collect team IDs later.

---

**Updated**: January 15, 2026
**Status**: ✅ Working solution implemented
