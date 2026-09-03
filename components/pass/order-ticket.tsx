"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { SerializedOrder as Order } from "@/lib/orders";
import { clock, computeHeat } from "./heat";
import { Lamp } from "./lamp";
import { useNow } from "../use-now";
import { usePrefersReducedMotion } from "./use-reduced-motion";

async function fetcher(url: string): Promise<Order> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The ticket could not be loaded.");
  }
  return response.json();
}

function at(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// The customer's order is a ticket on a spike under its own lamp, and the lamp is the
// clock. The heat computed every second sets --heat on this screen, which the
// stylesheet turns into the pool's colour and opacity and the paper's tone, so the
// whole screen cools as the order runs late. The pool also shrinks as the promised
// minutes are used. Polls every three seconds so served and paid arrive by themselves.
export function OrderTicket({ initial, children }: { initial: Order; children?: (order: Order, refresh: () => void, state: string) => React.ReactNode }) {
  const { data, error, mutate } = useSWR<Order>(`/api/orders/${initial.id}`, fetcher, { refreshInterval: 3000, fallbackData: initial });
  const order = data ?? initial;
  const now = useNow();
  const reduce = usePrefersReducedMotion();
  const { state, heat, reach, elapsedSeconds, promisedSeconds } = computeHeat(order.status, order.placedAt, order.waitMinutes, now, reduce);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const when = (iso: string | null) => (mounted && iso ? ` at ${at(iso)}` : "");

  const digits =
    now === null ? "--:--" : state === "waiting" ? clock(Math.max(0, promisedSeconds - elapsedSeconds)) : state === "late" ? `+${clock(elapsedSeconds - promisedSeconds)}` : state === "served" ? "Served" : "Paid";
  const caption =
    state === "waiting"
      ? `of ${order.waitMinutes} minutes promised`
      : state === "late"
        ? `past the ${order.waitMinutes} minutes promised`
        : state === "served"
          ? "off the pass"
          : "settled";

  return (
    <main
      className="heat relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8"
      style={{ ["--heat" as string]: heat.toFixed(3) }}
      data-state={state}
      aria-label={`Order ${order.reference}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
        <div className="lamp -mt-[3px]">
          <Lamp seed={9} width={340} reach={reach} />
        </div>
      </div>

      <article className="ticket paper torn-both relative mx-auto mt-[250px] max-w-lg px-6 pb-4 sm:px-8">
        <svg className="absolute left-1/2 top-3 -translate-x-1/2" width="28" height="44" viewBox="0 0 28 44" aria-hidden="true">
          <circle cx="14" cy="14" r="6" fill="var(--steel)" stroke="var(--ink)" strokeWidth="2" />
          <rect x="12" y="0" width="4" height="30" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="1" />
          <circle cx="14" cy="2" r="3" fill="var(--brass-light)" />
        </svg>

        <div className="mt-6 flex items-baseline justify-between gap-4 border-b-2 border-dashed border-ink pb-2">
          <h1 className="display-print text-2xl">{order.reference}</h1>
          <span className="text-sm font-bold">TABLE {order.tableNo}</span>
        </div>

        <figure className="pt-5 text-center" aria-label={`${digits} ${caption}`}>
          <p className={`display tabular text-[clamp(3.8rem,13vw,6.8rem)] leading-none ${state === "late" ? "text-char-ink" : state === "served" || state === "paid" ? "text-served-ink" : "text-ink"}`}>
            {digits}
          </p>
          <figcaption className="mt-2 text-sm text-ink-soft">{caption}</figcaption>
        </figure>

        <p className="mt-4 text-center text-sm text-ink-soft" aria-live="polite">
          {order.status === "PLACED"
            ? `Placed${when(order.placedAt)}. The kitchen promised ${order.waitMinutes} minutes.`
            : order.status === "SERVED"
              ? `Served${when(order.servedAt)}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.`
              : `Paid${when(order.paidAt)}.`}
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-center text-sm font-bold text-char-ink">
            {error.message} The ticket keeps trying.
          </p>
        ) : null}

        <ul className="mt-5 border-y-2 border-dashed border-ink py-2 text-sm" aria-label="Lines">
          {order.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 py-0.5">
              <span>
                {line.name} <span className="font-bold text-char-ink">x{line.quantity}</span>
              </span>
              <span className="tabular">{line.subtotal.replace("₦", "")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between text-base font-bold">
          <span>TOTAL</span>
          <span className="tabular">{order.total}</span>
        </p>

        {children ? children(order, () => void mutate(), state) : null}
      </article>
    </main>
  );
}
