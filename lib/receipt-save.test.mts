import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseSaveRoute, isDismissal } from "./receipt-save.ts";

const file = { name: "receipt.png", type: "image/png" } as unknown as File;

test("a browser that will carry the file takes the share path", () => {
  const nav = { share: async () => {}, canShare: () => true };
  assert.equal(chooseSaveRoute(nav, file), "share");
});

// The Android case: share exists, files are refused. Offering that share would open a
// sheet that cannot save the picture.
test("a browser that exposes share but refuses files downloads instead", () => {
  const nav = { share: async () => {}, canShare: () => false };
  assert.equal(chooseSaveRoute(nav, file), "download");
});

test("share without canShare is not trusted with a file", () => {
  const nav = { share: async () => {} };
  assert.equal(chooseSaveRoute(nav, file), "download");
});

test("no share at all downloads", () => {
  assert.equal(chooseSaveRoute({}, file), "download");
  assert.equal(chooseSaveRoute(undefined, file), "download");
});

test("a canShare that throws is treated as a no", () => {
  const nav = { share: async () => {}, canShare: () => { throw new Error("nope"); } };
  assert.equal(chooseSaveRoute(nav, file), "download");
});

test("no file yet means no route", () => {
  const nav = { share: async () => {}, canShare: () => true };
  assert.equal(chooseSaveRoute(nav, null), "download");
});

test("dismissing the sheet is not an error; anything else is a failed share", () => {
  assert.equal(isDismissal({ name: "AbortError" }), true);
  assert.equal(isDismissal({ name: "NotAllowedError" }), false);
  assert.equal(isDismissal(new Error("boom")), false);
  assert.equal(isDismissal(null), false);
  assert.equal(isDismissal(undefined), false);
});
