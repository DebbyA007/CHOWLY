"use client";

import type { SerializedOrder } from "@/lib/orders";
import { ComplaintSlip } from "./complaint-slip";
import { OrderTicket } from "./order-ticket";
import { PunchRating } from "./punch-rating";

// The customer's order screen: the ticket under its lamp, and printed on the ticket the
// slips and punches that belong to it. The complaint slip prints only once the order is
// late: still waiting past the promise, or served after it. Same rule as the server.
export function OrderScreen({ initial }: { initial: SerializedOrder }) {
  return (
    <OrderTicket initial={initial}>
      {(order, refresh, state) => {
        const dueMs = new Date(order.dueAt).getTime();
        const servedLate = order.servedAt !== null && new Date(order.servedAt).getTime() > dueMs;
        const late = state === "late" || servedLate;
        const lateSeconds = Math.max(0, Math.floor(((order.servedAt ? new Date(order.servedAt).getTime() : Date.now()) - dueMs) / 1000));
        const lateBy = `${Math.floor(lateSeconds / 60)} min ${lateSeconds % 60} s`;
        return (
          <>
            {late ? <ComplaintSlip orderId={order.id} waitMinutes={order.waitMinutes} lateBy={lateBy} complaints={order.complaints} onSent={refresh} /> : null}
            <PunchRating key={order.rating?.score ?? "none"} orderId={order.id} current={order.rating} onSaved={refresh} />
          </>
        );
      }}
    </OrderTicket>
  );
}
