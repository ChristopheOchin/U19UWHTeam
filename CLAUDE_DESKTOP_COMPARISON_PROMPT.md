# Claude Desktop Prompt: Strava Side-by-Side Comparison Data Collection

Send this prompt to Claude Desktop to collect the comparison table data shown in your screenshot.

---

## Copy This Prompt:

```
I need you to collect comparative Strava training data for my 9 underwater hockey team members and create a side-by-side comparison table.

## Team Members (Strava IDs):
1. Christophe O. - 196048899
2. Alex - 109066463
3. Drake - 200721606
4. Fritz - 141454027
5. Max - 137374708
6. Oliver - 200730680
7. Paxton - 180165458
8. Blake - 141634408
9. Levi - 198267219

## Data to Collect for Each Athlete:

Visit each athlete's profile at: `https://www.strava.com/athletes/{ID}`

Then navigate to their training log and extract:

### Last 4 Weeks Section:
- **Activities / Week**: Average number of activities per week
- **Avg Distance / Week**: Average distance per week (in yards or meters)
- **Avg Time / Week**: Average time per week (format: Xh Ym)

### 2026 Year Section (by activity type):
- **Workouts**:
  - Total Activities count
  - Total Distance
  - Total Time
- **Swim**:
  - Total Activities count
  - Total Distance
  - Total Time
- **Other** (everything else):
  - Total Activities count
  - Total Distance
  - Total Time

## Output Format:

Create a table like this:

```markdown
# U19 UWH Team - Training Comparison (Last Updated: 2026-01-16)

## Last 4 Weeks

| Athlete | Activities/Week | Avg Distance/Week | Avg Time/Week |
|---------|----------------|-------------------|---------------|
| Christophe O. | 4 | 5,206 yd | 3h 41m |
| Alex | ? | ? | ? |
| Drake | ? | ? | ? |
| Fritz | ? | ? | ? |
| Max | ? | ? | ? |
| Oliver | ? | ? | ? |
| Paxton | ? | ? | ? |
| Blake | ? | ? | ? |
| Levi | ? | ? | ? |

## 2026 Totals

### Workouts
| Athlete | Activities | Distance | Time |
|---------|-----------|----------|------|
| Christophe O. | 8 | 11,200 yd | 8h 5m |
| Alex | ? | ? | ? |
| ... | ... | ... | ... |

### Swim
| Athlete | Activities | Distance | Time |
|---------|-----------|----------|------|
| Christophe O. | 6 | 10,000 yd | 6h 30m |
| ... | ... | ... | ... |

### Other
| Athlete | Activities | Distance | Time |
|---------|-----------|----------|------|
| Christophe O. | 2 | 1,200 yd | 1h 35m |
| ... | ... | ... | ... |
```

## Important Notes:

1. **Use the same view as the screenshot**: Look for the "Side by Side Comparison" section on Strava
2. **Activity Type Filters**: Make sure to filter by activity type (All, Workouts, Swim, Other)
3. **Time Period**: Use "Last 4 Weeks" for the first section and "2026" (year to date) for totals
4. **Units**: Keep distances in the units Strava displays (yards or meters)
5. **Private Profiles**: If an athlete's profile is private or you can't access their data, mark it as "Private" in the table

## Workflow:

1. Start with Christophe O. (ID: 196048899) to show me the format
2. Extract all the data fields listed above
3. Show me what you found
4. Wait for my confirmation that the format is correct
5. Continue with the remaining 8 athletes
6. Provide the final markdown table

## After You're Done:

Once you have all the data in the markdown table, I'll need you to:

1. Convert this data into JSON format for the API
2. Submit to: `POST https://u19-uwh-team.vercel.app/api/admin/activities`
3. Use the admin key I'll provide

But first, just collect the data and show me the comparison table.

Ready to start? Please browse to Christophe O.'s profile first.
```

---

## What This Will Give You:

Claude Desktop will:
1. Browse each athlete's Strava profile
2. Extract the side-by-side comparison data
3. Format it as a markdown table
4. Show you the comparison before submitting

Then you can either:
- **Option A**: Save this as a markdown file for reference
- **Option B**: Have Claude convert it to JSON and submit via the admin API
- **Option C**: Use this data to build a comparison view page on your site

---

## Next Step: Build the Comparison View

Once you have the data, let me know if you want me to:
1. Create a new page at `/team/comparison` that displays this side-by-side view
2. Style it to match the Strava screenshot layout
3. Auto-update it when new activities are added via the admin API
