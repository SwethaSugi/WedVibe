"use client";

import { useEffect, useState } from "react";

/**
 * Milliseconds until `target`, ticking every second. Starts null on server and client alike
 * (so the first render always matches — no hydration mismatch), then updates after mount.
 */
export function useLiveCountdown(target: Date | null) {
  const [left, setLeft] = useState<number | null>(null);
  const time = target?.getTime() ?? null;

  useEffect(() => {
    if (time === null) return;
    const tick = () => setLeft(time - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [time]);

  return left;
}

// Splits a millisecond duration into padded day/hour/minute/second parts.
export function splitDuration(ms: number) {
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}
