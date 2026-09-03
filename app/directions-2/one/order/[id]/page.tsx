import { LinenOrder } from "@/components/directions-2/one/order";

// The walkthrough reads the order through the real API from the browser, so the same
// ownership rule applies: another browser sees "Not your table".
export default async function LinenOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LinenOrder id={id} />;
}
