import { timingSafeEqual } from "node:crypto";
import { HttpError } from "./http";

// The role switch in the UI is not a security boundary: the assignment forbids logins,
// so anyone can flip to the waiter view. Waiter mutations are therefore gated by this
// PIN, sent in the x-staff-pin header and compared in constant time. This is the honest
// boundary, and the document says so.
const HEADER = "x-staff-pin";

export function assertStaffPin(request: Request): void {
  const expected = process.env.STAFF_PIN;
  if (!expected || expected.length < 4) {
    throw new HttpError(500, "STAFF_PIN is not configured on the server.");
  }
  const given = request.headers.get(HEADER) ?? "";
  if (!pinMatches(given, expected)) {
    throw new HttpError(401, "Staff PIN missing or wrong. Enter the PIN from the waiter station and try again.");
  }
}

// timingSafeEqual needs equal lengths. A wrong-length PIN is compared against the
// expected PIN anyway so the early exit does not itself leak the length.
function pinMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
