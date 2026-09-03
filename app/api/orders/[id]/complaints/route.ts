import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assertUnderLimit, windowStart } from "@/lib/rate-limit";
import { complaintSchema, orderIdSchema, parseWith } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";
import { isOrderLate } from "@/lib/wait-time";

type Context = { params: Promise<{ id: string }> };

const COMPLAINTS_PER_WINDOW = 5;
const COMPLAINT_WINDOW_MINUTES = 10;

// A complaint about a late order. Ownership is part of the query, and the order has to
// actually be late: still waiting past the promised time, or served after it. The UI only
// shows the entry point once the ring has crossed, and the server enforces the same
// rule, so a hand-made request cannot complain about an order that is on time.
export function POST(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) throw new HttpError(404, "No order with that id for this table.");
    const customer = await requireCustomer();
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(complaintSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);

    const order = await prisma.order.findFirst({
      where: { id, customerId: customer.id },
      select: { id: true, status: true, placedAt: true, waitMinutes: true, servedAt: true },
    });
    if (!order) throw new HttpError(404, "No order with that id for this table.");
    if (!isOrderLate(order)) {
      throw new HttpError(409, "This order is not late yet. A complaint opens once the promised wait has passed.");
    }

    await assertUnderLimit("complaints", COMPLAINTS_PER_WINDOW, COMPLAINT_WINDOW_MINUTES, () =>
      prisma.complaint.count({
        where: { customerId: customer.id, createdAt: { gte: windowStart(COMPLAINT_WINDOW_MINUTES) } },
      }),
    );

    await prisma.complaint.create({
      data: { description: parsed.data.description, orderId: order.id, customerId: customer.id },
    });
    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    return NextResponse.json(presentOrder(updated), { status: 201 });
  });
}
