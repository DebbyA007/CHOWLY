import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDestructive, describeTarget, guardState, sameEndpoint } from "./db-target.ts";

const PROD = "ep-cool-sun-123456-pooler.c-6.eu-central-1.aws.neon.tech";
const PROD_DIRECT = "ep-cool-sun-123456.c-6.eu-central-1.aws.neon.tech";
const DEV = "ep-quiet-rain-987654-pooler.c-6.eu-central-1.aws.neon.tech";
const url = (host: string) => `postgresql://user:secret@${host}/neondb?sslmode=require`;

test("the target names the host and the database and never the password", () => {
  const t = describeTarget(url(PROD));
  assert.equal(t.host, PROD);
  assert.equal(t.database, "neondb");
  assert.equal(t.pooled, true);
  assert.equal(JSON.stringify(t).includes("secret"), false);
});

test("a connection string that is not a URL is refused by name", () => {
  assert.throws(() => describeTarget("not a url"), /DATABASE_URL is not a URL/);
});

test("the pooled and direct hosts of one Neon branch are the same endpoint", () => {
  assert.equal(sameEndpoint(PROD, PROD_DIRECT), true);
  assert.equal(sameEndpoint(PROD_DIRECT, PROD), true);
  assert.equal(sameEndpoint(PROD, DEV), false);
});

test("a write to the production host is refused, whichever of its two hosts is guarded", () => {
  for (const guarded of [PROD, PROD_DIRECT]) {
    const v = checkDestructive({ DATABASE_URL: url(PROD), PRODUCTION_DB_HOST: guarded });
    assert.equal(v.allowed, false);
    if (!v.allowed) {
      assert.match(v.reason, /production database/);
      assert.match(v.reason, /docs\/DATABASE\.md/);
      assert.equal(v.reason.includes("secret"), false);
    }
  }
});

test("a write to the development branch is allowed", () => {
  const v = checkDestructive({ DATABASE_URL: url(DEV), PRODUCTION_DB_HOST: PROD });
  assert.equal(v.allowed, true);
  assert.equal(v.target.host, DEV);
});

test("the override is one exact phrase and nothing else opens it", () => {
  const env = { DATABASE_URL: url(PROD), PRODUCTION_DB_HOST: PROD };
  assert.equal(checkDestructive({ ...env, ALLOW_PRODUCTION_WRITE: "yes-i-mean-the-live-database" }).allowed, true);
  for (const wrong of ["true", "1", "yes", "YES-I-MEAN-THE-LIVE-DATABASE", "", " yes-i-mean-the-live-database "]) {
    assert.equal(checkDestructive({ ...env, ALLOW_PRODUCTION_WRITE: wrong }).allowed, false, wrong);
  }
});

// The regression this guards: a guard that is silently off is worse than no guard,
// because it is trusted. With no PRODUCTION_DB_HOST the command runs and says so.
test("with no production host set, nothing is guarded and the state says so", () => {
  assert.equal(guardState({}), "off");
  assert.equal(guardState({ PRODUCTION_DB_HOST: "   " }), "off");
  assert.equal(guardState({ PRODUCTION_DB_HOST: PROD }), "armed");
  assert.equal(checkDestructive({ DATABASE_URL: url(PROD) }).allowed, true);
});

test("a missing DATABASE_URL is an error, not a pass", () => {
  assert.throws(() => checkDestructive({ PRODUCTION_DB_HOST: PROD }), /DATABASE_URL is not set/);
});
