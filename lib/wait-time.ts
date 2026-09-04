// The wait time is the spine of the whole flow: order, wait, delay, complain, rate.
// It is computed here and only here, on the server, from prep times read from the
// database. Nothing the client sends can move it.
//
// Formula, from the design handoff: the promise is the longest prep time in the order.
// Capped so a bad prep time in the data still shows a wait a person would believe.

export const WAIT_CAP_MINUTES = 90;

export type WaitLine = {
  prepTimeMinutes: number;
  quantity: number;
};

export function calculateWaitMinutes(lines: readonly WaitLine[]): number {
  if (lines.length === 0) {
    throw new RangeError("calculateWaitMinutes needs at least one line");
  }
  let longestPrep = 0;
  let itemCount = 0;
  for (const line of lines) {
    if (!Number.isInteger(line.prepTimeMinutes) || line.prepTimeMinutes < 0) {
      throw new RangeError(`prepTimeMinutes must be a non-negative integer, received ${line.prepTimeMinutes}`);
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new RangeError(`quantity must be a positive integer, received ${line.quantity}`);
    }
    longestPrep = Math.max(longestPrep, line.prepTimeMinutes);
    itemCount += line.quantity;
  }
  void itemCount;
  return Math.min(longestPrep, WAIT_CAP_MINUTES);
}

// Delay is derived, never stored (delta 4). PLACED and past the promised wait.
export function isOrderDelayed(
  order: { status: "PLACED" | "SERVED" | "PAID"; placedAt: Date; waitMinutes: number },
  now: Date = new Date(),
): boolean {
  return order.status === "PLACED" && now.getTime() > dueAt(order).getTime();
}

export function dueAt(order: { placedAt: Date; waitMinutes: number }): Date {
  return new Date(order.placedAt.getTime() + order.waitMinutes * 60_000);
}

// A complaint is earned, not decorative: it opens only once the order is late. Late means
// still PLACED past the promised wait, or served after it. A paid order that was served
// late is still late; paying does not erase the wait.
export function isOrderLate(
  order: { status: "PLACED" | "SERVED" | "PAID"; placedAt: Date; waitMinutes: number; servedAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (order.servedAt) return order.servedAt.getTime() > dueAt(order).getTime();
  return isOrderDelayed(order, now);
}
