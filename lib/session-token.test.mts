import { test } from "node:test";
import assert from "node:assert/strict";
import { mintToken, signToken, verifyCookieValue } from "./session-token.ts";

const secret = "test-secret-that-is-long-enough-for-hmac-use";

test("a minted token is 32 random bytes as hex", () => {
  const a = mintToken();
  const b = mintToken();
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
});

test("a signed value verifies back to its token", async () => {
  const token = mintToken();
  const value = await signToken(token, secret);
  assert.match(value, /^[0-9a-f]{64}\.[0-9a-f]{64}$/);
  assert.equal(await verifyCookieValue(value, secret), token);
});

test("tampering with the token or the signature fails verification", async () => {
  const token = mintToken();
  const value = await signToken(token, secret);
  const [t, s] = value.split(".") as [string, string];
  const flippedToken = (t[0] === "a" ? "b" : "a") + t.slice(1);
  const flippedSig = (s[0] === "a" ? "b" : "a") + s.slice(1);
  assert.equal(await verifyCookieValue(`${flippedToken}.${s}`, secret), null);
  assert.equal(await verifyCookieValue(`${t}.${flippedSig}`, secret), null);
  assert.equal(await verifyCookieValue(value, "a-different-secret-that-is-also-long-enough"), null);
});

test("malformed values are rejected without throwing", async () => {
  assert.equal(await verifyCookieValue(undefined, secret), null);
  assert.equal(await verifyCookieValue("", secret), null);
  assert.equal(await verifyCookieValue("not-a-cookie", secret), null);
  assert.equal(await verifyCookieValue("abc.def", secret), null);
  assert.equal(await verifyCookieValue("a".repeat(64) + "." + "b".repeat(64) + ".extra", secret), null);
});
