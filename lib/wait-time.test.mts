import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateWaitMinutes, dueAt, isOrderDelayed, isOrderLate, WAIT_CAP_MINUTES } from "./wait-time.ts";

test("one item waits its own prep time", () => {
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 22, quantity: 1 }]), 22);
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 4, quantity: 1 }]), 4);
});

test("the slowest item sets the floor and each extra unit adds three minutes", () => {
  // steak 22 and a mojito 6: max 22, two units, 22 + 3 * 1
  assert.equal(
    calculateWaitMinutes([
      { prepTimeMinutes: 22, quantity: 1 },
      { prepTimeMinutes: 6, quantity: 1 },
    ]),
    25,
  );
  // two steaks and three zobo: max 22, five units, 22 + 3 * 4
  assert.equal(
    calculateWaitMinutes([
      { prepTimeMinutes: 22, quantity: 2 },
      { prepTimeMinutes: 4, quantity: 3 },
    ]),
    34,
  );
});

test("quantity counts as units, not lines", () => {
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 12, quantity: 4 }]), 21);
});

test("the wait is capped", () => {
  // 22 + 3 * 39 = 139, which the cap brings down to 90
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 22, quantity: 40 }]), WAIT_CAP_MINUTES);
  // just under the cap is left alone: 22 + 3 * 19 = 79
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 22, quantity: 20 }]), 79);
});

test("bad input is rejected rather than guessed", () => {
  assert.throws(() => calculateWaitMinutes([]), RangeError);
  assert.throws(() => calculateWaitMinutes([{ prepTimeMinutes: 10, quantity: 0 }]), RangeError);
  assert.throws(() => calculateWaitMinutes([{ prepTimeMinutes: -1, quantity: 1 }]), RangeError);
  assert.throws(() => calculateWaitMinutes([{ prepTimeMinutes: 1.5, quantity: 1 }]), RangeError);
});

test("delay is derived from placedAt and waitMinutes, and only while PLACED", () => {
  const placedAt = new Date("2026-09-03T12:00:00Z");
  const order = { status: "PLACED" as const, placedAt, waitMinutes: 25 };
  assert.equal(dueAt(order).toISOString(), "2026-09-03T12:25:00.000Z");
  assert.equal(isOrderDelayed(order, new Date("2026-09-03T12:24:59Z")), false);
  assert.equal(isOrderDelayed(order, new Date("2026-09-03T12:25:01Z")), true);
  assert.equal(isOrderDelayed({ ...order, status: "SERVED" }, new Date("2026-09-03T13:00:00Z")), false);
  assert.equal(isOrderDelayed({ ...order, status: "PAID" }, new Date("2026-09-03T13:00:00Z")), false);
});

test("late means past the wait while placed, or served after the wait", () => {
  const placedAt = new Date("2026-09-03T12:00:00Z");
  const base = { placedAt, waitMinutes: 25, servedAt: null };
  assert.equal(isOrderLate({ ...base, status: "PLACED" }, new Date("2026-09-03T12:20:00Z")), false);
  assert.equal(isOrderLate({ ...base, status: "PLACED" }, new Date("2026-09-03T12:30:00Z")), true);
  const servedOnTime = new Date("2026-09-03T12:20:00Z");
  const servedLate = new Date("2026-09-03T12:40:00Z");
  assert.equal(isOrderLate({ ...base, status: "SERVED", servedAt: servedOnTime }, new Date("2026-09-03T13:00:00Z")), false);
  assert.equal(isOrderLate({ ...base, status: "SERVED", servedAt: servedLate }, new Date("2026-09-03T13:00:00Z")), true);
  assert.equal(isOrderLate({ ...base, status: "PAID", servedAt: servedLate }, new Date("2026-09-03T14:00:00Z")), true);
});
