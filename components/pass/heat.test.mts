import { test } from "node:test";
import assert from "node:assert/strict";
import { clock, computeHeat } from "./heat.ts";

const placed = new Date("2026-09-03T12:00:00Z").toISOString();
const at = (minutes: number) => new Date("2026-09-03T12:00:00Z").getTime() + minutes * 60_000;

test("heat cools gently through the promise and never below zero", () => {
  assert.equal(computeHeat("PLACED", placed, 20, at(0), false).heat, 1);
  assert.equal(computeHeat("PLACED", placed, 20, at(10), false).heat.toFixed(3), "0.775");
  assert.equal(computeHeat("PLACED", placed, 20, at(20), false).heat.toFixed(3), "0.550");
  const late = computeHeat("PLACED", placed, 20, at(30), false);
  assert.equal(late.state, "late");
  assert.equal(late.heat.toFixed(3), "0.275");
  assert.equal(computeHeat("PLACED", placed, 20, at(40), false).heat, 0);
  assert.equal(computeHeat("PLACED", placed, 20, at(400), false).heat, 0);
});

test("heat only ever falls while an order is placed", () => {
  let previous = Infinity;
  for (let m = 0; m <= 60; m++) {
    const { heat } = computeHeat("PLACED", placed, 20, at(m), false);
    assert.ok(heat <= previous, `heat rose at minute ${m}`);
    previous = heat;
  }
});

test("served holds warm, paid goes out", () => {
  assert.deepEqual([computeHeat("SERVED", placed, 20, at(50), false).state, computeHeat("SERVED", placed, 20, at(50), false).heat], ["served", 0.75]);
  assert.deepEqual([computeHeat("PAID", placed, 20, at(50), false).state, computeHeat("PAID", placed, 20, at(50), false).heat], ["paid", 0.1]);
});

test("reduced motion keeps the idea but steps per state", () => {
  assert.equal(computeHeat("PLACED", placed, 20, at(10), true).heat, 1);
  assert.equal(computeHeat("PLACED", placed, 20, at(19), true).heat, 1);
  assert.equal(computeHeat("PLACED", placed, 20, at(21), true).heat, 0.25);
  assert.equal(computeHeat("PLACED", placed, 20, at(80), true).heat, 0.25);
});

test("before mount the lamp is simply warm", () => {
  assert.equal(computeHeat("PLACED", placed, 20, null, false).state, "waiting");
  assert.equal(computeHeat("PLACED", placed, 20, null, false).heat, 1);
});

test("clock pads minutes and seconds", () => {
  assert.equal(clock(0), "00:00");
  assert.equal(clock(65), "01:05");
  assert.equal(clock(1493), "24:53");
});
