import { PayScreen } from "@/components/night/pay";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your bill", description: "The bill for your table, and the receipt once it is settled." };

export default async function PayByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PayScreen id={id} />;
}
