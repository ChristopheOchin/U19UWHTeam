# Phase 3: Leaderboard UI - Development Prompt

## Context

I'm building a training leaderboard for the U19 USA Men's Underwater Hockey team preparing for the 2026 World Championship in Turkey.

**Phases Complete**:
- ✅ Phase 1: Authentication & Database (Postgres + Redis)
- ✅ Phase 2: Strava Integration with scoring system

**Current Status**:
- Strava API fetching coach's activities (test data available)
- Database has `weekly_leaderboard` materialized view with pre-computed rankings
- Scoring system working: swimming activities get 1.5x multiplier
- Composite score: 60% activity count + 40% weighted score

## What I Need

Build a **FOMO-inducing leaderboard UI** that motivates athletes to train more, especially swimming (most important for underwater hockey).

### Key Requirements

**1. Leaderboard Display**
- Show ranked athletes with visual hierarchy (#1 gets crown, etc.)
- Swimming-dominant athletes get aqua/cyan spotlight glow
- Show gap to leader ("234 points behind #1")
- Hot streak indicators (🔥 for 3+ consecutive days)
- Real-time pulse animation for recent activity (< 6 hours ago)

**2. Activity Feed**
- Recent 20 activities in sidebar
- Swimming activities highlighted with cyan gradient background
- Show: athlete name, activity name, type, time ago
- Updates via 30-second client-side polling

**3. FOMO Design Elements**
- **Swimming spotlight**: Aqua glow around athletes with >50% swimming activities
- **Gap indicators**: Make it clear how far behind leader you are
- **Streak badges**: Fire emoji + number of consecutive days
- **Leader crown**: Gold crown emoji for #1
- **Pulse animation**: Green pulse ring for activities < 6h old
- **Toast notifications**: "Alex just logged a swim! 🏊" (optional, Phase 3.5)

**4. Mobile-First Design**
- Athletes will check on phones constantly
- Responsive layout: stacked on mobile, 60/40 split on desktop
- Touch-friendly targets (min 44px)
- Fast load times (< 1 second)

### Components Needed

```
/api/leaderboard/data (API endpoint)
└── Returns ranked athletes + FOMO metadata

components/team/Leaderboard.tsx (client component)
└── Main container, handles polling every 30 seconds

components/team/AthleteCard.tsx
└── Individual athlete ranking card with all FOMO elements

components/team/ActivityFeed.tsx
└── Sidebar showing recent 20 activities

components/team/SwimmingBadge.tsx
└── Aqua badge for swimming activities

components/team/StreakIndicator.tsx
└── Fire emoji + consecutive days display
```

### Design Specs

**Color Palette**:
- Primary: Deep blue `#0A4C6D`
- Swimming/Aqua: Bright cyan `#00D9FF`
- USA Red: `#DC143C` (accents)
- Success: Green for recent activity pulse
- Gold: `#FFD700` for #1 leader

**Typography**: Inter font family (already in use)

**Spacing**: Tailwind default spacing scale

### Data Available

**API Endpoint to Create**: `GET /api/leaderboard/data`

**Should Return**:
```typescript
{
  leaderboard: [
    {
      athlete_id: number;
      username: string;
      firstname: string;
      lastname: string;
      profile_picture_url: string | null;
      total_activities: number;
      swimming_activities: number;
      total_weighted_score: number;
      composite_score: number;
      rank: number;
      gap_to_leader: number; // points behind #1
      last_activity_at: string | null; // ISO timestamp
      swimming_percentage: number; // calculated
      consecutive_days: number; // streak
    }
  ],
  recent_activities: [
    {
      id: number;
      athlete_id: number;
      athlete_name: string;
      name: string;
      type: string;
      distance: number;
      moving_time: number;
      weighted_score: number;
      start_date: string; // ISO timestamp
      is_swimming: boolean;
    }
  ]
}
```

**Database Queries Available**:
- `getWeeklyLeaderboard()` - From `lib/db/queries.ts`
- `getRecentActivities(limit)` - Recent 20 activities
- Both already implemented and working

### Success Criteria

- ✅ Leaderboard shows ranked athletes with all FOMO elements
- ✅ Swimming activities clearly highlighted
- ✅ Mobile-responsive (works great on 375px width)
- ✅ Updates every 30 seconds automatically
- ✅ Loads in < 1 second
- ✅ Athletes feel motivated to train more
- ✅ Swimming gets extra attention (1.5x multiplier visible in UI)

### What NOT to Do

- ❌ Don't add complexity beyond requirements
- ❌ Don't create new authentication (it's already done)
- ❌ Don't modify scoring algorithms (already correct)
- ❌ Don't add webhooks yet (that's Phase 4)
- ❌ Don't add HR dashboard yet (future/optional)

## Starting Point

The `/team` route exists and is password-protected. I want to build the leaderboard at `/team` (replace the current placeholder).

All database queries, scoring, and Strava integration are working. Just need the UI!

---

**Project Location**: `/Users/cochin/Documents/U19UWHTeam`

**Key Files to Review**:
- `claude.md` - Full project context
- `lib/db/queries.ts` - Database operations
- `lib/scoring/activities.ts` - Scoring logic
- `PHASE2_COMPLETE.md` - What's already built

**Ready to start planning Phase 3!** 🚀
