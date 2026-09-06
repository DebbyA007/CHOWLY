import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assignSchema, orderIdSchema, parseWith } from "@/lib/schemas";
import { assertStaffPin } from "@/lib/staff-pin";

type Context = { params: Promise<{ id: string }> };

// The waiter records who served, and who cooked or mixed if anyone did, and the order
// becomes SERVED with servedAt set. Which of the three the order needs is derived from
// the stations of its own dishes (delta 12), not assumed. Gated by the staff PIN. Only a
// PLACED order can be served; serving it twice, or serving a paid or cancelled order, is
// refused rather than silently rewritten.
export function PATCH(request: Request, context: Context) {
  return handle(async () => {
    assertStaffPin(request);
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) throw new HttpError(404, "No order with that id.");
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(assignSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);
    const { waiterId, chefId, bartenderId } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true, items: { select: { menuItem: { select: { station: true } } } } },
    });
    if (!order) throw new HttpError(404, "No order with that id.");
    if (order.status !== "PLACED") {
      throw new HttpError(409, `This order is already ${order.status.toLowerCase()}. Refresh the rail.`);
    }

    // DELTA 12: what the order needs is read from the order, not assumed. A water only
    // order needs neither a chef nor a bartender, and naming one for it would put a name
    // on a receipt for work nobody did.
    const needsChef = order.items.some((line) => line.menuItem.station === "KITCHEN");
    const needsBartender = order.items.some((line) => line.menuItem.station === "BAR");
    if (needsChef && !chefId) throw new HttpError(400, "Something on this order was cooked. Record who cooked it.");
    if (needsBartender && !bartenderId) throw new HttpError(400, "Something on this order was mixed. Record who mixed it.");
    if (!needsChef && chefId) throw new HttpError(400, "Nothing on this order came from the kitchen, so it has no chef.");
    if (!needsBartender && bartenderId) throw new HttpError(400, "Nothing on this order came from the bar, so it has no bartender.");

    const [waiter, chef, bartender] = await Promise.all([
      prisma.waiter.findUnique({ where: { id: waiterId }, select: { id: true } }),
      chefId ? prisma.chef.findUnique({ where: { id: chefId }, select: { id: true } }) : null,
      bartenderId ? prisma.bartender.findUnique({ where: { id: bartenderId }, select: { id: true } }) : null,
    ]);
    const missing = [!waiter && "waiter", chefId && !chef && "chef", bartenderId && !bartender && "bartender"].filter(Boolean);
    if (missing.length > 0) {
      throw new HttpError(400, `Unknown ${missing.join(", ")}. Pick from the lists on the rail.`);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { waiterId, chefId: chefId ?? null, bartenderId: bartenderId ?? null, status: "SERVED", servedAt: new Date() },
      include: orderInclude,
    });
    return NextResponse.json(presentOrder(updated));
  });
}
