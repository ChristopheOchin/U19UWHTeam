# Phase 4: Heart Rate Zone Dashboard

## Overview
Build an **informational** heart rate zone dashboard that shows athletes how much time they spend training in each HR zone. This helps athletes understand their training intensity distribution.

**CRITICAL**: This is **NOT used for leaderboard rankings** - it's purely educational/informational.

## Requirements

### User Story
As an athlete, I want to see how much time I spend in each heart rate zone so I can understand if I'm training at the right intensities for my goals.

### Visual Design
- **Location**: New tab/page at `/team/hr-zones` (accessible from leaderboard navigation)
- **Layout**: Grid of athlete cards, each showing their HR zone distribution
- **Chart Type**: Horizontal bar chart showing time in each zone
- **Mobile-first**: Stacks vertically on mobile, grid on desktop

### HR Zones (Already Defined)
From `lib/scoring/heartrate.ts`:
- **Zone 1** (Recovery): 50-60% max HR - Easy, conversational pace
- **Zone 2** (Endurance): 60-70% max HR - Base training
- **Zone 3** (Tempo): 70-80% max HR - Steady effort
- **Zone 4** (Threshold): 80-90% max HR - Hard effort
- **Zone 5** (VO2 Max): 90-100% max HR - Maximum effort

### Color Scheme
- Zone 1: `#22C55E` (green) - Recovery
- Zone 2: `#3B82F6` (blue) - Endurance
- Zone 3: `#FBBF24` (yellow) - Tempo
- Zone 4: `#F97316` (orange) - Threshold
- Zone 5: `#EF4444` (red) - VO2 Max

### Data Requirements

#### What We Have
- Activities table with `average_heartrate` and `max_heartrate` columns
- Athletes table with `max_heartrate` column (default 190)
- `calculateHRZone()` function in `lib/scoring/heartrate.ts`
- Last 7 days of activity data

#### What We Need to Calculate
For each athlete:
1. **Filter activities with HR data** (where `average_heartrate` is not null)
2. **Estimate time in each zone** using:
   - Activity duration (`moving_time` in seconds)
   - Average HR for the activity
   - Athlete's max HR
3. **Aggregate** total minutes in each zone across all activities
4. **Display** as horizontal bars (percentage or absolute time)

### Estimation Method
Since we only have average HR per activity (not continuous HR data), we'll use a **simplified estimation**:
- If activity average HR falls in a zone, count the entire activity duration in that zone
- This is an approximation but gives useful insights
- Add disclaimer: "Estimated based on average heart rate per activity"

### Components to Build

#### 1. API Endpoint: `/api/team/hr-zones`
**Purpose**: Fetch HR zone data for all athletes

**Response Schema**:
```typescript
{
  athletes: [
    {
      athleteId: number;
      firstname: string;
      lastname: string;
      profilePictureUrl: string | null;
      maxHeartrate: number;
      hrZoneData: {
        zone1Minutes: number;
        zone2Minutes: number;
        zone3Minutes: number;
        zone4Minutes: number;
        zone5Minutes: number;
        totalMinutes: number;
        activitiesWithHR: number;
      } | null; // null if no HR data
    }
  ];
  metadata: {
    weekStartDate: string;
    lastUpdated: string;
  };
}
```

**Logic**:
1. Get athletes from `getAthletes()`
2. Get activities from last 7 days with HR data
3. For each athlete:
   - Find their activities with `average_heartrate !== null`
   - For each activity:
     - Calculate which zone the avg HR falls into using `calculateHRZone()`
     - Add `moving_time` to that zone's total
   - Return aggregated minutes per zone

#### 2. Page: `/app/team/hr-zones/page.tsx`
**Purpose**: Server-rendered page for HR zone dashboard

**Features**:
- Fetch initial data server-side (fast first paint)
- Pass to client component
- Protected by auth middleware (same as `/team`)

#### 3. Component: `components/team/HRZoneDashboard.tsx` (Client)
**Purpose**: Main container with optional polling

**Features**:
- Display grid of athlete HR cards
- Optional: Poll API every 60 seconds (slower than leaderboard since HR data changes less)
- Show message if no athletes have HR data
- Link back to leaderboard

#### 4. Component: `components/team/HRZoneCard.tsx`
**Purpose**: Individual athlete's HR zone distribution

**Design**:
```
┌─────────────────────────────────────┐
│ 👤 Christophe Ochin                 │
│ Max HR: 190 bpm                     │
│                                     │
│ Zone 1 █████░░░░░░ 45 min (25%)   │
│ Zone 2 ████████░░░ 72 min (40%)   │
│ Zone 3 ████░░░░░░░ 36 min (20%)   │
│ Zone 4 ██░░░░░░░░░ 18 min (10%)   │
│ Zone 5 █░░░░░░░░░░  9 min (5%)    │
│                                     │
│ Total: 180 min · 12 activities     │
│ Estimated from avg HR per activity  │
└─────────────────────────────────────┘
```

**Props**:
```typescript
interface HRZoneCardProps {
  athlete: {
    firstname: string;
    lastname: string;
    profilePictureUrl: string | null;
    maxHeartrate: number;
    hrZoneData: HRZoneData | null;
  };
}
```

#### 5. Component: `components/team/HRZoneBar.tsx`
**Purpose**: Single horizontal bar for one zone

**Props**:
```typescript
interface HRZoneBarProps {
  zoneNumber: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  percentage: number;
  color: string;
  label: string; // "Recovery", "Endurance", etc.
}
```

**Design**:
- Zone label and description on left
- Horizontal bar (percentage-based width)
- Minutes and percentage on right
- Tooltip on hover with zone HR range

### Navigation

Add link to HR zones in the leaderboard header:

```tsx
// In components/team/Leaderboard.tsx header
<div className="flex items-center gap-4">
  <h1>Training Leaderboard</h1>
  <Link href="/team/hr-zones" className="text-sm text-blue-600 hover:text-blue-800">
    📊 HR Zones
  </Link>
</div>
```

### Edge Cases

1. **No HR Data**: Show empty state with message:
   - "No heart rate data available yet. Sync activities from devices with HR monitors to see zone distribution."

2. **Some Athletes Have HR, Some Don't**:
   - Show cards for all athletes
   - Cards without HR data show "No HR data" message
   - Don't hide athletes without HR

3. **Very Unbalanced Distribution**:
   - Bars scale to largest zone (100% = most time in any zone)
   - Always show all 5 zones even if 0 minutes

4. **Max HR Not Set**:
   - Use default 190 bpm
   - Show note: "Using default max HR (190 bpm). Update in profile for accurate zones."

### Implementation Order

1. **API Endpoint** (`/api/team/hr-zones/route.ts`)
   - Query activities with HR data
   - Calculate zone distribution
   - Return formatted response

2. **Data Calculation Helper** (`lib/hr/zones.ts`)
   - `calculateAthleteZoneDistribution(athleteId, activities)`
   - Reuse existing `calculateHRZone()` from `lib/scoring/heartrate.ts`

3. **Atomic Components** (HRZoneBar)
   - Build bar visualization
   - Test with sample data

4. **HRZoneCard**
   - Integrate bars
   - Add athlete info
   - Handle null HR data

5. **HRZoneDashboard Container**
   - Grid layout
   - Polling (optional)
   - Empty states

6. **Page Integration** (`/app/team/hr-zones/page.tsx`)
   - Server-side data fetch
   - Auth protection
   - Navigation

7. **Testing**
   - Test with activities that have HR data
   - Test with activities missing HR data
   - Test mobile responsive layout

### Success Criteria

- ✅ Athletes can see their HR zone distribution
- ✅ Bars are color-coded by zone
- ✅ Shows time in minutes and percentage
- ✅ Works on mobile (stacked layout)
- ✅ Shows disclaimer about estimation method
- ✅ Handles athletes without HR data gracefully
- ✅ Page loads in < 1 second
- ✅ Navigation from leaderboard works
- ✅ Does NOT affect leaderboard rankings

### Non-Goals (Out of Scope)

- ❌ Using HR data for rankings
- ❌ Continuous HR tracking (we only have avg per activity)
- ❌ Setting custom HR zones per athlete
- ❌ Comparing athletes' HR zones (everyone is different)
- ❌ Historical trends (only last 7 days)

## Design Philosophy

This feature is **educational, not competitive**. HR zones are personal and shouldn't be compared between athletes. The goal is to help each athlete understand their own training intensity and ensure they're getting a good mix of easy (Zone 1-2) and hard (Zone 4-5) efforts.

## Files to Create

```
New Files:
  app/team/hr-zones/page.tsx                  (Page route)
  app/api/team/hr-zones/route.ts              (API endpoint)
  components/team/HRZoneDashboard.tsx         (Main container)
  components/team/HRZoneCard.tsx              (Athlete card)
  components/team/HRZoneBar.tsx               (Zone bar)
  lib/hr/zones.ts                             (Calculation helpers)
  lib/hr/types.ts                             (TypeScript types)

Modified Files:
  components/team/Leaderboard.tsx             (Add navigation link)
```

## Key Files to Reference

- `lib/scoring/heartrate.ts:1` - Existing HR zone calculation
- `lib/db/queries.ts:1` - Database query patterns
- `lib/db/schema.ts:1` - Table schemas
- `components/team/AthleteCard.tsx:1` - Card styling reference
- `components/team/Leaderboard.tsx:1` - Layout patterns

---

**Ready to build!** This is a straightforward informational feature that will give athletes insights into their training intensity without affecting competitive rankings.
