import { LiveOrders } from "@/components/night/waiter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Live orders", description: "Every open order on the floor, with its clock." };

// Screen 5. Live orders.
export default function WaiterPage() {
  return <LiveOrders />;
}
