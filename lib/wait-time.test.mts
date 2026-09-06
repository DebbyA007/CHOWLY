import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateWaitMinutes, canCancel, cancelDeadline, dueAt, isOrderDelayed, isOrderLate, WAIT_CAP_MINUTES } from "./wait-time.ts";

test("one item waits its own prep time", () => {
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 22, quantity: 1 }]), 22);
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 4, quantity: 1 }]), 4);
});

test("the promise is the longest prep time in the order", () => {
  // the design's sample order: jollof 12, catfish 20, two chapman 4: promised in 20
  assert.equal(
    calculateWaitMinutes([
      { prepTimeMinutes: 12, quantity: 1 },
      { prepTimeMinutes: 20, quantity: 1 },
      { prepTimeMinutes: 4, quantity: 2 },
    ]),
    20,
  );
});

test("quantity does not lengthen the promise", () => {
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 12, quantity: 4 }]), 12);
});

test("the wait is capped", () => {
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 200, quantity: 1 }]), WAIT_CAP_MINUTES);
  assert.equal(calculateWaitMinutes([{ prepTimeMinutes: 22, quantity: 20 }]), 22);
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

// DELTA 13: the cancel window, at both ends of the menu.
test("the cancel window is a quarter of the promise, and closes", () => {
  const placedAt = new Date("2026-09-06T21:00:00.000Z");
  const water = { status: "PLACED" as const, placedAt, waitMinutes: 1 };
  assert.equal(cancelDeadline(water).toISOString(), "2026-09-06T21:00:15.000Z");
  assert.equal(canCancel(water, new Date("2026-09-06T21:00:14.000Z")), true);
  assert.equal(canCancel(water, new Date("2026-09-06T21:00:16.000Z")), false);

  const tasting = { status: "PLACED" as const, placedAt, waitMinutes: 90 };
  assert.equal(cancelDeadline(tasting).toISOString(), "2026-09-06T21:22:30.000Z");
  assert.equal(canCancel(tasting, new Date("2026-09-06T21:22:29.000Z")), true);
  assert.equal(canCancel(tasting, new Date("2026-09-06T21:22:31.000Z")), false);
});

test("an order that is not placed can never be cancelled, however early", () => {
  const placedAt = new Date("2026-09-06T21:00:00.000Z");
  const early = new Date("2026-09-06T21:00:01.000Z");
  for (const status of ["SERVED", "PAID", "CANCELLED"] as const) {
    assert.equal(canCancel({ status, placedAt, waitMinutes: 90 }, early), false, status);
  }
});
