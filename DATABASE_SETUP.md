# Database Setup Instructions

Your app is deployed but the database schema hasn't been created yet. Follow these steps:

## Quick Setup

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project: `u19-uwh-team`

2. **Navigate to Database**
   - Click "Storage" tab
   - Click on "u19-team-db" (your Postgres database)
   - Click "Query" or the ".sql" tab

3. **Run the Migration**
   - Open the file: `lib/db/migrations/001_initial.sql`
   - Copy ALL the SQL code (lines 1-84)
   - Paste it into the Vercel SQL query editor
   - Click "Execute" or "Run"

4. **Verify Tables Created**
   After running the migration, you should see:
   - ✅ `athletes` table
   - ✅ `activities` table
   - ✅ `weekly_leaderboard` materialized view
   - ✅ `refresh_weekly_leaderboard()` function

## Test the Setup

Once the migration is complete, test it:

```bash
# Sync activities from Strava (this should work now)
curl https://u19-uwh-team.vercel.app/api/strava/activities

# Check leaderboard data
curl https://u19-uwh-team.vercel.app/api/leaderboard/data
```

## What This Creates

### Tables
- **athletes**: Stores team member profiles from Strava
- **activities**: Stores all training activities with scores

### Materialized View
- **weekly_leaderboard**: Pre-computed rankings for last 7 days
  - Includes total activities, swimming count, scores
  - Sorted by composite score (60% activity count + 40% weighted score)

### Function
- **refresh_weekly_leaderboard()**: Refreshes the materialized view after new activities are synced

## Expected Behavior After Setup

1. Visit `/api/strava/activities` → Fetches coach's activities from Strava
2. Activities are scored and stored in database
3. Materialized view is refreshed
4. Leaderboard at `/team` shows ranked athletes
5. Data updates every 30 seconds via client polling

## Troubleshooting

### "No Athletes Yet" on leaderboard
- Make sure you ran the migration
- Visit `/api/strava/activities` to sync data
- Check Vercel logs for errors

### "Function does not exist" error
- The migration didn't run completely
- Re-run the SQL migration file

### No activities showing
- Check Strava API credentials in environment variables
- Make sure activities exist in last 7 days
- Check Vercel function logs for API errors

## Current Limitation

⚠️ **Privacy Note**: Currently only fetching activities from the authenticated user (coach) due to Strava API limitations.

For full team leaderboard, team members need to:
- Make their Strava activities public, OR
- Individually OAuth authenticate (future Phase 4)

See `STRAVA_PRIVACY_SOLUTION.md` for details.
