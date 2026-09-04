import { test } from "node:test";
import assert from "node:assert/strict";
import { demoControlsEnabled, demoSchema } from "./demo.ts";

test("demo controls exist only when the flag is exactly true", () => {
  assert.equal(demoControlsEnabled({}), false, "absent is off");
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: "" }), false);
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: "1" }), false);
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: "yes" }), false);
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: "TRUE" }), false, "explicit means exact");
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: "true" }), true);
  assert.equal(demoControlsEnabled({ DEMO_CONTROLS: " true " }), true, "whitespace tolerated");
});

test("the demo body is strict and bounded", () => {
  assert.equal(demoSchema.safeParse({ action: "reset" }).success, true);
  assert.equal(demoSchema.safeParse({ action: "reset", orderId: "x" }).success, false);
  assert.equal(demoSchema.safeParse({ action: "fast-forward", orderId: "cmf7q2z1x0000abcd1234efgh", minutes: 30 }).success, true);
  assert.equal(demoSchema.safeParse({ action: "fast-forward", orderId: "cmf7q2z1x0000abcd1234efgh", minutes: 0 }).success, false);
  assert.equal(demoSchema.safeParse({ action: "fast-forward", orderId: "cmf7q2z1x0000abcd1234efgh", minutes: 601 }).success, false);
  assert.equal(demoSchema.safeParse({ action: "fast-forward", orderId: "1 OR 1=1", minutes: 5 }).success, false);
  assert.equal(demoSchema.safeParse({ action: "delete-everything" }).success, false);
});
