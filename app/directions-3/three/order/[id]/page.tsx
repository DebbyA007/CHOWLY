import { MatOrder } from "@/components/directions-3/three/order";

export default async function MatOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatOrder id={id} />;
}
