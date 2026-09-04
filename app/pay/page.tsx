import { PayScreen } from "@/components/night/pay";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your bill", description: "The bill for your table, and the receipt once it is settled." };

// Screens 7 and 8. Pay, then the receipt.
export default function PayPage() {
  return <PayScreen />;
}
