import { BillOrder } from "@/components/directions-2/two/order";

export default async function BillOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillOrder id={id} />;
}
