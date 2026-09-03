"use client";

import { useEffect, useRef } from "react";
import { animate, createScope } from "animejs";
import type { SerializedOrder } from "@/lib/orders";

type Scope = ReturnType<typeof createScope>;

const methodLabel = { CARD: "card", MOBILE_MONEY: "mobile money", CASH: "cash" } as const;

type Props = {
  order: SerializedOrder;
  justPaid: boolean;
};

// The receipt: a paper ticket with the lines, the total, how and when it was paid, and
// the word pretend where a person will read it. The PAID stamp lands once, on the
// payment that just happened; on a later visit it is simply there.
export function Receipt({ order, justPaid }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const payment = order.payment;

  useEffect(() => {
    if (!justPaid) return;
    scope.current = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion)" },
    }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate(".paid-stamp", { opacity: [0, 1], duration: 200 });
        return;
      }
      animate(".paid-stamp", {
        opacity: [0, 1],
        scale: [1.8, 1],
        rotate: [-14, -8],
        duration: 420,
        ease: "outBack(2)",
      });
    });
    return () => scope.current?.revert();
  }, [justPaid]);

  if (!payment) return null;

  return (
    <div ref={root} className="mt-8 border-t border-rim/20 pt-6">
      <section
        className="relative mx-auto max-w-sm bg-chalk p-5 text-ink"
        style={{
          borderRadius: "var(--radius-ticket)",
          border: "var(--rim-width) solid var(--rim)",
          borderTopStyle: "dashed",
          borderBottomStyle: "dashed",
        }}
        aria-labelledby="receipt-title"
      >
        <span
          className="paid-stamp pointer-events-none absolute right-4 top-4 rounded-md border-[3px] border-leaf px-2 py-0.5 text-lg font-bold uppercase text-leaf"
          style={{ transform: "rotate(-8deg)", opacity: justPaid ? 0 : 1 }}
          aria-hidden="true"
        >
          Paid
        </span>
        <h2 id="receipt-title" className="display-tight text-xl">
          Receipt
        </h2>
        <p className="text-sm text-ink-soft">
          {order.reference}, table {order.tableNo}
        </p>
        <ul className="mt-4 divide-y divide-rim/20 border-y border-rim/20 text-sm">
          {order.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 py-1.5">
              <span>
                {line.name} <span className="tabular text-ink-soft">x{line.quantity}</span>
              </span>
              <span className="tabular">{line.subtotal}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span className="tabular">{payment.amount}</span>
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Paid by {methodLabel[payment.method]}.
        </p>
        <p className="mt-1 text-sm font-medium text-pepper">
          {payment.isPretend ? "Pretend payment. No money moved, and the record is marked pretend." : "Payment recorded."}
        </p>
      </section>
    </div>
  );
}
