import { WaiterOrder } from "@/components/night/waiter";

// Screen 6. One order open on the waiter's side.
export default async function WaiterOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WaiterOrder id={id} />;
}
