import { OrderScreen } from "@/components/night/order";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your order", description: "Your order and the kitchen's promise, counted down live." };

// One of the session's orders by id: an earlier one, or a second open one. The API only
// returns the session's own, so another table's id shows nothing.
export default async function OrderByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderScreen id={id} />;
}
