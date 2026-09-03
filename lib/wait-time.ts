// The wait time is the spine of the whole flow: order, wait, delay, complain, rate.
// It is computed here and only here, on the server, from prep times read from the
// database. Nothing the client sends can move it.
//
// Formula: the slowest item sets the floor, and every additional unit on the ticket adds
// three minutes of kitchen load. Capped so a huge ticket still shows a wait a person
// would believe.

export const EXTRA_ITEM_MINUTES = 3;
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
  const raw = longestPrep + EXTRA_ITEM_MINUTES * (itemCount - 1);
  return Math.min(raw, WAIT_CAP_MINUTES);
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
