"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SerializedOrder } from "@/lib/orders";
import { computeHeat, clock } from "@/components/pass/heat";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Dish } from "@/components/walkthrough/dishes";
import { attachServeDrag } from "@/components/walkthrough/serve-drag";
import { useRail } from "@/components/walkthrough/use-rail";
import { Glass, MAT_PALETTE, MatFrame, glassState } from "./frame";

// The floor: every table's placemat at once, each with its glass, so the waiter sees
// whose ice is gone. Pull a mat to the right, press Enter on it, or use its button.
export function MatFloor() {
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
  const Mat = ({ order, actionable }: { order: SerializedOrder; actionable: boolean }) => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    const late = h.state === "late";
    const lateSeconds = Math.max(0, h.elapsedSeconds - h.promisedSeconds);
    const g = glassState(h.heat, h.state, lateSeconds, h.promisedSeconds, reduce);
    return (
      <div className="kraft flex gap-3 px-3 py-3">
        <div className="shrink-0" aria-hidden="true"><Glass cubes={g.cubes} ring={g.ring} size={54} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2"><span className="ref young text-xl">{order.reference}</span><span className="text-[12px] font-extrabold">Table {order.tableNo}</span></div>
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">{order.items.map((l) => <li key={l.id} className="flex items-center gap-1.5 text-[13px]"><span className="enamel h-7 w-7" aria-hidden="true"><Dish id={l.menuItemId} material="gouache" palette={MAT_PALETTE} size={20} /></span>{l.name} <span className="font-extrabold">x{l.quantity}</span></li>)}</ul>
          <p className="tabular mt-1.5 text-[12px] text-[color:var(--ink-soft)]">
            {order.status === "PLACED" ? (late ? `Ice gone, ${clock(lateSeconds)} past the ${order.waitMinutes} promised` : `${g.cubes} ${g.cubes === 1 ? "cube" : "cubes"} left, ${clock(Math.max(0, h.promisedSeconds - h.elapsedSeconds))} of ${order.waitMinutes} minutes`) : `Served by ${order.staff.waiter?.name ?? "the floor"}${order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}`}
            {order.complaints.length > 0 ? <span className="ml-2 font-extrabold" style={{ color: "var(--pepper)" }}>{order.complaints.length} {order.complaints.length === 1 ? "word" : "words"} from the table</span> : null}
          </p>
          {actionable ? <button type="button" onClick={() => setServing(order)} className="btn mt-2 w-full text-[13px]">Served</button> : null}
        </div>
      </div>
    );
  };
  return (
    <MatFrame>
      <main className="mx-auto max-w-6xl px-3 pb-16 pt-3 sm:px-6">
        <div className="kraft px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3"><h1 className="young text-3xl sm:text-4xl">The tables</h1><p className="text-[12px] text-[color:var(--ink-soft)]" role="status" aria-live="polite">{toast ?? (rail.data ? "Updates every 3 seconds." : "Looking at the floor.")}</p></div>
          {rail.error ? <p role="alert" className="mt-2 text-[13px] font-extrabold" style={{ color: "var(--pepper)" }}>{rail.error.message}</p> : null}
          <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">Pull a placemat to the right to serve it, press Enter on it, or use its button.</p>
        </div>
        <div className="mt-4 lg:grid lg:grid-cols-2 lg:gap-6">
          <section aria-labelledby="three-open">
            <h2 id="three-open" className="slip young inline-block px-3 py-1 text-xl">Waiting <span className="text-[color:var(--ink-soft)]">{rail.placed.length}</span></h2>
            <div ref={listRef} className="mt-2 flex flex-col gap-3">
              {rail.data && rail.placed.length === 0 ? <p className="kraft px-4 py-4 text-[14px]" data-empty>No tables waiting. Orders sent from the placemat appear here within a few seconds.</p> : null}
              {rail.placed.map((order) => (
                <div key={order.id} data-order-id={order.id} className="entry cursor-grab" tabIndex={0} role="button" aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or pull to the right.`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServing(order); } }}>
                  <Mat order={order} actionable />
                </div>
              ))}
            </div>
          </section>
          <section className="mt-6 lg:mt-0" aria-labelledby="three-served" data-served>
            <h2 id="three-served" className="slip young inline-block px-3 py-1 text-xl">Served <span className="text-[color:var(--ink-soft)]">{rail.served.length}</span></h2>
            <div className="mt-2 flex flex-col gap-3">{rail.served.length === 0 ? <p className="slip inline-block px-3 py-2 text-[13px]">Nothing served yet.</p> : rail.served.map((order) => <Mat key={order.id} order={order} actionable={false} />)}</div>
          </section>
        </div>
      </main>
      <dialog ref={dialogRef} onClose={() => setServing(null)} className="kraft m-auto w-[calc(100%-2rem)] max-w-md p-5 backdrop:bg-[#182f52]/75" aria-labelledby="three-serve">
        {serving && rail.staff ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h2 id="three-serve" className="young text-2xl">Serve {serving.reference}, table {serving.tableNo}</h2>
            <p className="text-[13px] text-[color:var(--ink-soft)]">Who served, who cooked, who mixed.</p>
            {([["waiterId", "Waiter", rail.staff.waiters], ["chefId", "Chef", rail.staff.chefs], ["bartenderId", "Bartender", rail.staff.bartenders]] as const).map(([name, label, people]) => <label key={name} className="flex flex-col gap-1 text-[13px] font-extrabold">{label}<select name={name} required defaultValue="" className="field font-normal"><option value="" disabled>Choose</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>)}
            {error ? <p role="alert" className="text-[13px] font-extrabold" style={{ color: "var(--pepper)" }}>{error}</p> : null}
            <div className="mt-1 flex justify-end gap-2"><button type="button" onClick={() => setServing(null)} className="btn quiet text-[14px]">Cancel</button><button type="submit" className="btn text-[14px]">Mark served</button></div>
          </form>
        ) : null}
      </dialog>
    </MatFrame>
  );
}
