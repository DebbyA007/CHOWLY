import { timingSafeEqual } from "node:crypto";
// The extension is spelled out so plain Node can run the unit tests for this file.
import { HttpError } from "./errors.ts";

// There is no authentication in CHOWLY by design: the assignment forbids logins and
// requires the live link to be usable by anyone, so the role switch is a view switch
// and the waiter routes are open. This file is the authorization seam a real deployment
// would turn on. When it is on, waiter routes need the staff PIN in the x-staff-pin
// header, compared in constant time.
//
// The seam is off by default. It is on only when STAFF_PIN_REQUIRED is exactly "true";
// an absent, empty or malformed flag leaves every waiter route open, because the
// product's rule is no gate anywhere, and a deployment that never set the variable
// must not lock its own waiter side.
const HEADER = "x-staff-pin";

type Env = Record<string, string | undefined>;

export function staffPinRequired(env: Env = process.env): boolean {
  const flag = env.STAFF_PIN_REQUIRED;
  if (typeof flag !== "string") return false;
  return flag.trim() === "true";
}

export function assertStaffPin(request: Request, env: Env = process.env): void {
  if (!staffPinRequired(env)) return;
  const expected = env.STAFF_PIN;
  if (!expected || expected.length < 4) {
    throw new HttpError(500, "STAFF_PIN is not configured on the server.");
  }
  const given = request.headers.get(HEADER) ?? "";
  if (!pinMatches(given, expected)) {
    throw new HttpError(401, "This deployment requires the staff PIN in the x-staff-pin header, and it was missing or wrong.");
  }
}

// timingSafeEqual needs equal lengths. A wrong-length PIN is compared against the
// expected PIN anyway so the early exit does not itself leak the length.
export function pinMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
