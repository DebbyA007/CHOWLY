import { WaiterOrder } from "@/components/night/waiter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order", description: "One order on the floor: who cooked, who mixed, and when it was served." };

// Screen 6. One order open on the waiter's side.
export default async function WaiterOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WaiterOrder id={id} />;
}
