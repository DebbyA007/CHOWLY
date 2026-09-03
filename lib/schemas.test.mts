import { test } from "node:test";
import assert from "node:assert/strict";
import { assignSchema, complaintSchema, orderCreateSchema, orderIdSchema, parseWith, paymentSchema, ratingSchema } from "./schemas.ts";

test("a valid order body passes and is trimmed", () => {
  const r = parseWith(orderCreateSchema, { tableNo: " 7 ", items: [{ menuItemId: "item_jollof_rice", quantity: 2 }] });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.data, { tableNo: "7", items: [{ menuItemId: "item_jollof_rice", quantity: 2 }] });
});

test("a client that posts a price is rejected, with the reason named", () => {
  const r = parseWith(orderCreateSchema, { tableNo: "7", items: [{ menuItemId: "item_jollof_rice", quantity: 1, priceKobo: 1 }] });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.message, /Unknown field: priceKobo/);
  const top = parseWith(orderCreateSchema, { tableNo: "7", items: [{ menuItemId: "x", quantity: 1 }], totalKobo: 1, waitMinutes: 1 });
  assert.equal(top.ok, false);
  if (!top.ok) assert.match(top.message, /Unknown field: totalKobo, waitMinutes/);
});

test("quantities are bounded integers and the ticket is bounded", () => {
  assert.equal(parseWith(orderCreateSchema, { tableNo: "7", items: [{ menuItemId: "x", quantity: 0 }] }).ok, false);
  assert.equal(parseWith(orderCreateSchema, { tableNo: "7", items: [{ menuItemId: "x", quantity: 1.5 }] }).ok, false);
  assert.equal(parseWith(orderCreateSchema, { tableNo: "7", items: [{ menuItemId: "x", quantity: 21 }] }).ok, false);
  assert.equal(parseWith(orderCreateSchema, { tableNo: "7", items: [] }).ok, false);
  assert.equal(parseWith(orderCreateSchema, { tableNo: "", items: [{ menuItemId: "x", quantity: 1 }] }).ok, false);
});

test("rating score is 1 to 5 and nothing else", () => {
  assert.equal(parseWith(ratingSchema, { score: 0 }).ok, false);
  assert.equal(parseWith(ratingSchema, { score: 6 }).ok, false);
  assert.equal(parseWith(ratingSchema, { score: 3.5 }).ok, false);
  assert.equal(parseWith(ratingSchema, { score: 5, comment: "Good" }).ok, true);
  assert.equal(parseWith(ratingSchema, { score: 5, customerId: "someone-else" }).ok, false);
});

test("complaint, assignment and payment shapes are strict", () => {
  assert.equal(parseWith(complaintSchema, { description: "Late" }).ok, true);
  assert.equal(parseWith(complaintSchema, { description: "no" }).ok, false);
  assert.equal(parseWith(assignSchema, { waiterId: "w", chefId: "c", bartenderId: "b" }).ok, true);
  assert.equal(parseWith(assignSchema, { waiterId: "w", chefId: "c", bartenderId: "b", status: "PAID" }).ok, false);
  assert.equal(parseWith(paymentSchema, { method: "CARD" }).ok, true);
  assert.equal(parseWith(paymentSchema, { method: "CARD", amountKobo: 1 }).ok, false);
  assert.equal(parseWith(paymentSchema, { method: "CRYPTO" }).ok, false);
});

test("order ids look like cuids", () => {
  assert.equal(orderIdSchema.safeParse("cmf7q2z1x0000abcd1234efgh").success, true);
  assert.equal(orderIdSchema.safeParse("1 OR 1=1").success, false);
  assert.equal(orderIdSchema.safeParse("").success, false);
});
