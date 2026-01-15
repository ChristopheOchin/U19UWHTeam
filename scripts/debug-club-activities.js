#!/usr/bin/env node
/**
 * Debug Club Activities - Show Raw Data
 *
 * Shows ALL activities from the club with their exact timestamps
 * to debug why activities aren't being detected in last 7 days
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

console.log('\n🔍 Debugging Club Activities\n');

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

    // Fetch club activities
    const activitiesReq = https.request({
      hostname: 'www.strava.com',
      path: `/api/v3/clubs/${CLUB_ID}/activities?page=1&per_page=20`,
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

          console.log(`📊 Found ${activities.length} recent activities\n`);
          console.log('Current time (local):', new Date().toISOString());
          console.log('Current timestamp:', Date.now());

          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          console.log('7 days ago timestamp:', sevenDaysAgo);
          console.log('7 days ago date:', new Date(sevenDaysAgo).toISOString());
          console.log('\n' + '='.repeat(80) + '\n');

          activities.forEach((act, i) => {
            const actDate = new Date(act.start_date);
            const actTimestamp = actDate.getTime();
            const hoursAgo = (Date.now() - actTimestamp) / (1000 * 60 * 60);
            const daysAgo = hoursAgo / 24;
            const isWithinSevenDays = actTimestamp >= sevenDaysAgo;

            console.log(`Activity ${i + 1}: ${act.name}`);
            console.log(`  Athlete: ${act.athlete?.firstname || 'Unknown'} (ID: ${act.athlete?.id})`);
            console.log(`  Type: ${act.type}`);
            console.log(`  Start Date (ISO): ${act.start_date}`);
            console.log(`  Start Date (parsed): ${actDate.toISOString()}`);
            console.log(`  Timestamp: ${actTimestamp}`);
            console.log(`  Age: ${hoursAgo.toFixed(1)} hours (${daysAgo.toFixed(1)} days) ago`);
            console.log(`  Within 7 days? ${isWithinSevenDays ? '✅ YES' : '❌ NO'}`);
            console.log('');
          });

          const recentActivities = activities.filter(act => {
            const actTimestamp = new Date(act.start_date).getTime();
            return actTimestamp >= sevenDaysAgo;
          });

          console.log('='.repeat(80));
          console.log(`\n✅ Activities within last 7 days: ${recentActivities.length} / ${activities.length}\n`);

          if (recentActivities.length === 0 && activities.length > 0) {
            console.log('⚠️  WARNING: Activities exist but none are within 7 days!');
            console.log('    This could indicate:');
            console.log('    1. Activities are older than 7 days');
            console.log('    2. Timezone issue in date parsing');
            console.log('    3. System clock mismatch\n');
          }
        } else {
          console.error(`❌ Failed (Status: ${actRes.statusCode})`);
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
