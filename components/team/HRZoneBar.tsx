/**
 * HRZoneBar Component
 *
 * Displays a horizontal bar for a single HR zone with:
 * - Zone label and description
 * - Colored progress bar (percentage-based width)
 * - Minutes and percentage display
 * - Tooltip with zone HR range on hover
 */

'use client';

interface HRZoneBarProps {
  zoneNumber: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  percentage: number;
  color: string;
  label: string;
  maxHeartrate: number;
}

export default function HRZoneBar({
  zoneNumber,
  minutes,
  percentage,
  color,
  label,
  maxHeartrate,
}: HRZoneBarProps) {
  // Calculate HR range for this zone
  const getHRRange = (): string => {
    const ranges = {
      1: [0.5, 0.6],   // 50-60%
      2: [0.6, 0.7],   // 60-70%
      3: [0.7, 0.8],   // 70-80%
      4: [0.8, 0.9],   // 80-90%
      5: [0.9, 1.0],   // 90-100%
    };

    const [minPercent, maxPercent] = ranges[zoneNumber];
    const minHR = Math.round(maxHeartrate * minPercent);
    const maxHR = Math.round(maxHeartrate * maxPercent);

    return `${minHR}-${maxHR} bpm`;
  };

  return (
    <div className="mb-3 group">
      <div className="flex items-center justify-between mb-1 text-sm">
        <div className="font-medium text-gray-700">
          <span className="text-gray-500">Zone {zoneNumber}:</span> {label}
        </div>
        <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {getHRRange()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out flex items-center justify-start px-2"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          >
            {percentage > 15 && (
              <span className="text-xs font-medium text-white">
                {Math.round(minutes)} min
              </span>
            )}
          </div>
        </div>

        {/* Minutes and percentage */}
        <div className="flex flex-col items-end min-w-[80px]">
          <div className="text-sm font-semibold text-gray-800">
            {Math.round(minutes)} min
          </div>
          <div className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </div>
  );
}
