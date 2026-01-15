/**
 * Database Client
 *
 * Provides Vercel Postgres connection and query utilities
 */

import { sql } from '@vercel/postgres';

export { sql };

/**
 * Execute a database query
 * Wrapper around Vercel Postgres sql template tag
 */
export async function query<T = any>(
  sqlQuery: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await sql.query(sqlQuery, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Refresh the weekly leaderboard materialized view
 * Call this after inserting/updating activities
 */
export async function refreshLeaderboard(): Promise<void> {
  try {
    await sql`SELECT refresh_weekly_leaderboard()`;
    console.log('✅ Weekly leaderboard refreshed');
  } catch (error) {
    console.error('❌ Failed to refresh leaderboard:', error);
    throw error;
  }
}
