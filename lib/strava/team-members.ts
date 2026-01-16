/**
 * U19 USA UWH Team Member IDs
 *
 * This file contains the Strava athlete IDs for all team members.
 * The system fetches public activities for each athlete listed here.
 *
 * ========================================
 * HOW TO ADD A NEW ATHLETE TO THE DASHBOARD
 * ========================================
 *
 * STEP 1: Ask the athlete to make their Strava activities PUBLIC
 * ---------------------------------------------------------------
 * Athletes must configure their Strava privacy settings:
 *   1. Go to: https://www.strava.com/settings/privacy
 *   2. Under "Activities", select "Everyone" (not "Followers" or "Only You")
 *   3. Save changes
 *
 * IMPORTANT: If activities are private, the system cannot fetch them and the
 * athlete will appear with 0 activities on the leaderboard.
 *
 * STEP 2: Get the athlete's Strava ID
 * ------------------------------------
 * There are two ways to find a Strava athlete ID:
 *
 * Option A - From their profile URL:
 *   1. Visit their Strava profile page
 *   2. Look at the URL: https://www.strava.com/athletes/[ID]
 *   3. The number after "/athletes/" is their ID
 *
 * Option B - From settings page:
 *   1. Have them go to: https://www.strava.com/settings/profile
 *   2. Their athlete ID is displayed on that page
 *
 * STEP 3: Add the ID to the array below
 * --------------------------------------
 * Add the athlete's ID to TEAM_MEMBER_IDS with a comment for their name:
 *
 *   198267219, // Levi
 *   123456789, // New Athlete Name <-- Add here
 *
 * STEP 4: Deploy the changes
 * ---------------------------
 *   1. Commit your changes: git add . && git commit -m "Add athlete: Name"
 *   2. Push to GitHub: git push origin main
 *   3. Vercel will auto-deploy (takes ~2 minutes)
 *   4. The athlete's activities will appear on the dashboard within 30 seconds
 *
 * STEP 5: Verify on the dashboard
 * --------------------------------
 * After deployment:
 *   1. Visit: https://u19-uwh-team.vercel.app/team
 *   2. Check that the new athlete appears on the leaderboard
 *   3. Verify their activities are showing up
 *   4. Confirm swimming activities are highlighted in cyan
 *
 * ========================================
 * TROUBLESHOOTING
 * ========================================
 *
 * Problem: Athlete shows 0 activities
 * Solution: Check that their Strava activities are set to "Everyone" in privacy settings
 *
 * Problem: Athlete doesn't appear on leaderboard
 * Solution: Athlete needs at least 1 activity in the last 7 days to appear
 *
 * Problem: Activities not syncing
 * Solution: Check Vercel logs at: https://vercel.com/your-project/logs
 *           Look for warning messages about privacy or API errors
 *
 * ========================================
 * TECHNICAL DETAILS
 * ========================================
 *
 * - Activities are fetched every 30 seconds via frontend polling
 * - Only activities from the last 7 days are included
 * - Swimming activities get a 1.5x score multiplier
 * - Composite score = (activity_count × 100 × 0.6) + (weighted_score × 0.4)
 * - Rate limit: 100 requests per 15 minutes (handled automatically)
 * - Each athlete fetch uses 1 API request for profile + 1 for activities
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
