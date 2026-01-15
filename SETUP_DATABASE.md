# Database Setup Guide

This guide will help you set up Vercel Postgres and Vercel KV for the training leaderboard feature.

## Prerequisites
- Vercel account (free tier works)
- Project deployed to Vercel (or ready to deploy)

## Step 1: Set Up Vercel Postgres

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Select your project (U19UWHTeam)

2. **Navigate to Storage**:
   - Click on "Storage" tab in your project
   - Click "Create Database"
   - Select "Postgres"

3. **Create Database**:
   - Name: `u19-team-db` (or any name you prefer)
   - Region: Choose closest to your team (e.g., `us-east-1`)
   - Click "Create"

4. **Connect to Project**:
   - Vercel will automatically add environment variables to your project:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NO_SSL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

5. **Run Migration**:
   - In the Vercel Postgres dashboard, click "Query" tab
   - Copy the contents of `lib/db/migrations/001_initial.sql`
   - Paste into the query editor
   - Click "Run Query"
   - You should see success messages for table creation

## Step 2: Set Up Vercel KV (Redis)

1. **Create KV Store**:
   - In your Vercel project, go to "Storage" tab
   - Click "Create Database"
   - Select "KV (Redis)"

2. **Configure KV**:
   - Name: `u19-team-cache` (or any name you prefer)
   - Region: Same as Postgres for best performance
   - Click "Create"

3. **Connect to Project**:
   - Vercel will automatically add environment variables:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

## Step 3: Set Up Authentication Secrets

You need to add two environment variables manually:

1. **TEAM_PASSWORD_HASH**:
   - Run this command to generate a bcrypt hash:
     ```bash
     node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_TEAM_PASSWORD', 10).then(console.log)"
     ```
   - Replace `YOUR_TEAM_PASSWORD` with the actual password you want to use
   - Copy the hash output
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add new variable:
     - Name: `TEAM_PASSWORD_HASH`
     - Value: (paste the hash)
     - Environments: Production, Preview, Development

2. **SESSION_SECRET**:
   - Generate a random 32-character string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
   - In Vercel dashboard, add new environment variable:
     - Name: `SESSION_SECRET`
     - Value: (paste the random string)
     - Environments: Production, Preview, Development

## Step 4: Set Up Strava OAuth (Coming in Phase 2)

For now, skip this step. We'll set up Strava credentials when we implement the Strava integration in Phase 2.

You'll need:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN`
- `STRAVA_WEBHOOK_VERIFY_TOKEN`

## Step 5: Local Development Setup

To test locally, create a `.env.local` file in your project root:

```bash
# Copy from Vercel dashboard (Settings → Environment Variables → Show secret)
POSTGRES_URL="postgres://..."
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Generate using the commands above
TEAM_PASSWORD_HASH="$2a$10$..."
SESSION_SECRET="..."

# For local dev
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 6: Test Database Connection

1. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add authentication and database schema"
   git push
   ```

2. **Verify Deployment**:
   - Wait for deployment to complete
   - Visit your deployed site
   - Go to `/team/login`
   - Enter your team password
   - You should be redirected to `/team`

3. **Check Database**:
   - In Vercel Postgres dashboard, go to "Data" tab
   - You should see the `athletes` and `activities` tables
   - The `weekly_leaderboard` materialized view should also exist

## Troubleshooting

### Database Connection Error
- Check that environment variables are set correctly
- Ensure the migration ran successfully
- Try redeploying the project

### Authentication Not Working
- Verify `TEAM_PASSWORD_HASH` matches the password you're entering
- Check browser console for errors
- Ensure `SESSION_SECRET` is set

### KV Cache Error
- Verify KV environment variables are set
- Check Vercel KV dashboard for connection status

## Next Steps

Once database setup is complete:
1. Test the authentication flow
2. Move on to Phase 2: Strava Integration
3. Build the leaderboard UI in Phase 3

---

**Need Help?**
- Vercel Postgres Docs: https://vercel.com/docs/storage/vercel-postgres
- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv
- Project Issues: Create an issue on GitHub
