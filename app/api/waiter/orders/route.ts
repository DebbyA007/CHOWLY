import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { STAFF_ORDER, byDesignOrder } from "@/lib/menu-order";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assertStaffPin } from "@/lib/staff-pin";

// The ticket rail: every order that is placed or served, oldest first, plus the staff
// lists the waiter picks from when marking an order served. Orders paid in the last
// twelve hours come too, for the table board; the live list leaves them out. Behind the
// staff PIN seam, since it lists every table's order.
const PAID_KEPT_HOURS = 12;

export function GET(request: Request) {
  return handle(async () => {
    assertStaffPin(request);
    const now = new Date();
    const [orders, waiters, chefs, bartenders] = await Promise.all([
      prisma.order.findMany({
        where: { OR: [{ status: { in: ["PLACED", "SERVED"] } }, { status: "PAID", paidAt: { gte: new Date(now.getTime() - PAID_KEPT_HOURS * 3_600_000) } }] },
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
      staff: { waiters: byDesignOrder(waiters, STAFF_ORDER), chefs: byDesignOrder(chefs, STAFF_ORDER), bartenders: byDesignOrder(bartenders, STAFF_ORDER) },
    });
  });
}
