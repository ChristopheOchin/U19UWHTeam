#!/usr/bin/env node

/**
 * Generate secrets for environment variables
 *
 * Usage:
 *   node scripts/generate-secrets.js
 *   node scripts/generate-secrets.js "your-team-password"
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateSecrets() {
  const password = process.argv[2] || 'uwh2026turkey';

  console.log('\n🔐 Generating secrets for U19 Team Website\n');
  console.log('━'.repeat(60));

  // Generate password hash
  console.log('\n1️⃣  TEAM_PASSWORD_HASH');
  console.log('   (Copy this to Vercel environment variables)\n');
  const hash = await bcrypt.hash(password, 10);
  console.log(`   ${hash}\n`);

  // Generate session secret
  console.log('2️⃣  SESSION_SECRET');
  console.log('   (Copy this to Vercel environment variables)\n');
  const sessionSecret = crypto.randomBytes(32).toString('base64');
  console.log(`   ${sessionSecret}\n`);

  // Generate webhook verify token
  console.log('3️⃣  STRAVA_WEBHOOK_VERIFY_TOKEN');
  console.log('   (You\'ll need this for Strava webhook setup in Phase 2)\n');
  const webhookToken = crypto.randomBytes(32).toString('hex');
  console.log(`   ${webhookToken}\n`);

  console.log('━'.repeat(60));
  console.log('\n✅ Secrets generated successfully!\n');
  console.log('📝 Next steps:');
  console.log('   1. Copy these values to Vercel dashboard');
  console.log('   2. Go to Settings → Environment Variables');
  console.log('   3. Add each variable for Production, Preview, and Development');
  console.log('   4. Redeploy your project\n');

  if (process.argv[2]) {
    console.log(`🔑 Team password used: "${password}"\n`);
  } else {
    console.log('💡 Default password used: "uwh2026turkey"');
    console.log('   To use a custom password, run:');
    console.log('   node scripts/generate-secrets.js "your-password"\n');
  }
}

generateSecrets().catch(console.error);
