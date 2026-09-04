import { Landing } from "@/components/night/landing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "CHOWLY" }, description: "Order at your table, watch the wait, and pay before you leave. A dining app for The Golden Gate, Berger, Lagos." };

// Screen 1. The front door: the room, the name, guest or waiter.
export default function Home() {
  return <Landing />;
}
