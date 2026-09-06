import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { orderIdSchema } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";
import { canCancel } from "@/lib/wait-time";

type Context = { params: Promise<{ id: string }> };

// DELTA 13: the guest withdraws their own order. Two things have to hold, and both are
// checked here rather than trusted from the screen: the order is still PLACED, and it is
// inside the first quarter of the promised wait. A request one second late is refused
// with a sentence that says why, because the button disappearing is presentation.
//
// There is deliberately no waiter cancel. On a surface with no login, a waiter cancel
// would be authorised by nothing, and it would be the only destructive action a stranger
// with the link could take. The reasoning is in docs/SUBMISSION.md.
//
// Ownership is part of the query. The order id comes from the path and the customer id
// from the signed session cookie; neither is ever read from the body.
// The request is deliberately unused: nothing about this decision comes from the client,
// so there is nothing for a client to send, and anything sent is ignored rather than
// parsed into a shape that might later be trusted.
export function POST(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) throw new HttpError(404, "No order with that id for this table.");
    const customer = await requireCustomer();

    const order = await prisma.order.findFirst({
      where: { id, customerId: customer.id },
      select: { id: true, status: true, placedAt: true, waitMinutes: true },
    });
    if (!order) throw new HttpError(404, "No order with that id for this table.");
    if (order.status === "CANCELLED") {
      throw new HttpError(409, "This order is already cancelled.");
    }
    if (order.status !== "PLACED") {
      throw new HttpError(409, `This order is already ${order.status.toLowerCase()}, so it cannot be cancelled. Ask your waiter.`);
    }
    if (!canCancel(order)) {
      // The screen names the kitchen, the bar or the waiter, because it knows what is on
      // the order. This does not read the lines, so it names nobody rather than guessing.
      throw new HttpError(409, "The time to cancel this order has passed. Ask your waiter if something is wrong.");
    }

    // The status and the timestamp move together, and only from PLACED, so two taps a
    // moment apart cannot cancel an order the waiter has just served.
    const { count } = await prisma.order.updateMany({
      where: { id: order.id, customerId: customer.id, status: "PLACED" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (count === 0) {
      throw new HttpError(409, "Your waiter reached this order first. Ask them about it.");
    }
    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    return NextResponse.json(presentOrder(updated));
  });
}
