'use client';

import { useState, useEffect } from 'react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Target date: July 16, 2026 00:00:00 Turkey Time (GMT+3)
      const targetDate = new Date('2026-07-16T00:00:00+03:00');
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[100px] border border-white/20">
        <div className="text-3xl md:text-5xl font-bold text-white">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <div className="text-sm md:text-base text-cyan-300 font-medium mt-2 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
      <TimeUnit value={timeRemaining.days} label="Days" />
      <TimeUnit value={timeRemaining.hours} label="Hours" />
      <TimeUnit value={timeRemaining.minutes} label="Mins" />
      <TimeUnit value={timeRemaining.seconds} label="Secs" />
    </div>
  );
}
