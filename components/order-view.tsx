"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { PresentedOrder } from "@/lib/orders";
import { CountdownRing } from "./countdown-ring";

// The customer's own order. Polls every three seconds so the ring settles to leaf the
// moment the waiter marks it served, without a refresh. The initial order comes from
// the server render, so there is never an empty first paint.
type Order = Omit<PresentedOrder, "placedAt" | "dueAt" | "servedAt" | "paidAt"> & {
  placedAt: string;
  dueAt: string;
  servedAt: string | null;
  paidAt: string | null;
};

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
  const { data, error } = useSWR<Order>(`/api/orders/${initial.id}`, fetcher, {
    refreshInterval: 3000,
    fallbackData: initial,
  });
  const order = data ?? initial;

  // Clock times depend on the browser's locale and timezone, which the server cannot
  // know, so they render only after mount. The sentence still reads without them.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const when = (iso: string | null) => (mounted && iso ? ` at ${at(iso)}` : "");

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
      </section>
    </div>
  );
}
