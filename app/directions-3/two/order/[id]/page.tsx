import { RunOrder } from "@/components/directions-3/two/order";

export default async function RunOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RunOrder id={id} />;
}
