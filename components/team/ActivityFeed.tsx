/**
 * Activity Feed Component
 *
 * Shows recent 20 activities with swimming highlights
 */

'use client';

import React from 'react';
import type { ActivityFeedItem } from '@/lib/leaderboard/types';
import SwimmingBadge from './SwimmingBadge';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

const ActivityFeed = React.memo(function ActivityFeed({
  activities,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Recent Activities
          </h3>
          <p className="text-sm text-gray-600">
            Be the first to log a workout on Strava!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-600">Last 20 workouts</p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
});

/**
 * Individual activity item
 */
const ActivityItem = React.memo(function ActivityItem({
  activity,
}: {
  activity: ActivityFeedItem;
}) {
  return (
    <div
      className={`
        px-6 py-4 transition-colors hover:bg-gray-50
        ${activity.isSwimming ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 border-l-4 border-cyan-500' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Athlete Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">
              {activity.athleteFirstname} {activity.athleteLastname}
            </span>
            <span className="text-xs text-gray-500">{activity.timeAgo}</span>
          </div>

          <p className="text-sm text-gray-700 truncate mb-2">
            {activity.name}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {activity.isSwimming && <SwimmingBadge size="small" />}
            <span className="text-xs text-gray-600 font-medium">
              {Math.round(activity.weightedScore)} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ActivityFeed;
