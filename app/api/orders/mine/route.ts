import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { orderInclude, presentWithReceipt } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/session";

// The session's own orders, newest first, so the Order and Pay tabs find the current
// one after a reload. Ownership is the query: only this customer's rows come back.
export function GET() {
  return handle(async () => {
    const customer = await requireCustomer();
    const orders = await prisma.order.findMany({ where: { customerId: customer.id }, orderBy: { placedAt: "desc" }, take: 10, include: orderInclude });
    return NextResponse.json({ orders: await Promise.all(orders.map((order) => presentWithReceipt(order))) });
  });
}
