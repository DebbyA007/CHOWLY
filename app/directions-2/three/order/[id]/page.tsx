import { GlazeOrder } from "@/components/directions-2/three/order";

export default async function GlazeOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GlazeOrder id={id} />;
}
