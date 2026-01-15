/**
 * Streak Indicator Component
 *
 * Shows "smart streak" - consecutive weeks with 5+ training days
 * Only displays if >= 2 weeks
 */

interface StreakIndicatorProps {
  streak: number; // Number of consecutive weeks
}

export default function StreakIndicator({ streak }: StreakIndicatorProps) {
  // Only show if streak >= 2 weeks
  if (streak < 2) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-md"
      title={`Training consistently for ${streak} ${streak === 1 ? 'week' : 'weeks'}!`}
    >
      <span className="text-base animate-pulse">🔥</span>
      <span className="text-sm font-bold text-orange-500">{streak}</span>
      <span className="text-xs text-gray-600">
        {streak === 1 ? 'week' : 'weeks'} strong
      </span>
    </div>
  );
}
