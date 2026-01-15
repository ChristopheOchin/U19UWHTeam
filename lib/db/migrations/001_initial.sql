-- Initial database schema for U19 UWH Team Leaderboard
-- Run this migration in your Vercel Postgres database

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id BIGINT PRIMARY KEY,
  username TEXT NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  profile_picture_url TEXT,
  max_heartrate INT DEFAULT 190,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id BIGINT PRIMARY KEY,
  athlete_id BIGINT REFERENCES athletes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  distance REAL,
  moving_time INT,
  total_elevation_gain REAL,
  start_date TIMESTAMP NOT NULL,
  average_heartrate REAL,
  max_heartrate REAL,
  weighted_score REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_athlete_start_date
  ON activities(athlete_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_activities_start_date
  ON activities(start_date DESC);

CREATE INDEX IF NOT EXISTS idx_activities_type
  ON activities(type);

-- Materialized view for weekly leaderboard
-- This pre-computes rankings for fast querying
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_leaderboard AS
SELECT
  a.id AS athlete_id,
  a.username,
  a.firstname,
  a.lastname,
  a.profile_picture_url,
  COUNT(act.id) AS total_activities,
  COUNT(CASE
    WHEN act.type IN ('Swim', 'Pool Swim', 'Open Water Swim')
      OR LOWER(act.name) LIKE '%swim%'
      OR LOWER(act.name) LIKE '%pool%'
      OR LOWER(act.name) LIKE '%laps%'
      OR LOWER(act.name) LIKE '%uwh%'
    THEN 1
  END) AS swimming_activities,
  COALESCE(SUM(act.weighted_score), 0) AS total_weighted_score,
  -- Composite score: 60% activity count + 40% weighted score
  (COUNT(act.id) * 100 * 0.6) + (COALESCE(SUM(act.weighted_score), 0) * 0.4) AS composite_score,
  MAX(act.start_date) AS last_activity_at
FROM athletes a
LEFT JOIN activities act ON act.athlete_id = a.id
  AND act.start_date >= NOW() - INTERVAL '7 days'
GROUP BY a.id, a.username, a.firstname, a.lastname, a.profile_picture_url
ORDER BY composite_score DESC, last_activity_at DESC NULLS LAST;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_weekly_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW weekly_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE athletes IS 'Strava athlete profiles for team members';
COMMENT ON TABLE activities IS 'Strava activities with computed scores';
COMMENT ON COLUMN activities.weighted_score IS 'Base score with 1.5x multiplier for swimming';
COMMENT ON MATERIALIZED VIEW weekly_leaderboard IS 'Pre-computed weekly rankings (refresh after activity updates)';
