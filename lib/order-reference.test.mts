import { test } from "node:test";
import assert from "node:assert/strict";
import { FIRST_REFERENCE, nextReferences } from "./order-reference.ts";

test("the first order of all takes 1001", () => {
  assert.equal(nextReferences(null)[0], String(FIRST_REFERENCE));
});

test("the next reference is above the highest in use, not the number of orders", () => {
  assert.equal(nextReferences(1009)[0], "1010");
  assert.equal(nextReferences(1005)[0], "1006");
});

test("each attempt takes a different number, so a collision can clear", () => {
  const tries = nextReferences(1009, 5);
  assert.deepEqual(tries, ["1010", "1011", "1012", "1013", "1014"]);
  assert.equal(new Set(tries).size, tries.length, "an attempt repeated a reference");
});

// The exact state of the deployed database when placement broke: five original orders,
// two placed after a cleanup, and #1009 kept on purpose so the walkthrough video could be
// checked against it. 1001 + count lands on 1009 and stays there.
test("the live state that broke placement no longer collides", () => {
  const inUse = ["1001", "1002", "1003", "1004", "1005", "1007", "1008", "1009"];
  const taken = new Set(inUse);

  const byCount = String(FIRST_REFERENCE + inUse.length);
  assert.equal(byCount, "1009");
  assert.equal(taken.has(byCount), true, "the old rule picked a reference that was in use");

  const highest = Math.max(...inUse.map(Number));
  for (const candidate of nextReferences(highest, 5)) {
    assert.equal(taken.has(candidate), false, `${candidate} is already in use`);
  }
});

test("a gap below the highest is never filled, so a reference is never reused", () => {
  // #1006 was deleted. Reusing it would put a second order under a number a receipt,
  // a screenshot or the walkthrough video already refers to.
  const taken = new Set(["1001", "1005", "1007", "1008", "1009"]);
  for (const candidate of nextReferences(1009, 8)) {
    assert.equal(taken.has(candidate), false);
    assert.ok(Number(candidate) > 1009);
  }
});

test("bad input is refused rather than guessed", () => {
  assert.throws(() => nextReferences(1009, 0), /attempts must be a positive integer/);
  assert.throws(() => nextReferences(-1), /highestInUse must be a non-negative integer/);
  assert.throws(() => nextReferences(1.5), /highestInUse must be a non-negative integer/);
});
