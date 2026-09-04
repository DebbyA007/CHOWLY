import assert from "node:assert/strict";
import { test } from "node:test";
import { orderCreateSchema, parseWith } from "./schemas.ts";

// The regression this guards: the client's placement payload grew a field the client
// needed for itself, it was posted verbatim, and the strict schema rejected every order
// with a 400. The wire shape is now asserted here rather than trusted.
test("the placement body the client sends is exactly what the schema accepts", () => {
  const body = { tableNo: "12", items: [{ menuItemId: "item_jollof_rice", quantity: 1 }] };
  const parsed = parseWith(orderCreateSchema, body);
  assert.equal(parsed.ok, true);
});

test("an extra field on the placement body is refused, and says which", () => {
  const body = { tableNo: "12", items: [{ menuItemId: "item_jollof_rice", quantity: 1 }], foodIds: ["item_jollof_rice"] };
  const parsed = parseWith(orderCreateSchema, body);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.match(parsed.message, /foodIds/);
});
