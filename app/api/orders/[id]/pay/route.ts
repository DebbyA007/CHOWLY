import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { orderIdSchema, parseWith, paymentSchema } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";

type Context = { params: Promise<{ id: string }> };

// Pretend payment. Ownership is part of the query and the order must have been served.
// The payment insert and the status flip run in one transaction, and Payment.orderId is
// unique (delta 8), so a double-clicked button records once: the second call, whether it
// arrives after the first or in the same instant, returns the payment that already
// exists instead of failing or duplicating. The amount is the order's stored total,
// never anything the client sent, and the row is labelled pretend (delta 9).
export function POST(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    if (!orderIdSchema.safeParse(id).success) throw new HttpError(404, "No order with that id for this table.");
    const customer = await requireCustomer();
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(paymentSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);

    const order = await prisma.order.findFirst({
      where: { id, customerId: customer.id },
      select: { id: true, status: true, totalKobo: true, payment: { select: { id: true } } },
    });
    if (!order) throw new HttpError(404, "No order with that id for this table.");

    if (order.payment) return NextResponse.json(await present(order.id), { status: 200 });
    if (order.status !== "SERVED") {
      throw new HttpError(409, "Pay once the order has been served. The waiter marks it served at the table.");
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            amountKobo: order.totalKobo,
            method: parsed.data.method,
            isPretend: true,
            orderId: order.id,
            customerId: customer.id,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date() },
        });
      });
    } catch (error) {
      // Two calls raced and the other one won: the unique constraint fired here. The
      // order is paid either way, so return what exists rather than an error.
      const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!duplicate) throw error;
      return NextResponse.json(await present(order.id), { status: 200 });
    }
    return NextResponse.json(await present(order.id), { status: 201 });
  });
}

async function present(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
  return presentOrder(order);
}
