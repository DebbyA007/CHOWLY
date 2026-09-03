import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assertUnderLimit, windowStart } from "@/lib/rate-limit";
import { orderIdSchema, parseWith, ratingSchema } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

const RATINGS_PER_WINDOW = 10;
const RATING_WINDOW_MINUTES = 10;

// One rating per order, 1 to 5. Ownership is part of the query. The write is an upsert
// on the unique orderId, so rating again changes the score instead of failing on the
// constraint or adding a second row; the database check constraint is the last line on
// the range, Zod the first.
export function POST(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) throw new HttpError(404, "No order with that id for this table.");
    const customer = await requireCustomer();
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(ratingSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);

    const order = await prisma.order.findFirst({
      where: { id, customerId: customer.id },
      select: { id: true, rating: { select: { id: true } } },
    });
    if (!order) throw new HttpError(404, "No order with that id for this table.");

    await assertUnderLimit("ratings", RATINGS_PER_WINDOW, RATING_WINDOW_MINUTES, () =>
      prisma.rating.count({
        where: { customerId: customer.id, createdAt: { gte: windowStart(RATING_WINDOW_MINUTES) } },
      }),
    );

    const { score, comment } = parsed.data;
    await prisma.rating.upsert({
      where: { orderId: order.id },
      update: { score, comment: comment ?? null },
      create: { score, comment: comment ?? null, orderId: order.id, customerId: customer.id },
    });
    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    return NextResponse.json(presentOrder(updated), { status: order.rating ? 200 : 201 });
  });
}
