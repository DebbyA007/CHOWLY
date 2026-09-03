"use client";

import { useEffect, useState } from "react";

// The hero. An SVG ring whose stroke offset is driven by real elapsed time against the
// promised wait, computed from placedAt on every tick, so a refresh changes nothing.
// Flame while the order is on time, pepper once elapsed passes the wait, leaf once the
// waiter marks it served. Flame is spent here and nowhere else.
type Props = {
  placedAt: string;
  waitMinutes: number;
  status: "PLACED" | "SERVED" | "PAID";
};

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type RingState = "waiting" | "late" | "served" | "paid";

export function ringState(status: Props["status"], placedAt: string, waitMinutes: number, now: number): RingState {
  if (status === "PAID") return "paid";
  if (status === "SERVED") return "served";
  return now > new Date(placedAt).getTime() + waitMinutes * 60_000 ? "late" : "waiting";
}

function clock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownRing({ placedAt, waitMinutes, status }: Props) {
  // null until mounted: the server does not know the client's clock, and rendering a
  // guess would only be corrected a moment later.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const promisedSeconds = waitMinutes * 60;
  const elapsedSeconds = now === null ? 0 : Math.max(0, Math.floor((now - new Date(placedAt).getTime()) / 1000));
  const state: RingState = now === null ? "waiting" : ringState(status, placedAt, waitMinutes, now);

  // The ring drains as the promised wait is used up, then holds full in its new colour.
  const fraction =
    state === "waiting" ? Math.max(0, 1 - elapsedSeconds / promisedSeconds) : 1;
  const offset = CIRCUMFERENCE * (1 - fraction);

  const colour = { waiting: "var(--flame)", late: "var(--pepper)", served: "var(--leaf)", paid: "var(--leaf)" }[state];

  const digits =
    now === null
      ? "--:--"
      : state === "waiting"
        ? clock(Math.max(0, promisedSeconds - elapsedSeconds))
        : state === "late"
          ? `+${clock(elapsedSeconds - promisedSeconds)}`
          : state === "served"
            ? "Served"
            : "Paid";

  const label = {
    waiting: `Ready in ${digits}, of ${waitMinutes} minutes promised`,
    late: `Late by ${digits.slice(1)}. The kitchen promised ${waitMinutes} minutes`,
    served: "Served",
    paid: "Paid",
  }[state];

  return (
    <figure className="flex flex-col items-center" data-state={state} aria-label={label}>
      <svg viewBox="0 0 240 240" className="h-60 w-60 sm:h-72 sm:w-72" role="img" aria-hidden="true">
        <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="var(--rim)" strokeOpacity="0.14" strokeWidth="14" />
        <circle
          className="ring-progress"
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke={colour}
          strokeWidth="14"
          strokeLinecap="butt"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 120 120)"
          style={{ transition: "stroke-dashoffset 900ms linear, stroke 600ms ease" }}
        />
        <text
          x="120"
          y="120"
          textAnchor="middle"
          dominantBaseline="central"
          className="display-wide tabular"
          fill={colour}
          style={{ fontSize: state === "served" || state === "paid" ? 40 : 52 }}
        >
          {digits}
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-ink-soft">
        {state === "waiting" ? `of ${waitMinutes} minutes promised` : state === "late" ? `past the ${waitMinutes} minutes promised` : state === "served" ? "The kitchen kept its word" : "Thank you for eating with us"}
      </figcaption>
    </figure>
  );
}
