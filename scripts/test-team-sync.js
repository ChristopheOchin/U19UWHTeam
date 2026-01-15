#!/usr/bin/env node
/**
 * Test Team Activity Sync
 *
 * Tests fetching activities from all team members
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

// Team member IDs
const TEAM_MEMBERS = [
  { id: 196048899, name: 'Christophe (coach)' },
  { id: 109066463, name: 'Alex' },
  { id: 200721606, name: 'Drake' },
  { id: 141454027, name: 'Fritz' },
  { id: 137374708, name: 'Max' },
  { id: 200730680, name: 'Oliver' },
  { id: 180165458, name: 'Paxton' },
  { id: 141634408, name: 'Blake' },
  { id: 198267219, name: 'Levi' },
];

console.log('\n🏊 Testing Team Activity Sync\n');
console.log(`Team Members: ${TEAM_MEMBERS.length}\n`);

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

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    let totalActivities = 0;
    let completedRequests = 0;

    // Fetch activities for each team member
    TEAM_MEMBERS.forEach((member, index) => {
      setTimeout(() => {
        const actReq = https.request({
          hostname: 'www.strava.com',
          path: `/api/v3/athletes/${member.id}/activities?after=${sevenDaysAgo}&per_page=30`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }, (actRes) => {
          let actData = '';
          actRes.on('data', chunk => actData += chunk);
          actRes.on('end', () => {
            completedRequests++;

            if (actRes.statusCode === 200) {
              const activities = JSON.parse(actData);
              totalActivities += activities.length;

              const swimTypes = ['Swim', 'Pool Swim', 'Open Water Swim'];
              const swimming = activities.filter(a =>
                swimTypes.includes(a.type) ||
                a.name.toLowerCase().includes('swim') ||
                a.name.toLowerCase().includes('pool') ||
                a.name.toLowerCase().includes('uwh')
              );

              console.log(`${index + 1}. ${member.name.padEnd(20)} | Activities: ${activities.length.toString().padStart(2)} | Swimming: ${swimming.length.toString().padStart(2)} ✓`);

              if (activities.length > 0) {
                const latest = activities[0];
                const date = new Date(latest.start_date).toLocaleDateString();
                console.log(`   Latest: "${latest.name}" (${latest.type}) on ${date}`);
              }
            } else {
              console.log(`${index + 1}. ${member.name.padEnd(20)} | ✗ Error ${actRes.statusCode}`);
            }

            if (completedRequests === TEAM_MEMBERS.length) {
              console.log('\n' + '='.repeat(60));
              console.log(`\n✅ Total activities from all team members: ${totalActivities}`);
              console.log(`   Team members checked: ${TEAM_MEMBERS.length}`);
              console.log(`   Time period: Last 7 days\n`);

              if (totalActivities > 0) {
                console.log('🎉 Team sync working! Ready to build leaderboard UI.\n');
              } else {
                console.log('⚠️  No activities in last 7 days. Team needs to log workouts!\n');
              }
            }
          });
        });

        actReq.on('error', (error) => {
          console.error(`${index + 1}. ${member.name} | ✗ Request failed:`, error.message);
          completedRequests++;
        });

        actReq.end();
      }, index * 200); // Stagger requests by 200ms to avoid rate limiting
    });
  });
});

tokenReq.on('error', (error) => {
  console.error('❌ Token request failed:', error);
});

tokenReq.write(tokenData);
tokenReq.end();
