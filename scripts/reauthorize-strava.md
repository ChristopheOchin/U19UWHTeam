# Re-authorize Strava with Correct Scopes

The current authorization doesn't include the scope to read other athletes' activities.

## Step 1: Visit This Authorization URL

Click this link (or copy to browser):

```
https://www.strava.com/oauth/authorize?client_id=195839&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=read,activity:read_all,profile:read_email
```

## Step 2: Click "Authorize"

Make sure the permissions include:
- ✅ View data about your activities
- ✅ View data about your public profile

## Step 3: Get the New Refresh Token

After authorizing, you'll be redirected to a URL like:
```
http://localhost:3000/exchange_token?code=ABC123XYZ...
```

Copy the `code` parameter (the long string after `code=`), then run:

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=195839 \
  -d client_secret=1ed430c2c3ea2aaa5b51c761a70c9c69984dfb78 \
  -d code=YOUR_CODE_HERE \
  -d grant_type=authorization_code
```

## Step 4: Update .env.local

Replace the `STRAVA_REFRESH_TOKEN` in `.env.local` with the new `refresh_token` from the response.

---

## Alternative: Use the Interactive Script

If curl doesn't work, use:

```bash
node scripts/get-strava-token.js
```

Enter:
- Client ID: `195839`
- Client Secret: `1ed430c2c3ea2aaa5b51c761a70c9c69984dfb78`

Then follow the prompts!
