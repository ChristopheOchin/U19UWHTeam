/**
 * Athlete Card Component
 *
 * Individual athlete ranking card with all FOMO elements:
 * - Rank badge (crown for #1, medals for #2-3)
 * - Swimming spotlight (aqua glow for >= 50% swimming)
 * - Gap indicators (points behind leader/next)
 * - Streak badge (weeks strong)
 * - Recent activity pulse (< 6 hours)
 */

'use client';

import React from 'react';
import type { EnrichedLeaderboardEntry } from '@/lib/leaderboard/types';
import SwimmingBadge from './SwimmingBadge';
import StreakIndicator from './StreakIndicator';

interface AthleteCardProps {
  athlete: EnrichedLeaderboardEntry;
}

const AthleteCard = React.memo(function AthleteCard({
  athlete,
}: AthleteCardProps) {
  const { rank, isSwimmingDominant, hasRecentActivity } = athlete;

  // Rank badge styling
  const rankBadgeClass =
    rank === 1
      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
      : rank === 2
        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
        : rank === 3
          ? 'bg-gradient-to-br from-orange-600 to-amber-700 text-white'
          : 'bg-blue-600 text-white';

  const rankEmoji = rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-sm border p-4 lg:p-6
        transition-all duration-200 hover:shadow-md
        ${isSwimmingDominant ? 'border-cyan-400 shadow-cyan-200/50' : 'border-gray-200'}
        ${isSwimmingDominant ? 'bg-gradient-to-r from-white via-cyan-50/30 to-white' : ''}
      `}
      style={
        isSwimmingDominant
          ? { boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' }
          : undefined
      }
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div
            className={`
              w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center
              font-extrabold text-xl lg:text-2xl shadow-md
              ${rankBadgeClass}
            `}
          >
            {rankEmoji || rank}
          </div>
        </div>

        {/* Athlete Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
              {athlete.firstname} {athlete.lastname}
            </h3>
            {isSwimmingDominant && <SwimmingBadge size="small" />}
            {hasRecentActivity && (
              <span
                className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"
                title="Active in the last 6 hours"
              />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">@{athlete.username}</p>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">
                {athlete.totalActivities}
              </span>
              <span className="text-gray-600">activities</span>
            </div>

            {athlete.swimmingActivities > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-cyan-600">
                  {athlete.swimmingActivities}
                </span>
                <span className="text-gray-600">swims</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <span className="font-semibold text-blue-600">
                {Math.round(athlete.compositeScore)}
              </span>
              <span className="text-gray-600">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOMO Elements */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {/* Gap Indicators */}
        {athlete.gapBehindLeader > 0 && (
          <span className="text-red-600 font-medium">
            {Math.round(athlete.gapBehindLeader)} pts behind leader
          </span>
        )}

        {athlete.gapBehindNext > 0 && rank > 1 && (
          <span className="text-orange-600 font-medium">
            {Math.round(athlete.gapBehindNext)} pts behind #{rank - 1}
          </span>
        )}

        {/* Streak Badge */}
        {athlete.streak >= 2 && <StreakIndicator streak={athlete.streak} />}

        {/* Recent Activity Indicator */}
        {hasRecentActivity && (
          <span className="text-green-600 font-medium text-xs">
            🟢 Active now
          </span>
        )}
      </div>

      {/* Swimming Spotlight Border */}
      {isSwimmingDominant && (
        <div className="absolute top-2 right-2">
          <div className="text-xs font-semibold text-cyan-600 bg-white px-2 py-1 rounded-full border border-cyan-400 shadow-sm">
            {Math.round(athlete.swimmingPercentage)}% swimmer
          </div>
        </div>
      )}
    </div>
  );
});

export default AthleteCard;
