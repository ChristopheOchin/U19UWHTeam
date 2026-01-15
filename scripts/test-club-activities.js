#!/usr/bin/env node
/**
 * Test Fetching Club Activities
 *
 * Verifies we can fetch activities from the U19 USA UWH club.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local
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
const CLUB_ID = 1853738;

console.log('\n🏊 Testing Club Activities Fetch\n');

// Get access token
const tokenData = JSON.stringify({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  grant_type: 'refresh_token',
  refresh_token: REFRESH_TOKEN
});

const tokenReq = https.request({
  hostname: 'www.strava.com',
  path: '/oauth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': tokenData.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tokenResponse = JSON.parse(data);
    const accessToken = tokenResponse.access_token;

    console.log('✓ Access token obtained\n');
    console.log('📡 Fetching club activities (last 7 days)...\n');

    // Fetch club activities
    const activitiesReq = https.request({
      hostname: 'www.strava.com',
      path: `/api/v3/clubs/${CLUB_ID}/activities?page=1&per_page=200`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (actRes) => {
      let actData = '';
      actRes.on('data', chunk => actData += chunk);
      actRes.on('end', () => {
        if (actRes.statusCode === 200) {
          const activities = JSON.parse(actData);

          // Filter activities from last 7 days
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const recentActivities = activities.filter(act => {
            return new Date(act.start_date).getTime() >= sevenDaysAgo;
          });

          console.log(`✅ Total activities fetched: ${activities.length}`);
          console.log(`✅ Activities from last 7 days: ${recentActivities.length}\n`);

          if (recentActivities.length > 0) {
            // Count swimming activities
            const swimmingTypes = ['Swim', 'Pool Swim', 'Open Water Swim'];
            const swimming = recentActivities.filter(act =>
              swimmingTypes.includes(act.type) ||
              act.name.toLowerCase().includes('swim') ||
              act.name.toLowerCase().includes('pool') ||
              act.name.toLowerCase().includes('uwh')
            );

            console.log(`🏊 Swimming activities: ${swimming.length}`);
            console.log(`🏃 Other activities: ${recentActivities.length - swimming.length}\n`);

            console.log('📊 Recent Activities:\n');
            recentActivities.slice(0, 10).forEach((act, i) => {
              const date = new Date(act.start_date).toLocaleDateString();
              const time = Math.round(act.moving_time / 60);
              const distance = (act.distance / 1000).toFixed(1);
              const athleteName = act.athlete ? `${act.athlete.firstname || 'Unknown'}` : 'Unknown';
              const isSwim = swimmingTypes.includes(act.type) || act.name.toLowerCase().includes('swim');

              console.log(`  ${i + 1}. ${act.name} ${isSwim ? '🏊' : ''}`);
              console.log(`     Athlete: ${athleteName} (ID: ${act.athlete?.id || 'N/A'})`);
              console.log(`     Type: ${act.type} | ${distance}km | ${time}min | ${date}`);
            });

            if (recentActivities.length > 10) {
              console.log(`\n  ... and ${recentActivities.length - 10} more activities`);
            }

            // Extract unique athletes
            const athletes = new Map();
            recentActivities.forEach(act => {
              if (act.athlete?.id) {
                athletes.set(act.athlete.id, {
                  id: act.athlete.id,
                  name: `${act.athlete.firstname || ''} ${act.athlete.lastname || ''}`.trim()
                });
              }
            });

            console.log(`\n👥 Unique athletes with activities: ${athletes.size}\n`);

            console.log('✅ Club activities endpoint working perfectly!');
            console.log('\n📋 Next steps:');
            console.log('   1. Make sure database credentials are in .env.local');
            console.log('   2. Run: npm run dev');
            console.log('   3. Test full sync: curl http://localhost:3000/api/strava/activities\n');
          } else {
            console.log('⚠️  No activities found in the last 7 days.');
            console.log('   Team members should log activities on Strava.\n');
          }
        } else {
          console.error(`❌ Failed to fetch club activities (Status: ${actRes.statusCode})`);
          console.error(actData);
        }
      });
    });

    activitiesReq.on('error', error => {
      console.error('❌ Request failed:', error);
    });

    activitiesReq.end();
  });
});

tokenReq.on('error', error => {
  console.error('❌ Token request failed:', error);
});

tokenReq.write(tokenData);
tokenReq.end();
