import { OrderScreen } from "@/components/night/order";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your order", description: "Your order and the kitchen's promise, counted down live." };

// Screens 3 and 4. The guest's current order, tracked against the promise.
export default function OrderPage() {
  return <OrderScreen />;
}
