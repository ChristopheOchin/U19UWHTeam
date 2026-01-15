/**
 * Helper Utilities for Leaderboard
 */

/**
 * Format timestamp to relative time string
 * Examples: "just now", "2m ago", "3h ago", "5d ago", "Jan 15"
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();

  // Handle future dates (shouldn't happen, but be safe)
  if (diffMs < 0) return 'just now';

  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  // For dates older than 7 days, show formatted date
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Check if timestamp is within last N hours
 * Used for "recent activity" pulse indicator (default 6 hours)
 */
export function isWithinHours(
  date: Date | string | null,
  hours: number = 6
): boolean {
  if (!date) return false;

  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 0 && diffHours <= hours;
}

/**
 * Get Monday of the week for a given date
 * Used for smart streak calculation (week grouping)
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Reset to start of day
  return d;
}

/**
 * Re-export swimming detection from scoring module
 */
export { isSwimmingActivity } from '../scoring/activities';
