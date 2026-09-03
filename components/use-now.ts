"use client";

import { useEffect, useState } from "react";

// The current time, ticking. Null until mounted, because the server cannot know the
// client's clock and a guess would only be corrected a moment later.
export function useNow(everyMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), everyMs);
    return () => window.clearInterval(timer);
  }, [everyMs]);
  return now;
}
