import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assertStaffPin } from "@/lib/staff-pin";

// The ticket rail: every order that is placed or served, oldest first, plus the staff
// lists the waiter picks from when marking an order served. Paid orders have left the
// floor and are not shown. Gated by the staff PIN, since it lists every table's order.
export function GET(request: Request) {
  return handle(async () => {
    assertStaffPin(request);
    const now = new Date();
    const [orders, waiters, chefs, bartenders] = await Promise.all([
      prisma.order.findMany({
        where: { status: { in: ["PLACED", "SERVED"] } },
        orderBy: { placedAt: "asc" },
        include: orderInclude,
      }),
      prisma.waiter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, shift: true } }),
      prisma.chef.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, specialty: true } }),
      prisma.bartender.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, specialty: true } }),
    ]);
    return NextResponse.json({
      now,
      orders: orders.map((order) => presentOrder(order, now)),
      staff: { waiters, chefs, bartenders },
    });
  });
}
