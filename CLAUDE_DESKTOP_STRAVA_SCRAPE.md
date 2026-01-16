# Claude Desktop: Strava Activity Collection Workflow

This document contains the prompt to send to Claude Desktop (with browser access) to collect athlete activity data from Strava and populate the leaderboard.

---

## Prerequisites

1. **Admin API Key**: Set in Vercel environment variables as `ADMIN_API_KEY`
2. **Athlete List**: All 9 athlete Strava IDs from `lib/strava/team-members.ts`
3. **Claude Desktop**: With browser access enabled

---

## Prompt for Claude Desktop

Copy and paste this prompt to Claude Desktop:

```
I need you to collect Strava activity data for my underwater hockey team and submit it to our leaderboard API.

## Team Athletes (Strava IDs):
1. Christophe O. - 196048899 (coach)
2. Alex - 109066463
3. Drake - 200721606
4. Fritz - 141454027
5. Max - 137374708
6. Oliver - 200730680
7. Paxton - 180165458
8. Blake - 141634408
9. Levi - 198267219

## Your Task:

For each athlete listed above:

1. **Visit their Strava profile**: `https://www.strava.com/athletes/{ATHLETE_ID}`

2. **Extract the following data**:
   - Athlete name (firstname, lastname)
   - Profile picture URL
   - All activities from the last 7 days including:
     - Activity ID (from URL like `/activities/123456789`)
     - Activity name
     - Activity type (e.g., "Run", "Swim", "Ride", "Workout")
     - Sport type (e.g., "Pool Swim", "Open Water Swim")
     - Start date/time (ISO 8601 format)
     - Distance (convert to meters)
     - Moving time (convert to seconds)
     - Elapsed time (convert to seconds)
     - Average heart rate (if available)
     - Max heart rate (if available)

3. **For each athlete, submit data to the API**:

   **Endpoint**: `POST https://u19-uwh-team.vercel.app/api/admin/activities`

   **Headers**:
   ```
   Authorization: Bearer YOUR_ADMIN_KEY_HERE
   Content-Type: application/json
   ```

   **Body format**:
   ```json
   {
     "athlete": {
       "id": 109066463,
       "firstname": "Alex",
       "lastname": "LastName",
       "username": "alex_username",
       "profile": "https://profile-pic-url"
     },
     "activities": [
       {
         "id": 123456789,
         "name": "Morning Swim",
         "type": "Swim",
         "sport_type": "Pool Swim",
         "start_date": "2026-01-16T08:00:00Z",
         "distance": 2000,
         "moving_time": 3600,
         "elapsed_time": 3660,
         "average_heartrate": 145,
         "max_heartrate": 165
       }
     ]
   }
   ```

## Important Notes:

- **Swimming detection**: Activities with type "Swim" or sport_type "Pool Swim"/"Open Water Swim" will get 1.5x score multiplier
- **Activity names**: If name contains "swim", "pool", "laps", "uwh", or "underwater hockey", it's also counted as swimming
- **Time period**: Only collect activities from the last 7 days
- **Private profiles**: If you can't access an athlete's profile, skip them and note it in your response
- **Error handling**: If any API call fails, show me the error and continue with the next athlete

## Workflow:

1. Start with athlete #1 (Christophe O.)
2. Show me what data you extracted before submitting
3. Wait for my confirmation
4. Submit to API
5. Show me the API response
6. Move to next athlete
7. Repeat until all athletes are processed

## Output Format:

After processing all athletes, provide a summary table:

| Athlete | Status | Activities | Swims | Total Score | Notes |
|---------|--------|------------|-------|-------------|-------|
| Christophe O. | ✓ Success | 9 | 3 | 881 | - |
| Alex | ⚠ Private | 0 | 0 | 0 | Profile not accessible |
| ... | ... | ... | ... | ... | ... |

Ready to start? Please browse to the first athlete's profile and show me what you find.
```

---

## Admin API Key Setup

Add this to your Vercel environment variables:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add new variable:
   - **Key**: `ADMIN_API_KEY`
   - **Value**: Generate a strong random key (e.g., `uwh-2026-admin-abc123xyz789`)
3. Redeploy the app

---

## Testing the Endpoint

Test that the endpoint is working:

```bash
# Health check
curl https://u19-uwh-team.vercel.app/api/admin/activities

# Submit test activity
curl -X POST https://u19-uwh-team.vercel.app/api/admin/activities \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "athlete": {
      "id": 196048899,
      "firstname": "Christophe",
      "lastname": "Ochin"
    },
    "activities": [
      {
        "id": 99999999,
        "name": "Test Activity",
        "type": "Swim",
        "start_date": "2026-01-16T10:00:00Z",
        "distance": 1000,
        "moving_time": 1800
      }
    ]
  }'
```

---

## Alternative: Manual CSV Upload

If you prefer to manually collect data first, you can:

1. Create a CSV with athlete activity data
2. Ask Claude Desktop to parse the CSV and make API calls
3. Upload all at once

CSV format:
```
athlete_id,firstname,lastname,activity_id,name,type,start_date,distance_m,moving_time_s
196048899,Christophe,Ochin,12345,Evening Swim,Swim,2026-01-16T19:00:00Z,2000,3600
196048899,Christophe,Ochin,12346,Morning Run,Run,2026-01-15T07:00:00Z,5000,1800
```

---

## Troubleshooting

**Issue**: API returns 401 Unauthorized
- **Solution**: Check that `ADMIN_API_KEY` environment variable is set in Vercel and matches your request header

**Issue**: Activities not appearing on leaderboard
- **Solution**: Check that `start_date` is within the last 7 days and activity was properly scored

**Issue**: Swimming activities not highlighted
- **Solution**: Ensure `type` is "Swim" or `sport_type` includes "Swim", or activity name contains swimming keywords

**Issue**: Claude Desktop can't access Strava profile
- **Solution**: Athlete's profile is private. Ask them to make it public at https://www.strava.com/settings/privacy

---

## Next Steps After Data Collection

1. Refresh the leaderboard: https://u19-uwh-team.vercel.app/team
2. Verify all athletes appear with correct scores
3. Check swimming activities are highlighted in cyan
4. Repeat this process weekly (or set up a cron job to automate)
