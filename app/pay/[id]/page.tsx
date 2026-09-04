import { PayScreen } from "@/components/night/pay";

export default async function PayByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PayScreen id={id} />;
}
