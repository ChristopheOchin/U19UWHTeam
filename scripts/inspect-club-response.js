#!/usr/bin/env node
/**
 * Inspect Raw Club Activities Response
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

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

    const activitiesReq = https.request({
      hostname: 'www.strava.com',
      path: `/api/v3/clubs/${CLUB_ID}/activities?page=1&per_page=3`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (actRes) => {
      let actData = '';
      actRes.on('data', chunk => actData += chunk);
      actRes.on('end', () => {
        console.log('\n📋 Raw Club Activities Response:\n');
        console.log(JSON.stringify(JSON.parse(actData), null, 2));
      });
    });

    activitiesReq.end();
  });
});

tokenReq.write(tokenData);
tokenReq.end();
