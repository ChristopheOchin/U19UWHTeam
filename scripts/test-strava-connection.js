#!/usr/bin/env node
/**
 * Test Strava API Connection
 *
 * This script tests your Strava OAuth credentials without requiring database setup.
 * It will fetch the authenticated athlete's profile and recent activities.
 *
 * Usage: node scripts/test-strava-connection.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

console.log('\n🏊 Testing Strava API Connection\n');

// Validate environment variables
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('❌ Missing Strava credentials in .env.local');
  console.error('   Required: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN');
  process.exit(1);
}

console.log('✓ Environment variables loaded');
console.log(`  Client ID: ${CLIENT_ID}`);
console.log(`  Client Secret: ${CLIENT_SECRET.substring(0, 8)}...`);
console.log(`  Refresh Token: ${REFRESH_TOKEN.substring(0, 8)}...\n`);

// Step 1: Get access token
console.log('📡 Step 1: Refreshing access token...');

const tokenData = JSON.stringify({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  grant_type: 'refresh_token',
  refresh_token: REFRESH_TOKEN
});

const tokenOptions = {
  hostname: 'www.strava.com',
  path: '/oauth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': tokenData.length
  }
};

const tokenReq = https.request(tokenOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (res.statusCode !== 200) {
        console.error('❌ Failed to get access token');
        console.error('   Status:', res.statusCode);
        console.error('   Response:', response);
        process.exit(1);
      }

      const accessToken = response.access_token;
      console.log('✓ Access token received\n');

      // Step 2: Get authenticated athlete
      console.log('📡 Step 2: Fetching athlete profile...');

      const athleteOptions = {
        hostname: 'www.strava.com',
        path: '/api/v3/athlete',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      };

      const athleteReq = https.request(athleteOptions, (athleteRes) => {
        let athleteData = '';

        athleteRes.on('data', (chunk) => {
          athleteData += chunk;
        });

        athleteRes.on('end', () => {
          const athlete = JSON.parse(athleteData);

          if (athleteRes.statusCode !== 200) {
            console.error('❌ Failed to fetch athlete');
            console.error('   Status:', athleteRes.statusCode);
            process.exit(1);
          }

          console.log('✓ Athlete profile fetched');
          console.log(`  Name: ${athlete.firstname} ${athlete.lastname}`);
          console.log(`  ID: ${athlete.id}`);
          console.log(`  Username: ${athlete.username || 'N/A'}\n`);

          // Step 3: Get friends (team members)
          console.log('📡 Step 3: Fetching followed athletes (team members)...');

          const friendsOptions = {
            hostname: 'www.strava.com',
            path: '/api/v3/athlete/friends?per_page=200',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          };

          const friendsReq = https.request(friendsOptions, (friendsRes) => {
            let friendsData = '';

            friendsRes.on('data', (chunk) => {
              friendsData += chunk;
            });

            friendsRes.on('end', () => {
              const friends = JSON.parse(friendsData);

              if (friendsRes.statusCode !== 200) {
                console.error('❌ Failed to fetch friends');
                console.error('   Status:', friendsRes.statusCode);
                process.exit(1);
              }

              console.log(`✓ Found ${friends.length} followed athletes (team members)`);

              if (friends.length > 0) {
                console.log('\n  Team Members:');
                friends.slice(0, 5).forEach((friend, i) => {
                  console.log(`    ${i + 1}. ${friend.firstname} ${friend.lastname} (@${friend.username || 'N/A'})`);
                });
                if (friends.length > 5) {
                  console.log(`    ... and ${friends.length - 5} more`);
                }
              } else {
                console.warn('\n⚠️  Warning: No followed athletes found!');
                console.warn('   Make sure the coach account follows all team members on Strava.');
              }

              // Step 4: Get recent activities
              console.log('\n📡 Step 4: Fetching recent activities...');

              const activitiesOptions = {
                hostname: 'www.strava.com',
                path: '/api/v3/athlete/activities?per_page=10',
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              };

              const activitiesReq = https.request(activitiesOptions, (activitiesRes) => {
                let activitiesData = '';

                activitiesRes.on('data', (chunk) => {
                  activitiesData += chunk;
                });

                activitiesRes.on('end', () => {
                  const activities = JSON.parse(activitiesData);

                  if (activitiesRes.statusCode !== 200) {
                    console.error('❌ Failed to fetch activities');
                    console.error('   Status:', activitiesRes.statusCode);
                    process.exit(1);
                  }

                  console.log(`✓ Found ${activities.length} recent activities\n`);

                  if (activities.length > 0) {
                    console.log('  Recent Activities:');
                    activities.slice(0, 3).forEach((activity, i) => {
                      const date = new Date(activity.start_date).toLocaleDateString();
                      const distance = (activity.distance / 1000).toFixed(1);
                      const time = Math.round(activity.moving_time / 60);
                      console.log(`    ${i + 1}. ${activity.name}`);
                      console.log(`       Type: ${activity.type} | Distance: ${distance}km | Time: ${time}min | Date: ${date}`);
                    });
                  }

                  console.log('\n✅ All tests passed!');
                  console.log('\n📋 Next Steps:');
                  console.log('   1. Add database credentials to .env.local (Vercel Postgres & KV)');
                  console.log('   2. Run: npm run dev');
                  console.log('   3. Test sync: curl http://localhost:3000/api/strava/activities');
                  console.log('   4. Check that activities are stored in the database\n');
                });
              });

              activitiesReq.on('error', (error) => {
                console.error('❌ Request failed:', error);
                process.exit(1);
              });

              activitiesReq.end();
            });
          });

          friendsReq.on('error', (error) => {
            console.error('❌ Request failed:', error);
            process.exit(1);
          });

          friendsReq.end();
        });
      });

      athleteReq.on('error', (error) => {
        console.error('❌ Request failed:', error);
        process.exit(1);
      });

      athleteReq.end();
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      process.exit(1);
    }
  });
});

tokenReq.on('error', (error) => {
  console.error('❌ Request failed:', error);
  process.exit(1);
});

tokenReq.write(tokenData);
tokenReq.end();
