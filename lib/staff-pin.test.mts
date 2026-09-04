import { test } from "node:test";
import assert from "node:assert/strict";
import { assertStaffPin, pinMatches, staffPinRequired } from "./staff-pin.ts";

const request = (pin?: string) => new Request("http://x/api/waiter/orders", { headers: pin === undefined ? {} : { "x-staff-pin": pin } });

test("the check is off unless the flag is exactly true", () => {
  assert.equal(staffPinRequired({}), false, "absent stays open");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "" }), false, "empty stays open");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "1" }), false);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "yes" }), false);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "on" }), false);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "True" }), false, "case matters: explicit means exact");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "false" }), false);
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: "true" }), true, "only true closes it");
  assert.equal(staffPinRequired({ STAFF_PIN_REQUIRED: " true " }), true, "whitespace around it is tolerated");
});

test("with the check on, the PIN is required and compared", () => {
  const env = { STAFF_PIN_REQUIRED: "true", STAFF_PIN: "483920" };
  assert.throws(() => assertStaffPin(request(), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("000000"), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("48"), env), /missing or wrong/);
  assert.throws(() => assertStaffPin(request("4839200"), env), /missing or wrong/);
  assert.doesNotThrow(() => assertStaffPin(request("483920"), env));
});

test("with the check on and no PIN configured, the route fails closed", () => {
  assert.throws(() => assertStaffPin(request("483920"), { STAFF_PIN_REQUIRED: "true" }), /not configured/);
  assert.throws(() => assertStaffPin(request("483920"), { STAFF_PIN_REQUIRED: "true", STAFF_PIN: "12" }), /not configured/);
});

test("with the flag absent, false or anything but true, waiter routes are open", () => {
  assert.doesNotThrow(() => assertStaffPin(request(), {}));
  assert.doesNotThrow(() => assertStaffPin(request(), { STAFF_PIN: "483920" }));
  assert.doesNotThrow(() => assertStaffPin(request(), { STAFF_PIN_REQUIRED: "false" }));
  assert.doesNotThrow(() => assertStaffPin(request("anything"), { STAFF_PIN_REQUIRED: "false", STAFF_PIN: "483920" }));
});

test("the compare is exact and length-aware", () => {
  assert.equal(pinMatches("483920", "483920"), true);
  assert.equal(pinMatches("483921", "483920"), false);
  assert.equal(pinMatches("48392", "483920"), false);
  assert.equal(pinMatches("", "483920"), false);
});
