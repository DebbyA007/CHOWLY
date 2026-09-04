"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SerializedOrder } from "@/lib/orders";
import { computeHeat, clock } from "@/components/pass/heat";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Dish } from "@/components/walkthrough/dishes";
import { attachServeDrag } from "@/components/walkthrough/serve-drag";
import { useRail } from "@/components/walkthrough/use-rail";
import { BILL_PALETTE, BillFrame, Candle } from "./frame";

// The house book: one printed page per order, each with its own candle. Pull a page to
// the right, press Enter on it, or use its line: all three open the same form.
export function BillBook() {
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
  const Page = ({ order, actionable, folio }: { order: SerializedOrder; actionable: boolean; folio: number }) => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    return (
      <div className="rule-double flex gap-3 px-1 py-3" style={{ background: `color-mix(in oklab, var(--paper), var(--dim) ${((1 - h.heat) * 100).toFixed(0)}%)`, transition: "background-color 1000ms linear" }}>
        <div className="shrink-0"><Candle progress={h.heat} out={order.status !== "PLACED"} size={84} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2"><span className="ref garamond text-2xl">{order.reference}</span><span className="text-[13px] italic text-[var(--ink-soft)]">table {order.tableNo}, p. {folio}</span></div>
          <div className="mt-1 flex items-center gap-1" aria-hidden="true">{order.items.slice(0, 4).map((l) => <Dish key={l.id} id={l.menuItemId} material="ink" palette={BILL_PALETTE} size={34} />)}</div>
          <ul className="text-[14px]">{order.items.map((l) => <li key={l.id}>{l.name} <span className="italic text-[var(--ink-soft)]">x{l.quantity}</span></li>)}</ul>
          <p className="mt-1 text-[13px] italic text-[var(--ink-soft)]">
            {order.status === "PLACED" ? (h.state === "late" ? `${clock(h.elapsedSeconds - h.promisedSeconds)} past the ${order.waitMinutes} named; the candle is a stub` : `${clock(Math.max(0, h.promisedSeconds - h.elapsedSeconds))} of ${order.waitMinutes} minutes`) : `Served by ${order.staff.waiter?.name ?? "the house"}${order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}`}
            {order.complaints.length > 0 ? <span className="ml-2 font-bold not-italic" style={{ color: "var(--green)" }}>{order.complaints.length} {order.complaints.length === 1 ? "note" : "notes"} from the table</span> : null}
          </p>
          {actionable ? <button type="button" onClick={() => setServing(order)} className="ink-button mt-2 w-full">Served</button> : null}
        </div>
      </div>
    );
  };
  return (
    <BillFrame>
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="garamond misreg text-4xl italic">The house book</h1>
          <p className="text-[13px] italic text-[var(--ink-soft)]" aria-live="polite">{toast ?? (rail.data ? "Updates every 3 seconds." : "Opening the book.")}</p>
        </div>
        {rail.error ? <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: "var(--green)" }}>{rail.error.message}</p> : null}
        <p className="mt-1 text-[14px] italic text-[var(--ink-soft)]">Pull a page to the right to serve it, press Enter on it, or use its line.</p>
        <section className="mt-4" aria-labelledby="two-open">
          <h2 id="two-open" className="garamond text-xl">Waiting, {rail.placed.length}</h2>
          <div ref={listRef} className="mt-2 flex flex-col gap-3">
            {rail.data && rail.placed.length === 0 ? <p className="rule-double px-1 py-3 text-[15px] italic">No tables waiting. Orders from the card appear here within a few seconds.</p> : null}
            {rail.placed.map((order, i) => (
              <div key={order.id} data-order-id={order.id} className="entry cursor-grab" tabIndex={0} role="button" aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or pull to the right.`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServing(order); } }}>
                <Page order={order} actionable folio={i + 1} />
              </div>
            ))}
          </div>
        </section>
        <section className="mt-6" aria-labelledby="two-served">
          <h2 id="two-served" className="garamond text-xl">Served, {rail.served.length}</h2>
          <div className="mt-2 flex flex-col gap-3">{rail.served.length === 0 ? <p className="text-[14px] italic text-[var(--ink-soft)]">Nothing served yet.</p> : rail.served.map((order, i) => <Page key={order.id} order={order} actionable={false} folio={rail.placed.length + i + 1} />)}</div>
        </section>
      </main>
      <dialog ref={dialogRef} onClose={() => setServing(null)} className="bill m-auto w-[calc(100%-2rem)] max-w-md p-5 backdrop:bg-[#1e1b18]/60" aria-labelledby="two-serve" style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", boxShadow: "inset 0 0 0 3px var(--paper), inset 0 0 0 4.5px var(--ink)" }}>
        {serving && rail.staff ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h2 id="two-serve" className="garamond text-2xl italic">Serve {serving.reference}, table {serving.tableNo}</h2>
            <p className="text-[14px] italic text-[var(--ink-soft)]">Who served, who cooked, who mixed.</p>
            {([["waiterId", "Waiter", rail.staff.waiters], ["chefId", "Chef", rail.staff.chefs], ["bartenderId", "Bartender", rail.staff.bartenders]] as const).map(([name, label, people]) => (
              <label key={name} className="flex flex-col gap-1 text-[14px]">{label}<select name={name} required defaultValue="" className="field"><option value="" disabled>Choose</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            ))}
            {error ? <p role="alert" className="text-[14px] font-bold" style={{ color: "var(--green)" }}>{error}</p> : null}
            <div className="mt-1 flex justify-end gap-2"><button type="button" onClick={() => setServing(null)} className="ink-button open">Cancel</button><button type="submit" className="ink-button">Mark served</button></div>
          </form>
        ) : null}
      </dialog>
    </BillFrame>
  );
}
