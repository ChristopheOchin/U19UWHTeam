/**
 * Run Database Migration Script
 *
 * Usage: npx tsx scripts/run-migration.ts
 */

import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🔄 Running database migration...\n');

    // Read the SQL file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/001_initial.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons to execute statements individually
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        await sql.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement.substring(0, 100) + '...\n');
        throw error;
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Visit /api/strava/activities to sync activities');
    console.log('2. Check /team to see the leaderboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
