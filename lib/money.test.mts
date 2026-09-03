import { test } from "node:test";
import assert from "node:assert/strict";
import { formatNaira } from "./money.ts";

test("whole naira has no minor part and groups thousands", () => {
  assert.equal(formatNaira(850000), "₦8,500");
  assert.equal(formatNaira(120000), "₦1,200");
  assert.equal(formatNaira(100), "₦1");
  assert.equal(formatNaira(0), "₦0");
  assert.equal(formatNaira(123456700), "₦1,234,567");
});

test("kobo remainder shows two digits", () => {
  assert.equal(formatNaira(850050), "₦8,500.50");
  assert.equal(formatNaira(5), "₦0.05");
});

test("negative amounts keep the sign in front", () => {
  assert.equal(formatNaira(-250000), "-₦2,500");
});

test("non-integer kobo is a programming error", () => {
  assert.throws(() => formatNaira(85.5), TypeError);
  assert.throws(() => formatNaira(Number.NaN), TypeError);
});
