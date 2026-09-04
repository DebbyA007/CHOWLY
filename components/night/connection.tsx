"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { mutate } from "swr";
import { clockTime } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";

// Whether the browser thinks it is online, and since when it has not been.
export function useOnline() {
  const [online, setOnline] = useState(true);
  const [since, setSince] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      setOnline(navigator.onLine);
      setSince(navigator.onLine ? null : Date.now());
    };
    read();
    window.addEventListener("online", read);
    window.addEventListener("offline", read);
    return () => {
      window.removeEventListener("online", read);
      window.removeEventListener("offline", read);
    };
  }, []);
  return { online, since };
}

// How fresh a polled screen is. seenAt is when the data last arrived; an error after
// that, or the browser going offline, means what is on screen is as of then.
export function useFreshness(error: unknown, seenAt: number | null) {
  const net = useOnline();
  const stale = !net.online || (!!error && seenAt !== null);
  const since = !net.online ? (net.since ?? seenAt) : seenAt;
  return { stale, since, online: net.online };
}

export const asOf = (since: number | null) => (since ? `As of ${clockTime(new Date(since))}` : "Offline");

// The bar under the header while a screen is stale: what it shows is as of a time, not
// now. When the connection comes back everything refreshes and the bar says so, once.
export function ConnectionBar({ stale, since, what }: { stale: boolean; since: number | null; what: string }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [back, setBack] = useState(false);
  const was = useRef(false);
  useEffect(() => {
    if (stale) {
      was.current = true;
      setBack(false);
      return;
    }
    if (!was.current) return;
    was.current = false;
    void mutate(() => true);
    setBack(true);
    const t = window.setTimeout(() => setBack(false), 2800);
    return () => window.clearTimeout(t);
  }, [stale]);
  const shown = stale || back;
  useEffect(() => {
    if (!shown || !ref.current) return;
    animate(ref.current, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [-8, 0], duration: 260, ease: "outQuad" });
  }, [shown, back, reduce]);
  if (!shown) return null;
  return (
    <div ref={ref} role="status" data-connection={back ? "back" : "offline"} className="mx-[22px] mb-3 rounded-[10px] border border-[color:var(--outline)] px-[14px] py-[10px] text-[12.5px] font-semibold leading-[1.45] text-fg" style={{ opacity: 0 }}>
      {back ? "Back online. Refreshed." : `${since ? `Offline since ${clockTime(new Date(since))}` : "Offline"}. Showing ${what} as of then.`}
    </div>
  );
}
