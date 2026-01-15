/**
 * U19 USA UWH Team Member IDs
 *
 * Since Strava's club activities endpoint doesn't provide full activity details
 * (no IDs, no dates), we maintain a manual list of team member Strava IDs.
 *
 * To add a team member:
 * 1. Have them visit: https://www.strava.com/settings/profile
 * 2. Their ID is in the URL or visible in API responses
 * 3. Add to the array below
 */

export const TEAM_MEMBER_IDS: number[] = [
  196048899, // Christophe O. (coach) - for testing
  // Add team member IDs here as they join
  // Example:
  // 123456789, // Fritz R.
  // 234567890, // Paxton L.
  // 345678901, // Drake Q.
];

/**
 * Get all team member IDs
 */
export function getTeamMemberIds(): number[] {
  return TEAM_MEMBER_IDS;
}

/**
 * Add a team member ID (for dynamic updates)
 */
export function addTeamMember(athleteId: number): void {
  if (!TEAM_MEMBER_IDS.includes(athleteId)) {
    TEAM_MEMBER_IDS.push(athleteId);
  }
}
