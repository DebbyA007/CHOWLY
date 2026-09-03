"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SerializedOrder } from "@/lib/orders";
import { computeHeat, clock } from "@/components/pass/heat";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Dish } from "../shared/dishes";
import { attachServeDrag } from "../shared/serve-drag";
import { useRail } from "../shared/use-rail";
import { LINEN_PALETTE, LinenFrame } from "./frame";

// The floor: the waiter's pad, a ruled sheet with one entry per order. Each entry sits
// in its own light, so a late table is in the shade. Pull an entry to the right, press
// Enter on it, or use its button: all three open the same card.
export function LinenFloor() {
  const rail = useRail();
  const reduce = usePrefersReducedMotion();
  const [serving, setServing] = useState<SerializedOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const placedRef = useRef(rail.placed);
  placedRef.current = rail.placed;
  const ids = rail.placed.map((o) => o.id).join(",");

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    return attachServeDrag(el, ".entry", "x", (element) => {
      const order = placedRef.current.find((o) => o.id === element.dataset.orderId);
      if (order) setServing(order);
    });
  }, [ids]);
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (serving && !d.open) d.showModal();
    if (!serving && d.open) d.close();
  }, [serving]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!serving) return;
    const f = new FormData(e.currentTarget);
    setError(null);
    try {
      const updated = await rail.serve(serving.id, { waiterId: String(f.get("waiterId")), chefId: String(f.get("chefId")), bartenderId: String(f.get("bartenderId")) });
      setServing(null);
      setToast(`${updated.reference} served.`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const Entry = ({ order, actionable }: { order: SerializedOrder; actionable: boolean }) => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    return (
      <div className="relative overflow-hidden rounded-xl border border-[var(--thread)] px-3 py-3" style={{ background: `color-mix(in oklab, #fffdf8, #ebe6da ${((1 - h.heat) * 100).toFixed(0)}%)`, transition: "background-color 1000ms linear" }}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="serif text-xl italic">{order.reference}</span>
          <span className="text-[12px] font-bold">Table {order.tableNo}</span>
        </div>
        <div className="mt-1 flex items-center gap-1" aria-hidden="true">
          {order.items.slice(0, 4).map((l) => <Dish key={l.id} id={l.menuItemId} material="gouache" palette={LINEN_PALETTE} size={40} />)}
        </div>
        <ul className="mt-1 text-[13px]">{order.items.map((l) => <li key={l.id}>{l.name} <span className="text-[var(--ink-soft)]">x{l.quantity}</span></li>)}</ul>
        <p className="mt-2 text-[12px] tabular text-[var(--ink-soft)]">
          {order.status === "PLACED" ? (h.state === "late" ? `${clock(h.elapsedSeconds - h.promisedSeconds)} past the ${order.waitMinutes} promised, in the shade` : `${clock(Math.max(0, h.promisedSeconds - h.elapsedSeconds))} of ${order.waitMinutes} minutes`) : `Served by ${order.staff.waiter?.name ?? "the floor"}${order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}`}
          {order.complaints.length > 0 ? <span className="ml-2 font-bold" style={{ color: "var(--ink)" }}>{order.complaints.length} {order.complaints.length === 1 ? "word" : "words"} from the table</span> : null}
        </p>
        {actionable ? <button type="button" onClick={() => setServing(order)} className="btn mt-3 w-full text-[14px]">Served</button> : null}
      </div>
    );
  };

  return (
    <LinenFrame>
      <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="serif text-4xl italic">The floor</h1>
          <p className="text-[12px] text-[var(--ink-soft)]" aria-live="polite">{toast ?? (rail.data ? "Updates every 3 seconds." : "Opening the pad.")}</p>
        </div>
        {rail.error ? <p role="alert" className="mt-2 text-[13px] font-bold" style={{ color: "var(--tomato)" }}>{rail.error.message}</p> : null}
        <p className="mt-1 text-[13px] text-[var(--ink-soft)]">Pull an entry to the right to serve it, press Enter on it, or use its button.</p>

        <section className="mt-4" aria-labelledby="one-open">
          <h2 id="one-open" className="text-[12px] font-bold text-[var(--ink-soft)]">WAITING {rail.placed.length}</h2>
          <div ref={listRef} className="mt-2 flex flex-col gap-3">
            {rail.data && rail.placed.length === 0 ? <p className="stitched rounded-xl px-4 py-4 text-[14px]">No tables waiting. Orders from the card appear here within a few seconds.</p> : null}
            {rail.placed.map((order) => (
              <div key={order.id} data-order-id={order.id} className="entry cursor-grab" tabIndex={0} role="button" aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or pull to the right.`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServing(order); } }}>
                <Entry order={order} actionable />
              </div>
            ))}
          </div>
        </section>
        <section className="mt-6" aria-labelledby="one-served">
          <h2 id="one-served" className="text-[12px] font-bold text-[var(--ink-soft)]">SERVED {rail.served.length}</h2>
          <div className="mt-2 flex flex-col gap-3">
            {rail.served.length === 0 ? <p className="text-[13px] text-[var(--ink-soft)]">Nothing served yet.</p> : rail.served.map((order) => <Entry key={order.id} order={order} actionable={false} />)}
          </div>
        </section>
      </main>

      <dialog ref={dialogRef} onClose={() => setServing(null)} className="stitched m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-5 backdrop:bg-[#2b2a28]/60" aria-labelledby="one-serve">
        {serving && rail.staff ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h2 id="one-serve" className="serif text-2xl italic">Serve {serving.reference}, table {serving.tableNo}</h2>
            <p className="text-[13px] text-[var(--ink-soft)]">Who served, who cooked, who mixed.</p>
            {([["waiterId", "Waiter", rail.staff.waiters], ["chefId", "Chef", rail.staff.chefs], ["bartenderId", "Bartender", rail.staff.bartenders]] as const).map(([name, label, people]) => (
              <label key={name} className="flex flex-col gap-1 text-[13px] font-bold">
                {label}
                <select name={name} required defaultValue="" className="field font-normal">
                  <option value="" disabled>Choose</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            ))}
            {error ? <p role="alert" className="text-[13px] font-bold" style={{ color: "var(--tomato)" }}>{error}</p> : null}
            <div className="mt-1 flex justify-end gap-2">
              <button type="button" onClick={() => setServing(null)} className="btn quiet text-[14px]">Cancel</button>
              <button type="submit" className="btn text-[14px]">Mark served</button>
            </div>
          </form>
        ) : null}
      </dialog>
    </LinenFrame>
  );
}
