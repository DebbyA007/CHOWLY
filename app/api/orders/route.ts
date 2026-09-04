import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { orderInclude, presentOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { assertUnderLimit, windowStart } from "@/lib/rate-limit";
import { orderCreateSchema, parseWith } from "@/lib/schemas";
import { requireCustomer } from "@/lib/session";
import { vatKobo } from "@/lib/money";
import { calculateWaitMinutes } from "@/lib/wait-time";

const ORDERS_PER_WINDOW = 5;
const ORDER_WINDOW_MINUTES = 10;
const MAX_UNITS_PER_ITEM = 20;

// Places an order. The body carries menu item ids, quantities and a table number and
// nothing else: the strict schema rejects any other key, so a posted price never gets
// as far as this code. Unit prices, subtotals, the total and the wait time are all read
// or computed from the database, and price and prep time are snapshotted onto each line
// so a later menu edit cannot rewrite this order.
export function POST(request: Request) {
  return handle(async () => {
    const customer = await requireCustomer();
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(orderCreateSchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);
    const { tableNo, items } = parsed.data;

    await assertUnderLimit("orders", ORDERS_PER_WINDOW, ORDER_WINDOW_MINUTES, () =>
      prisma.order.count({
        where: { customerId: customer.id, placedAt: { gte: windowStart(ORDER_WINDOW_MINUTES) } },
      }),
    );

    // Merge repeated ids so the same dish twice on the ticket is one line with quantity 2.
    const wanted = new Map<string, number>();
    for (const line of items) {
      const quantity = (wanted.get(line.menuItemId) ?? 0) + line.quantity;
      if (quantity > MAX_UNITS_PER_ITEM) {
        throw new HttpError(400, `That is more than ${MAX_UNITS_PER_ITEM} of one item. Split it into a second order.`);
      }
      wanted.set(line.menuItemId, quantity);
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: [...wanted.keys()] }, available: true },
    });
    if (menuItems.length !== wanted.size) {
      const found = new Set(menuItems.map((m) => m.id));
      const missing = [...wanted.keys()].filter((id) => !found.has(id));
      throw new HttpError(400, `Not on the menu right now: ${missing.join(", ")}. Reload the menu and order again.`);
    }

    // Lines in the order the guest added them, which is the order they read back in.
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    const lines = [...wanted.keys()].map((id) => {
      const menuItem = byId.get(id)!;
      const quantity = wanted.get(menuItem.id) ?? 0;
      return {
        menuItemId: menuItem.id,
        quantity,
        unitPriceKobo: menuItem.priceKobo,
        subtotalKobo: menuItem.priceKobo * quantity,
        prepTimeMinutes: menuItem.prepTimeMinutes,
      };
    });
    // The total carries VAT at 7.5%, rounded to whole naira. Subtotal and VAT are read
    // back from the lines and the total; nothing is stored twice.
    const subtotalKobo = lines.reduce((sum, line) => sum + line.subtotalKobo, 0);
    const totalKobo = subtotalKobo + vatKobo(subtotalKobo);
    const waitMinutes = calculateWaitMinutes(lines);

    // The reference is a sequential order number from 1001, shown as "#1042". Two orders
    // placed in the same instant can pick the same number; the unique constraint catches
    // it and the insert is retried with a fresh count.
    for (let attempt = 0; attempt < 5; attempt++) {
      const reference = String(1001 + (await prisma.order.count()));
      try {
        const order = await prisma.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              reference,
              tableNo,
              waitMinutes,
              totalKobo,
              customerId: customer.id,
              items: { create: lines },
            },
            include: orderInclude,
          });
          await tx.customer.update({ where: { id: customer.id }, data: { tableNo } });
          return created;
        });
        return NextResponse.json(presentOrder(order), { status: 201 });
      } catch (error) {
        const collision =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!collision) throw error;
      }
    }
    throw new HttpError(503, "The kitchen is busy right now. Try placing the order again.");
  });
}
