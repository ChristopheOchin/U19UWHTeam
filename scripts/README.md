# Strava OAuth Setup Scripts

## Quick Start: Get Your Refresh Token

### Option 1: Interactive Script (Recommended)

```bash
node scripts/get-strava-token.js
```

This script will:
1. Ask for your Client ID and Client Secret
2. Generate an authorization URL for you
3. Exchange the auth code for a refresh token
4. Output the environment variables ready to copy

### Option 2: Manual Setup

If you prefer to do it manually, follow the steps in [SETUP_STRAVA.md](../SETUP_STRAVA.md).

## What You Need

Before running the script, have these ready:

1. **Strava Client ID** - From https://www.strava.com/settings/api
2. **Strava Client Secret** - From the same page

## Example Output

```
✅ Success! Here are your tokens:

Add these to your .env.local file:

STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abc123...
STRAVA_REFRESH_TOKEN=xyz789...
STRAVA_WEBHOOK_VERIFY_TOKEN=randomstring

📝 Athlete Info:
   Name: John Smith
   ID: 987654

✅ Setup complete! Your app can now access Strava activities.
```

## After Getting Your Tokens

1. Copy the output to your `.env.local` file
2. Also add these to your Vercel project environment variables
3. Run `npm run dev` and test the integration:
   ```bash
   curl http://localhost:3000/api/strava/activities
   ```

## Troubleshooting

### "Authorization code expired"
- The auth code only lasts 10 minutes
- Visit the authorization URL again to get a new code

### "Invalid client credentials"
- Double-check your Client ID and Client Secret
- Make sure you copied them correctly from Strava

### "Scope not authorized"
- Make sure you clicked "Authorize" on the Strava page
- Check that the scopes in the URL include `activity:read_all`

## Need Your Client ID?

If you already created a Strava app but don't remember your Client ID:

1. Go to https://www.strava.com/settings/api
2. Your Client ID is shown next to your application name
3. Click "Show" to reveal your Client Secret (if needed)
