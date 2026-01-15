/**
 * TypeScript Types for Leaderboard System
 */

/**
 * Enriched leaderboard entry with FOMO metrics
 */
export interface EnrichedLeaderboardEntry {
  athleteId: number;
  rank: number;
  username: string;
  firstname: string;
  lastname: string;
  profilePictureUrl: string | null;

  // Core stats from weekly_leaderboard view
  totalActivities: number;
  swimmingActivities: number;
  totalWeightedScore: number;
  compositeScore: number;
  lastActivityAt: string | null;

  // FOMO metrics (computed)
  gapBehindLeader: number; // Points behind #1 (0 for leader)
  gapBehindNext: number; // Points behind athlete immediately above (0 for #1)
  swimmingPercentage: number; // % of activities that are swimming
  isSwimmingDominant: boolean; // >= 50% swimming
  streak: number; // Consecutive weeks with 5+ training days
  hasRecentActivity: boolean; // Activity within last 6 hours
}

/**
 * Activity feed item for recent activities display
 */
export interface ActivityFeedItem {
  id: number;
  athleteId: number;
  athleteFirstname: string;
  athleteLastname: string;
  type: string;
  name: string;
  isSwimming: boolean;
  weightedScore: number;
  startDate: string; // ISO timestamp
  timeAgo: string; // "2 hours ago"
}

/**
 * Full leaderboard response from API
 */
export interface LeaderboardResponse {
  leaderboard: EnrichedLeaderboardEntry[];
  activityFeed: ActivityFeedItem[];
  metadata: {
    weekStartDate: string; // ISO timestamp
    lastUpdated: string; // ISO timestamp
    totalAthletes: number;
  };
}

/**
 * Streak cache entry (Redis)
 */
export interface StreakCache {
  athleteId: number;
  streak: number;
  computedAt: number; // Unix timestamp
}
