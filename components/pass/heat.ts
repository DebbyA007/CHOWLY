// The lamp is the clock. One number, heat, from 1 (a lamp just switched on over a fresh
// order) down to 0 (a lamp that has been on far too long), drives every colour that
// belongs to the lamp. It is computed from placedAt and waitMinutes on every tick, so a
// refresh changes nothing.
//
// While the order is on time the lamp cools gently from 1 to 0.55 as the promised
// minutes are used. Past the promise it keeps cooling toward 0 over a second promise's
// worth of time and settles there. It never gets brighter, redder or faster: a late
// order is a lamp that has been on too long, not an alarm. Served holds warm and steady.
// Paid goes out.
//
// Under reduced motion the same idea holds but does not glide: heat takes one value per
// state, and the stylesheet makes that a single slow two-second step.
export type TicketState = "waiting" | "late" | "served" | "paid";

export type Heat = {
  state: TicketState;
  heat: number;
  reach: number;
  elapsedSeconds: number;
  promisedSeconds: number;
};

export function computeHeat(
  status: "PLACED" | "SERVED" | "PAID",
  placedAt: string,
  waitMinutes: number,
  now: number | null,
  reduce: boolean,
): Heat {
  const promisedSeconds = waitMinutes * 60;
  const elapsedSeconds = now === null ? 0 : Math.max(0, Math.floor((now - new Date(placedAt).getTime()) / 1000));
  if (status === "PAID") return { state: "paid", heat: 0.1, reach: 0.35, elapsedSeconds, promisedSeconds };
  if (status === "SERVED") return { state: "served", heat: 0.75, reach: 0.8, elapsedSeconds, promisedSeconds };
  if (now === null) return { state: "waiting", heat: 1, reach: 1, elapsedSeconds, promisedSeconds };
  if (elapsedSeconds > promisedSeconds) {
    const over = Math.min(1, (elapsedSeconds - promisedSeconds) / promisedSeconds);
    return { state: "late", heat: reduce ? 0.25 : 0.55 - 0.55 * over, reach: 0.55, elapsedSeconds, promisedSeconds };
  }
  const used = elapsedSeconds / promisedSeconds;
  return { state: "waiting", heat: reduce ? 1 : 1 - 0.45 * used, reach: reduce ? 1 : 1 - 0.45 * used, elapsedSeconds, promisedSeconds };
}

export function clock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
