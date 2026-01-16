/**
 * HRZoneDashboard Component
 *
 * Main container for HR zone distribution dashboard with:
 * - Grid layout of athlete HR zone cards
 * - Optional polling every 60 seconds (slower than leaderboard)
 * - Link back to leaderboard
 * - Empty state if no athletes have HR data
 */

'use client';

import { useState, useEffect } from 'react';
import HRZoneCard from './HRZoneCard';
import type { HRZoneResponse } from '@/lib/hr/types';
import Link from 'next/link';

interface HRZoneDashboardProps {
  initialData: HRZoneResponse;
}

export default function HRZoneDashboard({
  initialData,
}: HRZoneDashboardProps) {
  const [data, setData] = useState<HRZoneResponse>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch updated HR zone data
  const fetchHRZones = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/team/hr-zones');

      if (!response.ok) {
        throw new Error('Failed to fetch HR zone data');
      }

      const newData = await response.json();
      setData(newData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching HR zones:', err);
      setError('Failed to update HR zone data');
    } finally {
      setIsUpdating(false);
    }
  };

  // Set up 60-second polling (slower than leaderboard since HR data changes less)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHRZones();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Check if any athletes have HR data
  const athletesWithHRData = data.athletes.filter((a) => a.hrZoneData !== null);
  const hasAnyHRData = athletesWithHRData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Heart Rate Zone Dashboard
              </h1>
              <p className="text-gray-600">
                Training intensity distribution · Last 7 days
              </p>
            </div>
            <Link
              href="/team"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ← Leaderboard
            </Link>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Week starting: {new Date(data.metadata.weekStartDate).toLocaleDateString()}
            </span>
            <span>·</span>
            <span>
              Last updated:{' '}
              {lastUpdate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isUpdating && (
              <>
                <span>·</span>
                <span className="text-blue-600 animate-pulse">Updating...</span>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Informational Banner */}
        <div className="mb-8 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="text-sm text-cyan-900">
                <strong>Educational Only:</strong> Heart rate zone data is for
                informational purposes and is <strong>NOT used for leaderboard rankings</strong>.
                This ensures fairness for athletes without HR monitors.
              </p>
              <p className="text-xs text-cyan-700 mt-1">
                Estimated based on average heart rate per activity.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!hasAnyHRData && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Heart Rate Data Yet
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Sync activities from devices with HR monitors to see zone
              distribution. Once athletes upload activities with heart rate
              data, their zone breakdowns will appear here.
            </p>
          </div>
        )}

        {/* Athlete Cards Grid */}
        {hasAnyHRData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.athletes.map((athlete) => (
              <HRZoneCard key={athlete.athleteId} athlete={athlete} />
            ))}
          </div>
        )}

        {/* Footer Note */}
        {hasAnyHRData && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Showing {athletesWithHRData.length} of {data.athletes.length}{' '}
              athletes with heart rate data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
