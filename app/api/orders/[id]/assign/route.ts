import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assignSchema, orderIdSchema, parseWith } from "@/lib/schemas";
import { assertStaffPin } from "@/lib/staff-pin";

type Context = { params: Promise<{ id: string }> };

// The waiter records who served, who cooked and who mixed, and the order becomes
// SERVED with servedAt set. Gated by the staff PIN. Only a PLACED order can be served;
// serving it twice, or serving a paid order, is refused rather than silently rewritten.
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

    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) throw new HttpError(404, "No order with that id.");
    if (order.status !== "PLACED") {
      throw new HttpError(409, `This order is already ${order.status.toLowerCase()}. Refresh the rail.`);
    }

    const [waiter, chef, bartender] = await Promise.all([
      prisma.waiter.findUnique({ where: { id: waiterId }, select: { id: true } }),
      prisma.chef.findUnique({ where: { id: chefId }, select: { id: true } }),
      prisma.bartender.findUnique({ where: { id: bartenderId }, select: { id: true } }),
    ]);
    const missing = [!waiter && "waiter", !chef && "chef", !bartender && "bartender"].filter(Boolean);
    if (missing.length > 0) {
      throw new HttpError(400, `Unknown ${missing.join(", ")}. Pick from the lists on the rail.`);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { waiterId, chefId, bartenderId, status: "SERVED", servedAt: new Date() },
      include: orderInclude,
    });
    return NextResponse.json(presentOrder(updated));
  });
}
