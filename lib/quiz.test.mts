import { test } from "node:test";
import assert from "node:assert/strict";
import { countByTopic, drawSitting, QUESTIONS, shuffle, TOPICS } from "./quiz.ts";

test("there are enough questions, and the mix is the one intended", () => {
  assert.ok(QUESTIONS.length >= 40 && QUESTIONS.length <= 60, `${QUESTIONS.length} questions`);
  const counts = countByTopic();
  for (const topic of TOPICS) assert.ok(counts[topic] >= 12, `${topic} has only ${counts[topic]}`);
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), QUESTIONS.length);
});

test("every question is well formed and has exactly one answer", () => {
  const ids = new Set<string>();
  for (const question of QUESTIONS) {
    assert.equal(ids.has(question.id), false, `duplicate id ${question.id}`);
    ids.add(question.id);
    assert.equal(question.options.length, 4, question.id);
    assert.equal(new Set(question.options).size, 4, `${question.id} repeats an option`);
    assert.ok(question.answer >= 0 && question.answer < 4, question.id);
    assert.ok(question.ask.trim().endsWith("?"), `${question.id} is not a question`);
    for (const option of question.options) assert.ok(option.trim().length > 0, question.id);
  }
});

// The set is read at a family dinner table, so it stays away from anything that could
// land badly there.
test("nothing in the set is heavy going", () => {
  const avoid = /\b(death|died|kill|war|coup|tribe|tribal|religio|christian|muslim|church|mosque|politic|president|election|corrupt|disease|virus|slave)\w*/i;
  for (const question of QUESTIONS) {
    const text = `${question.ask} ${question.options.join(" ")}`;
    assert.equal(avoid.test(text), false, `${question.id}: ${question.ask}`);
  }
});

test("a sitting never repeats a question", () => {
  const sitting = drawSitting(() => 0.42);
  assert.equal(sitting.length, QUESTIONS.length);
  assert.equal(new Set(sitting.map((a) => a.question.id)).size, QUESTIONS.length);
});

test("the shuffled options still point at the right answer", () => {
  for (const seed of [0, 0.25, 0.5, 0.75, 0.99]) {
    for (const asked of drawSitting(() => seed)) {
      assert.equal(asked.options[asked.answer], asked.question.options[asked.question.answer]);
      assert.equal(new Set(asked.options).size, 4);
    }
  }
});

test("the right answer does not always sit in the same place", () => {
  let random = 0;
  const positions = new Set(drawSitting(() => ((random = (random * 9301 + 49297) % 233280) / 233280)).map((a) => a.answer));
  assert.ok(positions.size > 1, "every answer landed in the same slot");
});

test("shuffling keeps every item and mutates nothing", () => {
  const items = [1, 2, 3, 4, 5];
  const out = shuffle(items, () => 0.5);
  assert.deepEqual([...out].sort(), [...items].sort());
  assert.deepEqual(items, [1, 2, 3, 4, 5]);
});
