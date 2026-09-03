// Server-side only. Reads the signed session cookie and maps it to a Customer row.
// Never import this from a client component.
import { cookies, headers } from "next/headers";
import type { Customer } from "@prisma/client";
import { HttpError } from "./http";
import { prisma } from "./prisma";
import { SESSION_COOKIE, SESSION_HEADER, sessionSecret, verifyCookieValue } from "./session-token";

// The verified token for this request, or null. The cookie is the normal path. On the
// very first request a browser makes, the middleware has minted a cookie for the
// response but the request carried none, so the middleware forwards the same signed
// value in a header it controls. Both paths verify the signature; neither trusts input.
async function verifiedToken(): Promise<string | null> {
  const secret = sessionSecret();
  const jar = await cookies();
  const fromCookie = await verifyCookieValue(jar.get(SESSION_COOKIE)?.value, secret);
  if (fromCookie) return fromCookie;
  const forwarded = (await headers()).get(SESSION_HEADER) ?? undefined;
  return verifyCookieValue(forwarded, secret);
}

// Read-only, for server components. Null until the first API call creates the row.
export async function getCustomer(): Promise<Customer | null> {
  const token = await verifiedToken();
  if (!token) return null;
  return prisma.customer.findUnique({ where: { sessionToken: token } });
}

// For route handlers. Returns the customer for this browser, creating the row on first
// use. The customer id is never read from the request; it comes from this lookup alone.
export async function requireCustomer(): Promise<Customer> {
  const token = await verifiedToken();
  if (!token) {
    throw new HttpError(401, "This request needs a session cookie. Enable cookies and reload the page.");
  }
  return prisma.customer.upsert({
    where: { sessionToken: token },
    update: {},
    create: { sessionToken: token, name: "Guest", tableNo: "" },
  });
}
