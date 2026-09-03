"use client";

import type { FormEvent } from "react";
import type { CartLine } from "@/lib/cart";
import { formatNaira } from "@/lib/money";

export type PlacedTicket = { id: string; reference: string; waitMinutes: number; total: string };

type Props = {
  lines: CartLine[];
  count: number;
  totalKobo: number;
  tableNo: string;
  onTableNo: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string | null;
  placed: PlacedTicket | null;
};

// The tray along the bottom edge of the table. It always shows the badge, so an added
// item has somewhere to land, and it says what to do when it is empty.
export function CartTray({ lines, count, totalKobo, tableNo, onTableNo, onSubmit, submitting, error, placed }: Props) {
  const summary = lines.map((line) => `${line.item.name} x${line.quantity}`).join(", ");
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-8">
      <div className="relative mx-auto max-w-6xl">
        {placed ? (
          <div
            className="ticket-flight absolute inset-x-0 bottom-0 mx-auto w-72 bg-chalk p-4 text-ink"
            style={{
              opacity: 0,
              transformOrigin: "bottom center",
              borderRadius: "var(--radius-ticket)",
              border: "var(--rim-width) solid var(--rim)",
              borderTopStyle: "dashed",
            }}
            aria-live="polite"
          >
            <p className="display-tight text-xl">Order {placed.reference}</p>
            <p className="mt-1 text-sm text-ink-soft">Placed. The kitchen promised {placed.waitMinutes} minutes.</p>
            <p className="mt-2 tabular font-medium">{placed.total}</p>
          </div>
        ) : null}
        <form
          onSubmit={onSubmit}
          noValidate
          className="tray-body enamel speckle-chalk tray flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-5"
          style={{ transformOrigin: "bottom center" }}
          aria-label="Your order"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="cart-badge rim tabular inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-enamel-mid px-2 text-sm font-semibold text-chalk"
              aria-label={`${count} ${count === 1 ? "item" : "items"} on the tray`}
            >
              {count}
            </span>
            {count === 0 ? (
              <p className="text-sm text-ink-soft">Nothing on the tray yet. Add a dish to start an order.</p>
            ) : (
              <div className="min-w-0">
                <p className="font-medium">
                  {count} {count === 1 ? "item" : "items"}
                </p>
                <p className="max-w-[44ch] truncate text-sm text-ink-soft">{summary}</p>
              </div>
            )}
          </div>

          {count > 0 ? (
            <>
              <label className="flex items-center gap-2 text-sm font-medium">
                Table
                <input
                  value={tableNo}
                  onChange={(event) => onTableNo(event.target.value)}
                  inputMode="numeric"
                  maxLength={8}
                  required
                  aria-describedby="table-help"
                  className="stamp rim w-20 bg-chalk px-2.5 py-1.5 tabular"
                />
                <span id="table-help" className="sr-only">
                  The number printed on your table
                </span>
              </label>
              <div className="ml-auto flex items-center gap-4">
                <span className="tabular text-lg font-semibold">{formatNaira(totalKobo)}</span>
                <button
                  type="submit"
                  disabled={submitting || placed !== null}
                  className="stamp bg-enamel-mid px-4 py-2.5 font-medium text-chalk disabled:opacity-60"
                >
                  {placed ? "Placed" : submitting ? "Placing" : "Place order"}
                </button>
              </div>
            </>
          ) : null}

          {error ? (
            <p role="alert" className="basis-full text-sm text-pepper">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
