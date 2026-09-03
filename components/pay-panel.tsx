"use client";

import { useState } from "react";
import type { SerializedOrder } from "@/lib/orders";

type Method = "CARD" | "MOBILE_MONEY" | "CASH";

const methods: { value: Method; label: string }[] = [
  { value: "CARD", label: "Card" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CASH", label: "Cash" },
];

type Props = {
  order: SerializedOrder;
  onPaid: (updated: SerializedOrder) => void;
};

// Payment, shown once the order is served. It is pretend and says so on the button,
// because nothing about it should look like it is trying to pass for real. The amount
// is the order's stored total; the request carries the method and nothing else.
export function PayPanel({ order, onPaid }: Props) {
  const [method, setMethod] = useState<Method>("CARD");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}/pay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const body = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
      if (!response.ok || !body) {
        setError(body?.error ?? "The payment could not be recorded. Try again.");
        return;
      }
      onPaid(body);
    } catch {
      setError("The payment could not be recorded. Check the connection and try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="mt-8 border-t border-rim/20 pt-6" aria-labelledby="pay-title">
      <h2 id="pay-title" className="display-tight text-xl">
        Pay {order.total}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        This is a pretend payment for the demo. No money moves, and the record says so.
      </p>
      <div role="radiogroup" aria-label="Payment method" className="mt-4 flex flex-wrap gap-2">
        {methods.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={method === option.value}
            onClick={() => setMethod(option.value)}
            className={`stamp rim px-3.5 py-2 text-sm font-medium ${method === option.value ? "bg-enamel-mid text-chalk" : "bg-chalk text-ink"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-pepper">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={pay}
        disabled={paying}
        className="stamp mt-4 bg-leaf px-4 py-2.5 font-medium text-chalk disabled:opacity-60"
      >
        {paying ? "Paying" : "Pay now (pretend)"}
      </button>
    </section>
  );
}
