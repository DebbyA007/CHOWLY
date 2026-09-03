"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { SerializedOrder as Order } from "@/lib/orders";
import { ComplaintForm } from "./complaint-form";
import { CountdownRing, ringState } from "./countdown-ring";
import { RatingControl } from "./rating-control";
import { useNow } from "./use-now";

// The customer's own order. Polls every three seconds so the ring settles to leaf the
// moment the waiter marks it served, without a refresh. The initial order comes from
// the server render, so there is never an empty first paint.
async function fetcher(url: string): Promise<Order> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The order could not be loaded.");
  }
  return response.json();
}

function at(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function OrderView({ initial }: { initial: Order }) {
  const { data, error, mutate } = useSWR<Order>(`/api/orders/${initial.id}`, fetcher, {
    refreshInterval: 3000,
    fallbackData: initial,
  });
  const order = data ?? initial;

  // Clock times depend on the browser's locale and timezone, which the server cannot
  // know, so they render only after mount. The sentence still reads without them.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const when = (iso: string | null) => (mounted && iso ? ` at ${at(iso)}` : "");

  // The complaint entry point appears only once the ring has crossed: still waiting past
  // the promised time, or served after it. Same rule as the server.
  const now = useNow();
  const dueMs = new Date(order.dueAt).getTime();
  const servedLate = order.servedAt !== null && new Date(order.servedAt).getTime() > dueMs;
  const late = now !== null && (ringState(order.status, order.placedAt, order.waitMinutes, now) === "late" || servedLate);
  const lateBySeconds = now === null ? 0 : Math.max(0, Math.floor(((order.servedAt ? new Date(order.servedAt).getTime() : now) - dueMs) / 1000));
  const lateBy = `${Math.floor(lateBySeconds / 60)} min ${lateBySeconds % 60} s`;

  return (
    <div className="mx-auto max-w-2xl">
      <section className="enamel speckle-chalk plate px-6 py-8 sm:px-10 sm:py-10" aria-labelledby="order-title">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 id="order-title" className="display-tight text-3xl">
            Order {order.reference}
          </h1>
          <p className="text-ink-soft">Table {order.tableNo}</p>
        </div>

        <div className="my-8 flex justify-center">
          <CountdownRing placedAt={order.placedAt} waitMinutes={order.waitMinutes} status={order.status} />
        </div>

        <p className="text-center text-ink-soft" aria-live="polite">
          {order.status === "PLACED"
            ? `Placed${when(order.placedAt)}. The kitchen promised ${order.waitMinutes} minutes.`
            : order.status === "SERVED"
              ? `Served${when(order.servedAt)}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.`
              : `Paid${when(order.paidAt)}.`}
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-center text-sm text-pepper">
            {error.message} The view will keep trying.
          </p>
        ) : null}

        <ul className="mt-8 divide-y divide-rim/20 border-y border-rim/20" aria-label="Items">
          {order.items.map((line) => (
            <li key={line.id} className="flex items-baseline justify-between gap-4 py-2.5">
              <span>
                {line.name}
                <span className="tabular text-ink-soft"> x{line.quantity}</span>
              </span>
              <span className="tabular">{line.subtotal}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-baseline justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="tabular">{order.total}</span>
        </p>

        {late ? (
          <ComplaintForm
            orderId={order.id}
            waitMinutes={order.waitMinutes}
            lateBy={lateBy}
            complaints={order.complaints}
            onSent={() => void mutate()}
          />
        ) : null}
        <RatingControl key={order.rating?.score ?? "none"} orderId={order.id} current={order.rating} onSaved={() => void mutate()} />
      </section>
    </div>
  );
}
