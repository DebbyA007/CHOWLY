import type { Prisma } from "@prisma/client";
import { formatNaira } from "./money";
import { dueAt, isOrderDelayed } from "./wait-time";

// Everything a route returns about an order, in one shape. Delay is derived here at read
// time from placedAt and waitMinutes (delta 4), never read from a column.
export const orderInclude = {
  items: { include: { menuItem: { select: { name: true } } }, orderBy: { subtotalKobo: "desc" } },
  waiter: { select: { id: true, name: true } },
  chef: { select: { id: true, name: true } },
  bartender: { select: { id: true, name: true } },
  payment: true,
  rating: true,
  complaints: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function presentOrder(order: OrderWithRelations, now: Date = new Date()) {
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    tableNo: order.tableNo,
    placedAt: order.placedAt,
    waitMinutes: order.waitMinutes,
    dueAt: dueAt(order),
    isDelayed: isOrderDelayed(order, now),
    servedAt: order.servedAt,
    paidAt: order.paidAt,
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

// The same shape after a JSON round trip, which is what every client component
// receives: every Date is an ISO string.
export type SerializedOrder = Omit<PresentedOrder, "placedAt" | "dueAt" | "servedAt" | "paidAt" | "complaints" | "payment"> & {
  placedAt: string;
  dueAt: string;
  servedAt: string | null;
  paidAt: string | null;
  complaints: { id: string; description: string; createdAt: string }[];
  payment: (Omit<NonNullable<PresentedOrder["payment"]>, "paidAt"> & { paidAt: string }) | null;
};
