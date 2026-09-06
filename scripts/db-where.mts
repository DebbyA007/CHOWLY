// Says which database the current environment points at, and whether the guard that
// keeps destructive commands off production is armed. Prints the host and the database
// name only: a connection string carries a password and this never touches it.
//
// Run it before anything that writes. `npm run db:where`.
import { checkDestructive, guardState } from "../lib/db-target.ts";

const verdict = checkDestructive(process.env);
const guard = guardState(process.env);
console.log(`database   ${verdict.target.database}`);
console.log(`host       ${verdict.target.host}`);
console.log(`connection ${verdict.target.pooled ? "pooled" : "direct"}`);
console.log(`guard      ${guard}`);
console.log(`writes     ${verdict.allowed ? "allowed" : "refused, this is the production database"}`);
if (guard === "off") {
  console.log("\nPRODUCTION_DB_HOST is not set, so nothing is stopping a seed from writing to production.");
  console.log("docs/DATABASE.md has the two lines that fix it.");
}
