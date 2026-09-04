import { WaiterMenu } from "@/components/night/waiter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kitchen menu", description: "Every dish on the card, and the switch that takes one off when the kitchen runs out." };

export default function WaiterMenuPage() {
  return <WaiterMenu />;
}
