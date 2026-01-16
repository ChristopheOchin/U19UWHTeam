/**
 * HRZoneCard Component
 *
 * Displays an individual athlete's HR zone distribution with:
 * - Athlete profile info (name, profile picture)
 * - Max heart rate display
 * - 5 horizontal bars showing time in each zone
 * - Total training time and activity count
 * - Disclaimer about estimation method
 */

'use client';

import HRZoneBar from './HRZoneBar';
import { HR_ZONE_COLORS, HR_ZONE_LABELS } from '@/lib/hr/types';
import type { AthleteHRZoneData } from '@/lib/hr/types';

interface HRZoneCardProps {
  athlete: AthleteHRZoneData;
}

export default function HRZoneCard({ athlete }: HRZoneCardProps) {
  const { firstname, lastname, profilePictureUrl, maxHeartrate, hrZoneData } =
    athlete;

  // If no HR data, show empty state
  if (!hrZoneData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${firstname} ${lastname}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {firstname[0]}
              {lastname[0]}
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {firstname} {lastname}
            </h3>
            <p className="text-sm text-gray-500">Max HR: {maxHeartrate} bpm</p>
          </div>
        </div>

        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            No heart rate data available yet. Sync activities from devices with
            HR monitors to see zone distribution.
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentages for each zone
  const totalMinutes = hrZoneData.totalMinutes;
  const percentages = {
    zone1: totalMinutes > 0 ? (hrZoneData.zone1Minutes / totalMinutes) * 100 : 0,
    zone2: totalMinutes > 0 ? (hrZoneData.zone2Minutes / totalMinutes) * 100 : 0,
    zone3: totalMinutes > 0 ? (hrZoneData.zone3Minutes / totalMinutes) * 100 : 0,
    zone4: totalMinutes > 0 ? (hrZoneData.zone4Minutes / totalMinutes) * 100 : 0,
    zone5: totalMinutes > 0 ? (hrZoneData.zone5Minutes / totalMinutes) * 100 : 0,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Athlete Header */}
      <div className="flex items-center gap-4 mb-6">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${firstname} ${lastname}`}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {firstname[0]}
            {lastname[0]}
          </div>
        )}
        <div>
          <h3 className="font-bold text-xl text-gray-800">
            {firstname} {lastname}
          </h3>
          <p className="text-sm text-gray-600">Max HR: {maxHeartrate} bpm</p>
        </div>
      </div>

      {/* HR Zone Bars */}
      <div className="mb-4">
        <HRZoneBar
          zoneNumber={1}
          minutes={hrZoneData.zone1Minutes}
          percentage={percentages.zone1}
          color={HR_ZONE_COLORS.zone1}
          label={HR_ZONE_LABELS.zone1}
          maxHeartrate={maxHeartrate}
        />
        <HRZoneBar
          zoneNumber={2}
          minutes={hrZoneData.zone2Minutes}
          percentage={percentages.zone2}
          color={HR_ZONE_COLORS.zone2}
          label={HR_ZONE_LABELS.zone2}
          maxHeartrate={maxHeartrate}
        />
        <HRZoneBar
          zoneNumber={3}
          minutes={hrZoneData.zone3Minutes}
          percentage={percentages.zone3}
          color={HR_ZONE_COLORS.zone3}
          label={HR_ZONE_LABELS.zone3}
          maxHeartrate={maxHeartrate}
        />
        <HRZoneBar
          zoneNumber={4}
          minutes={hrZoneData.zone4Minutes}
          percentage={percentages.zone4}
          color={HR_ZONE_COLORS.zone4}
          label={HR_ZONE_LABELS.zone4}
          maxHeartrate={maxHeartrate}
        />
        <HRZoneBar
          zoneNumber={5}
          minutes={hrZoneData.zone5Minutes}
          percentage={percentages.zone5}
          color={HR_ZONE_COLORS.zone5}
          label={HR_ZONE_LABELS.zone5}
          maxHeartrate={maxHeartrate}
        />
      </div>

      {/* Summary Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Total: <span className="font-semibold text-gray-800">{totalMinutes} min</span> ·{' '}
            <span className="font-semibold text-gray-800">{hrZoneData.activitiesWithHR}</span>{' '}
            {hrZoneData.activitiesWithHR === 1 ? 'activity' : 'activities'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          Estimated from average HR per activity
        </p>
      </div>
    </div>
  );
}
