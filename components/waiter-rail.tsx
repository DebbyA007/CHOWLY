"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { createDraggable, createScope } from "animejs";
import { AssignDialog, type Staff } from "./assign-dialog";
import { useStaffPin } from "./staff-pin";
import { Ticket, type RailOrder } from "./ticket";

type Scope = ReturnType<typeof createScope>;
type Rail = { now: string; orders: RailOrder[]; staff: Staff };

// The ticket rail. Polls every three seconds. A placed ticket can be dragged toward the
// served column and springs back on release; dropping it far enough opens the
// assignment dialog. The button on every ticket, and Enter or Space on a focused ticket,
// open the same dialog, so the drag is never the only way.
export function WaiterRail() {
  const { pin, setPin } = useStaffPin();
  const [serving, setServing] = useState<RailOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const placedRef = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const servingRef = useRef<(order: RailOrder) => void>(() => {});

  const { data, error, mutate } = useSWR<Rail>(
    pin ? ["/api/waiter/orders", pin] : null,
    async ([url, staffPin]: [string, string]) => {
      const response = await fetch(url, { headers: { "x-staff-pin": staffPin } });
      if (response.status === 401) {
        setPin(null);
        throw new Error("The PIN was no longer accepted.");
      }
      if (!response.ok) throw new Error("The rail could not be loaded.");
      return response.json();
    },
    { refreshInterval: 3000 },
  );

  const orders = data?.orders ?? [];
  const placed = orders.filter((order) => order.status === "PLACED");
  const served = orders.filter((order) => order.status === "SERVED");
  const now = data ? new Date(data.now).getTime() : Date.now();
  const placedIds = placed.map((order) => order.id).join(",");

  servingRef.current = (order) => setServing(order);

  useEffect(() => {
    const column = placedRef.current;
    if (!column) return;
    scope.current = createScope({
      root: railRef,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion)" },
    }).add((self) => {
      // Drag is a convenience on top of the button and the keyboard. With reduced motion
      // on it is not created at all, and the other two paths carry the action.
      if (self?.matches.reduceMotion) return;
      const tickets = column.querySelectorAll<HTMLElement>(".ticket-slot");
      tickets.forEach((element) => {
        createDraggable(element, {
          container: column,
          x: true,
          y: false,
          containerFriction: 0.35,
          releaseStiffness: 180,
          releaseDamping: 15,
          dragThreshold: 6,
          onRelease: (draggable) => {
            if (draggable.x > column.offsetWidth * 0.45) {
              const id = element.dataset.orderId;
              const order = placed.find((candidate) => candidate.id === id);
              if (order) servingRef.current(order);
            }
          },
        });
      });
    });
    return () => scope.current?.revert();
    // Re-created when the set of placed tickets changes, so new tickets are draggable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!pin) return null;

  return (
    <div ref={railRef}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="display-tight text-3xl">Ticket rail</h1>
        <p className="text-sm text-chalk/70" aria-live="polite">
          {toast ?? (data ? "Updates every 3 seconds." : "Loading the rail.")}
        </p>
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-chalk">
          {error.message} The rail keeps trying.
        </p>
      ) : null}

      {data && orders.length === 0 ? (
        <div className="enamel speckle-chalk tray max-w-md p-6">
          <p className="display-tight text-xl">No tickets on the rail</p>
          <p className="mt-1 text-sm text-ink-soft">
            Orders placed from the menu appear here within a few seconds.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="placed-head">
          <h2 id="placed-head" className="display-tight mb-3 text-xl">
            Placed <span className="tabular text-chalk/60">{placed.length}</span>
          </h2>
          <div ref={placedRef} className="flex flex-col gap-4">
            {placed.map((order) => (
              <div
                key={order.id}
                data-order-id={order.id}
                className="ticket-slot cursor-grab focus-visible:outline-3 focus-visible:outline-flame"
                tabIndex={0}
                role="button"
                aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or drag to the served column.`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setServing(order);
                  }
                }}
              >
                <Ticket order={order} now={now} onServe={setServing} />
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="served-head">
          <h2 id="served-head" className="display-tight mb-3 text-xl">
            Served <span className="tabular text-chalk/60">{served.length}</span>
          </h2>
          <div className="flex min-h-32 flex-col gap-4 rounded-[var(--radius-tray)] border border-dashed border-chalk/30 p-3">
            {served.length === 0 ? (
              <p className="p-2 text-sm text-chalk/60">Drop a ticket here, or use its button.</p>
            ) : null}
            {served.map((order) => (
              <Ticket key={order.id} order={order} now={now} />
            ))}
          </div>
        </section>
      </div>

      {data ? (
        <AssignDialog
          order={serving}
          staff={data.staff}
          pin={pin}
          onClose={() => setServing(null)}
          onServed={(updated) => {
            setServing(null);
            setToast(`${updated.reference} served`);
            // The PATCH already returned the served order, so the ticket moves now and
            // the next poll only confirms it.
            void mutate(
              (current) =>
                current
                  ? { ...current, orders: current.orders.map((order) => (order.id === updated.id ? updated : order)) }
                  : current,
              { revalidate: true },
            );
          }}
        />
      ) : null}
    </div>
  );
}
