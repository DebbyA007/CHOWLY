import { notFound } from "next/navigation";
import { OrderScreen } from "@/components/pass/order-screen";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { orderIdSchema } from "@/lib/schemas";
import { getCustomer } from "@/lib/session";

export const dynamic = "force-dynamic";

// The order page renders on the server for the browser that placed the order. The
// ownership check is the same combined query the API uses, and anything else is a 404,
// so the address of an order tells another table nothing.
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!orderIdSchema.safeParse(id).success) notFound();
  const customer = await getCustomer();
  if (!customer) notFound();
  const order = await prisma.order.findFirst({ where: { id, customerId: customer.id }, include: orderInclude });
  if (!order) notFound();

  const presented = presentOrder(order);
  const initial = {
    ...presented,
    placedAt: presented.placedAt.toISOString(),
    dueAt: presented.dueAt.toISOString(),
    servedAt: presented.servedAt?.toISOString() ?? null,
    paidAt: presented.paidAt?.toISOString() ?? null,
    payment: presented.payment ? { ...presented.payment, paidAt: presented.payment.paidAt } : null,
  };

  return (
    <OrderScreen initial={JSON.parse(JSON.stringify(initial))} />
  );
}
