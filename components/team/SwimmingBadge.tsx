/**
 * Swimming Badge Component
 *
 * Reusable aqua/cyan badge for swimming activities
 */

interface SwimmingBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function SwimmingBadge({
  size = 'medium',
  showIcon = true,
}: SwimmingBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        bg-gradient-to-r from-cyan-400 to-cyan-500
        text-white font-semibold rounded-full
        ${sizeClasses[size]}
      `}
    >
      {showIcon && '🌊'}
      Swim
    </span>
  );
}
