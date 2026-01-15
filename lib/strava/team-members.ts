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
  196048899, // Christophe O. (coach)
  109066463, // Alex
  200721606, // Drake
  141454027, // Fritz
  137374708, // Max
  200730680, // Oliver
  180165458, // Paxton
  141634408, // Blake
  198267219, // Levi
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
