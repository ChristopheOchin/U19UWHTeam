#!/usr/bin/env node
/**
 * Strava OAuth Helper Script
 *
 * This script helps you get a refresh token for the Strava API.
 *
 * Usage:
 *   1. Run: node scripts/get-strava-token.js
 *   2. Follow the instructions to authorize
 *   3. Copy the refresh token to your .env.local file
 */

const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🏊 Strava OAuth Setup Helper\n');
  console.log('This script will help you get a refresh token for the Strava API.\n');

  // Get client credentials
  const clientId = await question('Enter your Strava Client ID: ');
  const clientSecret = await question('Enter your Strava Client Secret: ');

  console.log('\n📋 Step 1: Authorize Your Application\n');
  console.log('Visit this URL in your browser:\n');

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=activity:read_all,profile:read_email`;

  console.log(authUrl);
  console.log('\n');

  const authCode = await question('After authorizing, paste the "code" parameter from the redirect URL: ');

  console.log('\n🔄 Step 2: Exchanging code for tokens...\n');

  const postData = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: authCode.trim(),
    grant_type: 'authorization_code'
  });

  const options = {
    hostname: 'www.strava.com',
    port: 443,
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (res.statusCode === 200) {
          console.log('✅ Success! Here are your tokens:\n');
          console.log('─────────────────────────────────────────────────────\n');
          console.log('Add these to your .env.local file:\n');
          console.log(`STRAVA_CLIENT_ID=${clientId}`);
          console.log(`STRAVA_CLIENT_SECRET=${clientSecret}`);
          console.log(`STRAVA_REFRESH_TOKEN=${response.refresh_token}`);
          console.log(`STRAVA_WEBHOOK_VERIFY_TOKEN=${Math.random().toString(36).substring(2, 15)}\n`);
          console.log('─────────────────────────────────────────────────────\n');
          console.log('📝 Athlete Info:');
          console.log(`   Name: ${response.athlete.firstname} ${response.athlete.lastname}`);
          console.log(`   ID: ${response.athlete.id}\n`);
          console.log('✅ Setup complete! Your app can now access Strava activities.\n');
        } else {
          console.error('❌ Error:', response);
          console.error('\nTroubleshooting:');
          console.error('- Make sure the authorization code is correct and not expired');
          console.error('- Check that your Client ID and Client Secret are correct');
          console.error('- Try the authorization URL again to get a new code\n');
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error);
        console.error('Raw response:', data);
      }

      rl.close();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error);
    rl.close();
  });

  req.write(postData);
  req.end();
}

main().catch(console.error);
