import { test } from "node:test";
import assert from "node:assert/strict";
import { assertStaffPin, pinMatches, staffPinRequired } from "./staff-pin.ts";

const request = (pin?: string) => new Request("http://x/api/waiter/orders", { headers: pin === undefined ? {} : { "x-staff-pin": pin } });

test("the check is on unless the flag is exactly false", () => {
  assert.equal(staffPinRequired({}), true, "absent stays on");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "" }), true, "empty stays on");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "0" }), true);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "no" }), true);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "off" }), true);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "False" }), true, "case matters: explicit means exact");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "true" }), true);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "false" }), false, "only false opens it");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: " false " }), false, "whitespace around it is tolerated");
});

test("with the check on, the PIN is required and compared", () => {
  const env = { STAFF_PIN: "483920" };
  assert.throws(() => assertStaffPin(request(), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("000000"), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("48"), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("4839200"), env), /missing or wrong/);
  assert.doesNotThrow(() => assertStaffPin(request("483920"), env));
});

test("with the check on and no PIN configured, the route fails closed", () => {
  assert.throws(() => assertStaffPin(request("483920"), {}), /not configured/);
  assert.throws(() => assertStaffPin(request("483920"), { STAFF_PIN: "12" }), /not configured/);
});

test("with the flag exactly false, waiter routes are open", () => {
  assert.doesNotThrow(() => assertStaffPin(request(), { STAFF_PIN_REQUIRED: "false" }));
  assert.doesNotThrow(() => assertStaffPin(request("anything"), { STAFF_PIN_REQUIRED: "false", STAFF_PIN: "483920" }));
});

test("the compare is exact and length-aware", () => {
  assert.equal(pinMatches("483920", "483920"), true);
  assert.equal(pinMatches("483921", "483920"), false);
  assert.equal(pinMatches("48392", "483920"), false);
  assert.equal(pinMatches("", "483920"), false);
});
