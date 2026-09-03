// The customer identity: an opaque random token, signed with SESSION_SECRET, carried in
// an httpOnly cookie. Web Crypto only, because the middleware that mints it runs on the
// edge runtime and the route handlers that verify it run on Node. One implementation
// for both.

export const SESSION_COOKIE = "chowly_session";
// Set by the middleware on the request it has just minted a cookie for, and stripped from
// every incoming request first, so only the middleware can ever be its source.
export const SESSION_HEADER = "x-chowly-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const HEX_64 = /^[0-9a-f]{64}$/;

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

const utf8 = new TextEncoder();

export function mintToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hmac(token: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, utf8.encode(token));
  return toHex(new Uint8Array(signature));
}

export async function signToken(token: string, secret: string): Promise<string> {
  return `${token}.${await hmac(token, secret)}`;
}

// The token when the cookie value is well formed and its signature matches, else null.
export async function verifyCookieValue(
  value: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!value) return null;
  const [token, signature, ...rest] = value.split(".");
  if (rest.length > 0 || !token || !signature || !HEX_64.test(token) || !HEX_64.test(signature)) {
    return null;
  }
  const expected = await hmac(token, secret);
  return constantTimeEqual(signature, expected) ? token : null;
}

// Compares every character regardless of where the first difference is, so timing does
// not leak how much of a forged signature was right.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters. Set it in .env.");
  }
  return secret;
}
