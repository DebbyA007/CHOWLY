import type { OrderStatus } from "@prisma/client";

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
  order: { status: OrderStatus; placedAt: Date; waitMinutes: number },
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
  order: { status: OrderStatus; placedAt: Date; waitMinutes: number; servedAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (order.servedAt) return order.servedAt.getTime() > dueAt(order).getTime();
  return isOrderDelayed(order, now);
}

// DELTA 13: a guest may withdraw their own order, but only in the first quarter of the
// promised wait. After that the kitchen has started on it and cancelling would throw
// away food. The window is a fraction of the promise rather than a fixed number of
// minutes so it stays proportionate: a glass of water gives fifteen seconds, the
// tasting menu gives twenty two and a half minutes.
//
// It is computed here, on the server, from placedAt and waitMinutes on every request.
// The client hiding the button is presentation. This is the enforcement.
export const CANCEL_WINDOW_FRACTION = 0.25;

export function cancelDeadline(order: { placedAt: Date; waitMinutes: number }): Date {
  return new Date(order.placedAt.getTime() + Math.round(order.waitMinutes * 60_000 * CANCEL_WINDOW_FRACTION));
}

export function canCancel(
  order: { status: OrderStatus; placedAt: Date; waitMinutes: number },
  now: Date = new Date(),
): boolean {
  return order.status === "PLACED" && now.getTime() <= cancelDeadline(order).getTime();
}
