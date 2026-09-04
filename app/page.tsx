import type { Metadata } from "next";
import { Landing } from "@/components/night/landing";
import { Splash } from "@/components/night/splash";

export const metadata: Metadata = { title: { absolute: "CHOWLY" }, description: "Order at your table, watch the wait, and pay before you leave. A dining app for The Golden Gate, Berger, Lagos." };

// Screen 1. The front door: the room, the name, guest or waiter. Pre-rendered, splash
// and all; an inline script in the root layout reads the warm-start cookie before the
// body is parsed and hides the splash for the session's later visits, so a cold start
// gets the splash from the first byte and a warm start never sees it.
export default function Home() {
  return (
    <>
      <Splash />
      <Landing />
    </>
  );
}
