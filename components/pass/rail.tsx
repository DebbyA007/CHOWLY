"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { createDraggable, createScope } from "animejs";
import { play } from "@/lib/sound";
import { useStaffPin } from "../staff-pin";
import { ServeDialog, type Staff } from "./serve-dialog";
import { SpikeTicket, type RailOrder } from "./spike-ticket";
import { usePrefersReducedMotion } from "./use-reduced-motion";

type Scope = ReturnType<typeof createScope>;
type Rail = { now: string; orders: RailOrder[]; staff: Staff };

// The pass from the kitchen side. Two brass rails: tickets on the pass, each under its
// own lamp taking its own heat, and below them the served rail. Polls every three
// seconds. A ticket can be pulled down off the top rail; released past the served rail
// it opens the serving dialog and springs back on release either way. The button on
// every ticket and Enter or Space on a focused ticket open the same dialog, so the drag
// is never the only way.
export function Rail() {
  const { pin, setPin } = useStaffPin();
  const reduce = usePrefersReducedMotion();
  const [serving, setServing] = useState<RailOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const servedRef = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const openRef = useRef<(order: RailOrder) => void>(() => {});
  const placedRef = useRef<RailOrder[]>([]);

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
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  openRef.current = (order) => setServing(order);
  placedRef.current = placed;
  const placedIds = placed.map((order) => order.id).join(",");

  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    scope.current = createScope({ root: railRef, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      // Not created at all under reduced motion; the button and keyboard carry the action.
      if (self?.matches.reduceMotion) return;
      top.querySelectorAll<HTMLElement>(".spike-slot").forEach((element) => {
        // The ticket's bounds are its own resting spot on the spike: any pull meets
        // friction and springs back on release. A deliberate pull, 120px of actual
        // travel downward, opens the serving dialog.
        createDraggable(element, {
          container: [0, 0, 0, 0],
          x: false,
          y: true,
          containerFriction: 0.35,
          releaseStiffness: 170,
          releaseDamping: 15,
          dragThreshold: 6,
          onRelease: (draggable) => {
            if (draggable.y > 120) {
              const order = placedRef.current.find((candidate) => candidate.id === element.dataset.orderId);
              if (order) openRef.current(order);
            }
          },
        });
      });
    });
    return () => scope.current?.revert();
  }, [placedIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!pin) return null;

  return (
    <div ref={railRef}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="display text-4xl text-brass-light sm:text-5xl">The pass</h1>
        <p className="text-sm text-paper/80" aria-live="polite">
          {toast ?? (data ? "Updates every 3 seconds." : "Opening the pass.")}
        </p>
      </div>
      {error ? (
        <p role="alert" className="mb-4 text-sm font-bold" style={{ color: "var(--lamp-warm)" }}>
          {error.message} The rail keeps trying.
        </p>
      ) : null}

      <section aria-labelledby="pass-head">
        <div className="flex items-baseline justify-between px-1 pb-2">
          <h2 id="pass-head" className="text-sm font-bold text-brass-light">
            ON THE PASS <span className="tabular text-paper/60">{placed.length}</span>
          </h2>
          <p className="text-xs text-paper/60">pull a ticket down to serve it, or use its button</p>
        </div>
        <div className="brass-bar h-[18px]" />
        <div ref={topRef} className="relative -mt-[3px] flex min-h-[420px] gap-6 overflow-x-auto px-1 pb-8">
          {data && placed.length === 0 ? (
            <div className="paper torn-bottom mt-[118px] w-[300px] shrink-0 px-4 pt-6">
              <p className="display-print text-xl">Nothing on the pass</p>
              <p className="mt-1 text-sm text-ink-soft">Orders fired from the menu hang here within a few seconds.</p>
            </div>
          ) : null}
          {placed.map((order) => (
            <div
              key={order.id}
              data-order-id={order.id}
              className="spike-slot cursor-grab"
              tabIndex={0}
              role="button"
              aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or pull down to the served rail.`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setServing(order);
                }
              }}
            >
              <SpikeTicket order={order} now={now} reduce={reduce} onServe={setServing} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="served-head" className="mt-6">
        <div className="flex items-baseline justify-between px-1 pb-2">
          <h2 id="served-head" className="text-sm font-bold text-brass-light">
            SERVED <span className="tabular text-paper/60">{served.length}</span>
          </h2>
          <p className="text-xs text-paper/60">off the pass, waiting to be settled</p>
        </div>
        <div className="brass-bar h-[18px]" />
        <div ref={servedRef} className="-mt-[3px] flex min-h-[220px] gap-6 overflow-x-auto px-1 pb-8">
          {served.length === 0 ? <p className="mt-[118px] text-sm text-paper/60">Nothing served yet.</p> : null}
          {served.map((order) => (
            <SpikeTicket key={order.id} order={order} now={now} reduce={reduce} />
          ))}
        </div>
      </section>

      {data ? (
        <ServeDialog
          order={serving}
          staff={data.staff}
          pin={pin}
          onClose={() => setServing(null)}
          onServed={(updated) => {
            setServing(null);
            void play("spike");
            setToast(`${updated.reference} served`);
            void mutate((current) => (current ? { ...current, orders: current.orders.map((order) => (order.id === updated.id ? updated : order)) } : current), { revalidate: true });
          }}
        />
      ) : null}
    </div>
  );
}
