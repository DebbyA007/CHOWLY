import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Landing } from "@/components/night/landing";
import { Splash } from "@/components/night/splash";
import { SPLASH_COOKIE } from "@/lib/splash";

export const metadata: Metadata = { title: { absolute: "CHOWLY" }, description: "Order at your table, watch the wait, and pay before you leave. A dining app for The Golden Gate, Berger, Lagos." };

// Screen 1. The front door: the room, the name, guest or waiter. On a cold start the
// splash covers it once; the cookie it sets at the handoff is read here, on the server,
// so a warm start renders the door with no splash and nothing flashes.
export default async function Home() {
  const cold = !(await cookies()).get(SPLASH_COOKIE);
  return (
    <>
      {cold ? <Splash /> : null}
      <Landing afterSplash={cold} />
    </>
  );
}
