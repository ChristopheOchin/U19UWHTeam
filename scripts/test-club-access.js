#!/usr/bin/env node
/**
 * Test Strava Club Access
 *
 * Tests if we can fetch members from the U19 USA UWH Strava club.
 * Club ID: 1853738
 * Club URL: https://www.strava.com/clubs/1853738
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

console.log('\n🏊 Testing Strava Club Access\n');
console.log(`Club: U19 USA UWH (ID: ${CLUB_ID})`);
console.log(`URL: https://www.strava.com/clubs/${CLUB_ID}\n`);

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
    console.log('📡 Fetching club members...\n');

    // Fetch club members
    const clubReq = https.request({
      hostname: 'www.strava.com',
      path: `/api/v3/clubs/${CLUB_ID}/members?per_page=200`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (clubRes) => {
      let clubData = '';
      clubRes.on('data', chunk => clubData += chunk);
      clubRes.on('end', () => {
        if (clubRes.statusCode === 200) {
          const members = JSON.parse(clubData);
          console.log(`✅ Success! Found ${members.length} club members:\n`);

          members.slice(0, 10).forEach((member, i) => {
            console.log(`  ${i + 1}. ${member.firstname} ${member.lastname}`);
            console.log(`     ID: ${member.id} | Username: @${member.username || 'N/A'}`);
          });

          if (members.length > 10) {
            console.log(`  ... and ${members.length - 10} more members`);
          }

          console.log('\n✅ Club access working!');
          console.log('\n📋 Next steps:');
          console.log('   The app will use this club to fetch team activities.');
          console.log('   Make sure all team members have joined the club:\n');
          console.log(`   https://www.strava.com/clubs/${CLUB_ID}\n`);
        } else {
          console.error(`❌ Failed to fetch club members (Status: ${clubRes.statusCode})`);
          console.error(clubData);

          if (clubRes.statusCode === 401) {
            console.error('\n⚠️  Authorization failed. The access token may need read scope for clubs.');
          } else if (clubRes.statusCode === 404) {
            console.error('\n⚠️  Club not found. Verify the club ID is correct.');
          }
        }
      });
    });

    clubReq.on('error', error => {
      console.error('❌ Request failed:', error);
    });

    clubReq.end();
  });
});

tokenReq.on('error', error => {
  console.error('❌ Token request failed:', error);
});

tokenReq.write(tokenData);
tokenReq.end();
