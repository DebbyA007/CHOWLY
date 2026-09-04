import { NextResponse } from "next/server";
import { demoControlsEnabled, demoSchema } from "@/lib/demo";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { parseWith } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";

// Demo controls for the walkthroughs. See lib/demo.ts for the three layers that keep
// this out of the product: the flag, the ownership scope, and the routes that render it.
export function POST(request: Request) {
  return handle(async () => {
    if (!demoControlsEnabled()) throw new HttpError(404, "Not found.");
    const customer = await requireCustomer();
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(demoSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);

    if (parsed.data.action === "reset") {
      const deleted = await prisma.order.deleteMany({ where: { customerId: customer.id } });
      return NextResponse.json({ deleted: deleted.count });
    }

    const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, customerId: customer.id } });
    if (!order) throw new HttpError(404, "No order with that id for this table.");
    if (order.status !== "PLACED") throw new HttpError(409, "Only a placed order's clock can be moved.");
    const moved = await prisma.order.update({
      where: { id: order.id },
      data: { placedAt: new Date(order.placedAt.getTime() - parsed.data.minutes * 60_000) },
      include: orderInclude,
    });
    return NextResponse.json(presentOrder(moved));
  });
}
