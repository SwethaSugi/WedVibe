"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

export function Countdown({ weddingDate, className = "" }: { weddingDate: string; className?: string }) {
  // Start null on both server and client so the first render always matches (no
  // hydration mismatch), then compute the real, time-sensitive value after mount.
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    if (!weddingDate) return;
    setRemaining(getRemaining(weddingDate));
    const timer = setInterval(() => setRemaining(getRemaining(weddingDate)), 60000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!weddingDate || !remaining) return null;

  return (
    <div className={`flex gap-4 justify-center ${className}`}>
      {[
        { label: "Days", value: remaining.days },
        { label: "Hours", value: remaining.hours },
        { label: "Minutes", value: remaining.minutes },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className="text-2xl font-semibold">{item.value}</span>
          <span className="text-xs uppercase tracking-wide opacity-70">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
