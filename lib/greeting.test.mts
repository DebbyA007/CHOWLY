import { test } from "node:test";
import assert from "node:assert/strict";
import { greetingFor } from "./greeting.ts";

test("the three parts of the day, and where they change", () => {
  assert.equal(greetingFor(4).hello, "Good evening.");
  assert.equal(greetingFor(5).hello, "Good morning.");
  assert.equal(greetingFor(11).hello, "Good morning.");
  assert.equal(greetingFor(12).hello, "Good afternoon.");
  assert.equal(greetingFor(16).hello, "Good afternoon.");
  assert.equal(greetingFor(17).hello, "Good evening.");
  assert.equal(greetingFor(23).hello, "Good evening.");
  assert.equal(greetingFor(0).hello, "Good evening.");
});

test("every hour of the day gets a greeting and a question", () => {
  for (let h = 0; h < 24; h++) {
    const g = greetingFor(h);
    assert.match(g.hello, /^Good (morning|afternoon|evening)\.$/, String(h));
    assert.match(g.ask, /^What would you like /, String(h));
  }
});

// No login means no way to know who is holding the phone, so the copy never guesses.
test("the copy carries no honorific and no title", () => {
  for (let h = 0; h < 24; h++) {
    const text = `${greetingFor(h).hello} ${greetingFor(h).ask}`.toLowerCase();
    for (const guess of [" sir", " ma ", "madam", "mr ", "mrs", "miss", "ma'am"]) {
      assert.equal(text.includes(guess), false, `${guess} at hour ${h}`);
    }
  }
});

test("an hour outside the clock is an error, not a guess", () => {
  for (const bad of [-1, 24, 1.5, NaN]) {
    assert.throws(() => greetingFor(bad), /hour must be an integer/);
  }
});
