"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { play } from "@/lib/sound";

type Scope = ReturnType<typeof createScope>;
type Method = "CARD" | "MOBILE_MONEY" | "CASH";
const methods: { value: Method; label: string }[] = [
  { value: "CARD", label: "Card" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CASH", label: "Cash" },
];
const methodLabel = { CARD: "card", MOBILE_MONEY: "mobile money", CASH: "cash" } as const;

// Settling the ticket, shown once the order is served. Pretend, and it says so on the
// button, because nothing about it should look like it is trying to pass for real. The
// request carries the method and nothing else; the amount is the stored total.
export function SettlePanel({ order, onPaid }: { order: SerializedOrder; onPaid: (updated: SerializedOrder) => void }) {
  const [method, setMethod] = useState<Method>("CARD");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}/pay`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ method }) });
      const body = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
      if (!response.ok || !body) {
        setError(body?.error ?? "The ticket could not be settled. Try again.");
        return;
      }
      onPaid(body);
    } catch {
      setError("The ticket could not be settled. Check the connection and try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="mt-6 border-t-2 border-dashed border-ink pt-4" aria-labelledby="settle-title">
      <h2 id="settle-title" className="text-base font-bold">
        SETTLE {order.total}
      </h2>
      <p className="mt-1 text-xs text-ink-soft">Pretend payment for the demo. No money moves, and the record says so.</p>
      <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
        {methods.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={method === option.value}
            onClick={() => setMethod(option.value)}
            className={`border-2 px-3 py-1.5 text-sm font-bold ${method === option.value ? "border-soot bg-soot text-paper" : "border-ink bg-paper text-ink"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-bold text-char-ink">
          {error}
        </p>
      ) : null}
      <button type="button" onClick={pay} disabled={paying} className="stamp-button mt-3 bg-served-ink px-4 py-2.5 text-paper">
        {paying ? "Settling" : "Settle the ticket (pretend)"}
      </button>
    </section>
  );
}

// The receipt: a second ticket that prints and tears off below the first, with the
// lines, the total from the payment row, the method, and the word pretend where a
// person will read it. The PAID stamp lands once, on the payment that just happened,
// and the lamp above has already gone out. On a later visit the stamp is simply there.
export function Receipt({ order, justPaid }: { order: SerializedOrder; justPaid: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const payment = order.payment;

  useEffect(() => {
    if (!justPaid) return;
    // the thud lands with the stamp, after the receipt has fed out
    const thud = window.setTimeout(() => void play("stamp"), 540);
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate([".receipt", ".paid-stamp"], { opacity: [0, 1], duration: 200 });
        return;
      }
      createTimeline()
        // the receipt feeds out of the ticket's foot
        .add(".receipt", { opacity: [0, 1], y: [-26, 0], duration: 420, ease: "outQuad" })
        // the stamp comes down once
        .add(".paid-stamp", { opacity: [0, 1], scale: [1.9, 1], rotate: [-16, -9], duration: 380, ease: "outBack(2)" }, "+=120");
    });
    return () => {
      window.clearTimeout(thud);
      scope.current?.revert();
    };
  }, [justPaid]);

  if (!payment) return null;

  return (
    <div ref={root}>
      <section className="receipt paper torn-both relative mx-auto -mt-2 max-w-lg px-6 pb-4 sm:px-8" style={{ opacity: justPaid ? 0 : 1 }} aria-labelledby="receipt-title">
        <span
          className="paid-stamp pointer-events-none absolute right-6 top-8 border-[3px] border-char px-2 py-0.5 text-2xl font-bold text-char"
          style={{ transform: "rotate(-9deg)", opacity: justPaid ? 0 : 1, borderRadius: 4 }}
          aria-hidden="true"
        >
          PAID
        </span>
        <div className="mt-5 flex items-baseline justify-between border-b-2 border-dashed border-ink pb-2">
          <h2 id="receipt-title" className="text-base font-bold">
            RECEIPT
          </h2>
          <span className="text-xs text-ink-soft">
            {order.reference}, table {order.tableNo}
          </span>
        </div>
        <ul className="py-2 text-sm">
          {order.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 py-0.5">
              <span>
                {line.name} <span className="font-bold text-char-ink">x{line.quantity}</span>
              </span>
              <span className="tabular">{line.subtotal.replace("₦", "")}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t-2 border-dashed border-ink pt-2 font-bold">
          <span>TOTAL</span>
          <span className="tabular">{payment.amount}</span>
        </p>
        <p className="mt-3 text-xs text-ink-soft">Paid by {methodLabel[payment.method]}.</p>
        <p className="mt-1 text-sm font-bold text-char-ink">{payment.isPretend ? "PRETEND PAYMENT. No money moved, and the record is marked pretend." : "Payment recorded."}</p>
        <p className="mt-3 text-xs text-ink-soft">Thank you for eating with us. The lamp is off.</p>
      </section>
    </div>
  );
}
