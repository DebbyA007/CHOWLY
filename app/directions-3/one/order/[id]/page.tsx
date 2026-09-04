import { PassOrder } from "@/components/directions-3/one/order";

export default async function PassOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PassOrder id={id} />;
}
