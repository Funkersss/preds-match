"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate);
    const tick = () => setTimeLeft(calcTimeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!mounted) {
    return <div className="flex items-center gap-1 h-10" />;
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2">
        <div className="live-badge">
          <span className="live-dot" />
          STARTED
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {timeLeft.days > 0 && (
        <>
          <div className="countdown-unit">
            <span className="countdown-value">{timeLeft.days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <span className="countdown-sep">:</span>
        </>
      )}
      <div className="countdown-unit">
        <span className="countdown-value">{pad(timeLeft.hours)}</span>
        <span className="countdown-label">Hrs</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-value">{pad(timeLeft.minutes)}</span>
        <span className="countdown-label">Min</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-value">{pad(timeLeft.seconds)}</span>
        <span className="countdown-label">Sec</span>
      </div>
    </div>
  );
}
