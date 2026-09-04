import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentWithReceipt } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { orderIdSchema } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

// One order, for the browser that placed it. The ownership check is part of the query:
// the row must match both the id and the session's customer, and a miss is a 404 either
// way, so the endpoint never confirms that someone else's order exists. isDelayed is
// computed here at read time from placedAt and waitMinutes; it is never stored.
export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) {
      throw new HttpError(404, "No order with that id for this table.");
    }
    const customer = await requireCustomer();
    const order = await prisma.order.findFirst({
      where: { id, customerId: customer.id },
      include: orderInclude,
    });
    if (!order) {
      throw new HttpError(404, "No order with that id for this table. Orders belong to the browser that placed them.");
    }
    return NextResponse.json(await presentWithReceipt(order));
  });
}
