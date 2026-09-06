import type { Prisma } from "@prisma/client";
import { formatNaira } from "./money";
import { prisma } from "./prisma";
import { canCancel, cancelDeadline, dueAt, isOrderDelayed } from "./wait-time";

// Everything a route returns about an order, in one shape. Delay is derived here at read
// time from placedAt and waitMinutes (delta 4), never read from a column.
export const orderInclude = {
  items: { include: { menuItem: { select: { name: true, station: true } } }, orderBy: { id: "asc" } },
  waiter: { select: { id: true, name: true } },
  chef: { select: { id: true, name: true } },
  bartender: { select: { id: true, name: true } },
  payment: true,
  rating: true,
  complaints: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function presentOrder(order: OrderWithRelations, now: Date = new Date()) {
  const subtotalKobo = order.items.reduce((sum, line) => sum + line.subtotalKobo, 0);
  // DELTA 12: an order needs a chef only if something on it is cooked and a bartender
  // only if something on it is mixed. Still and sparkling water are poured, so a
  // water-only order records the waiter and nobody else. The original ERD gave every
  // order all three, which asks the waiter to name a chef who never touched it.
  const needsChef = order.items.some((line) => line.menuItem.station === "KITCHEN");
  const needsBartender = order.items.some((line) => line.menuItem.station === "BAR");
  // What the guest is waiting on, which decides the vessel the order screen draws. A
  // mixed order counts as food: the drink is usually down long before the kitchen is.
  const kind: "food" | "drinks" = needsChef ? "food" : "drinks";
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    tableNo: order.tableNo,
    kind,
    placedAt: order.placedAt,
    waitMinutes: order.waitMinutes,
    dueAt: dueAt(order),
    isDelayed: isOrderDelayed(order, now),
    servedAt: order.servedAt,
    paidAt: order.paidAt,
    cancelledAt: order.cancelledAt,
    // DELTA 13: when the guest's own window to cancel closes, and whether it is still
    // open at this instant. The screen counts down to the first and hides the button on
    // the second; the endpoint checks the same thing again when the tap arrives.
    cancel: { until: cancelDeadline(order), open: canCancel(order, now) },
    subtotalKobo,
    subtotal: formatNaira(subtotalKobo),
    vatKobo: order.totalKobo - subtotalKobo,
    vat: formatNaira(order.totalKobo - subtotalKobo),
    totalKobo: order.totalKobo,
    total: formatNaira(order.totalKobo),
    items: order.items.map((line) => ({
      id: line.id,
      menuItemId: line.menuItemId,
      name: line.menuItem.name,
      quantity: line.quantity,
      unitPriceKobo: line.unitPriceKobo,
      unitPrice: formatNaira(line.unitPriceKobo),
      subtotalKobo: line.subtotalKobo,
      subtotal: formatNaira(line.subtotalKobo),
      prepTimeMinutes: line.prepTimeMinutes,
    })),
    needs: { chef: needsChef, bartender: needsBartender },
    staff: {
      waiter: order.waiter,
      chef: order.chef,
      bartender: order.bartender,
    },
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          amountKobo: order.payment.amountKobo,
          amount: formatNaira(order.payment.amountKobo),
          isPretend: order.payment.isPretend,
          paidAt: order.payment.paidAt,
        }
      : null,
    rating: order.rating ? { score: order.rating.score, comment: order.rating.comment } : null,
    complaints: order.complaints.map((c) => ({ id: c.id, description: c.description, createdAt: c.createdAt })),
  };
}

export type PresentedOrder = ReturnType<typeof presentOrder>;

// The receipt number is the payment's place in the sequence of payments, four digits.
export async function receiptNumber(paidAt: Date): Promise<string> {
  const before = await prisma.payment.count({ where: { paidAt: { lte: paidAt } } });
  return String(before).padStart(4, "0");
}

// An order with its receipt number filled in, for the routes that return a paid order.
export async function presentWithReceipt(order: OrderWithRelations, now: Date = new Date()) {
  const presented = presentOrder(order, now);
  if (!order.payment) return presented;
  return { ...presented, payment: { ...presented.payment!, receiptNo: await receiptNumber(order.payment.paidAt) } };
}

// The same shape after a JSON round trip, which is what every client component
// receives: every Date is an ISO string.
export type SerializedOrder = Omit<PresentedOrder, "placedAt" | "dueAt" | "servedAt" | "paidAt" | "cancelledAt" | "cancel" | "complaints" | "payment"> & {
  placedAt: string;
  dueAt: string;
  servedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancel: { until: string; open: boolean };
  complaints: { id: string; description: string; createdAt: string }[];
  payment: (Omit<NonNullable<PresentedOrder["payment"]>, "paidAt"> & { paidAt: string; receiptNo?: string }) | null;
};
