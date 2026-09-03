// Gives every visitor a signed session cookie on their first request, so a refresh keeps
// the same identity. No database work here: the customer row is created by the first
// API call that needs one. Runs on the edge runtime, hence Web Crypto only.
//
// This is the only place a session is minted. When it mints one, it also forwards the
// signed value to the route handler in a request header, so the very first request a
// browser makes can already act as that customer. The header is deleted from every
// incoming request before anything else happens, so a client cannot supply it.
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_HEADER,
  cookieOptions,
  mintToken,
  sessionSecret,
  signToken,
  verifyCookieValue,
} from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const secret = sessionSecret();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(SESSION_HEADER);

  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifyCookieValue(existing, secret)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const signed = await signToken(mintToken(), secret);
  requestHeaders.set(SESSION_HEADER, signed);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(SESSION_COOKIE, signed, cookieOptions());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
