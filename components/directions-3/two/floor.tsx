"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SerializedOrder } from "@/lib/orders";
import { computeHeat, clock } from "@/components/pass/heat";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Dish } from "@/components/walkthrough/dishes";
import { attachServeDrag } from "@/components/walkthrough/serve-drag";
import { useRail } from "@/components/walkthrough/use-rail";
import { RUN_PALETTE, RunFrame, tableFor } from "./frame";
import { Room, runPosition, type Run } from "./room";

// The floor: the room with every run on it at once, and under it one card per run.
// Pull a card to the right, press Enter on it, or use its button to land it.
export function RunFloor() {
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
      setToast(`${updated.reference} landed.`);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  const runOf = (order: SerializedOrder): Run => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    const pos = runPosition(h.elapsedSeconds, h.promisedSeconds, h.state, reduce);
    return { id: order.id, reference: order.reference, table: tableFor(order.tableNo), f: pos.f, lap: pos.lap, state: h.state };
  };
  const runs = rail.orders.map(runOf);
  const Card = ({ order, actionable }: { order: SerializedOrder; actionable: boolean }) => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    const pos = runPosition(h.elapsedSeconds, h.promisedSeconds, h.state, reduce);
    return (
      <div className="chalk px-4 py-3">
        <div className="flex items-baseline justify-between gap-2"><span className="ref syne text-xl">{order.reference}</span><span className="text-[12px] font-bold">Table {order.tableNo}</span></div>
        <ul className="mt-2 flex flex-wrap gap-2">{order.items.map((l) => <li key={l.id} className="flex items-center gap-1.5 text-[13px]"><span className="bowl h-8 w-8" aria-hidden="true"><Dish id={l.menuItemId} material="glaze" palette={RUN_PALETTE} size={24} /></span>{l.name} <span className="font-bold">x{l.quantity}</span></li>)}</ul>
        <p className="tabular mt-2 text-[13px] text-[color:var(--ink-soft)]">
          {order.status === "PLACED" ? (h.state === "late" ? `Lap ${pos.lap}, ${clock(h.elapsedSeconds - h.promisedSeconds)} past the ${order.waitMinutes} promised` : `${Math.round(pos.f * 100)}% of the way, ${clock(Math.max(0, h.promisedSeconds - h.elapsedSeconds))} of ${order.waitMinutes} minutes`) : `Landed by ${order.staff.waiter?.name ?? "the floor"}${order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}`}
          {order.complaints.length > 0 ? <span className="ml-2 font-bold" style={{ color: "var(--red)" }}>{order.complaints.length} {order.complaints.length === 1 ? "note" : "notes"} from the table</span> : null}
        </p>
        {actionable ? <button type="button" onClick={() => setServing(order)} className="btn mt-3 w-full text-[14px]">Landed</button> : null}
      </div>
    );
  };
  return (
    <RunFrame>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-8 lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
        <div>
          <div className="flex items-baseline justify-between gap-3"><h1 className="syne text-3xl sm:text-4xl">The floor</h1><p className="text-[12px] text-[color:var(--ink-soft)]" role="status" aria-live="polite">{toast ?? (rail.data ? "Updates every 3 seconds." : "Opening the floor.")}</p></div>
          {rail.error ? <p role="alert" className="mt-2 text-[13px] font-bold" style={{ color: "var(--red)" }}>{rail.error.message}</p> : null}
          <div className="chalk mt-3 p-2"><Room runs={runs} className="w-full" /></div>
          <p className="mt-2 text-[13px] text-[color:var(--ink-soft)]">Pull a card to the right to land it, press Enter on it, or use its button.</p>
        </div>
        <div>
          <section className="mt-4 lg:mt-0" aria-labelledby="two-open">
            <h2 id="two-open" className="syne text-xl">Running <span className="text-[color:var(--ink-soft)]">{rail.placed.length}</span></h2>
            <div ref={listRef} className="mt-2 flex flex-col gap-3">
              {rail.data && rail.placed.length === 0 ? <p className="chalk px-4 py-4 text-[14px]" data-empty>No runs on the floor. Orders sent from the tray appear here within a few seconds.</p> : null}
              {rail.placed.map((order) => (
                <div key={order.id} data-order-id={order.id} className="entry cursor-grab" tabIndex={0} role="button" aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to land it, or pull to the right.`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServing(order); } }}>
                  <Card order={order} actionable />
                </div>
              ))}
            </div>
          </section>
          <section className="mt-6" aria-labelledby="two-served" data-served>
            <h2 id="two-served" className="syne text-xl">Landed <span className="text-[color:var(--ink-soft)]">{rail.served.length}</span></h2>
            <div className="mt-2 flex flex-col gap-3">{rail.served.length === 0 ? <p className="text-[13px] text-[color:var(--ink-soft)]">Nothing landed yet.</p> : rail.served.map((order) => <Card key={order.id} order={order} actionable={false} />)}</div>
          </section>
        </div>
      </main>
      <dialog ref={dialogRef} onClose={() => setServing(null)} className="lacquer m-auto w-[calc(100%-2rem)] max-w-md p-5 backdrop:bg-[#1e1c19]/70" aria-labelledby="two-serve">
        {serving && rail.staff ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h2 id="two-serve" className="syne text-2xl">Land {serving.reference}, table {serving.tableNo}</h2>
            <p className="text-[13px] opacity-90">Who ran it, who cooked, who mixed.</p>
            {([["waiterId", "Runner", rail.staff.waiters], ["chefId", "Chef", rail.staff.chefs], ["bartenderId", "Bartender", rail.staff.bartenders]] as const).map(([name, label, people]) => <label key={name} className="flex flex-col gap-1 text-[13px] font-bold">{label}<select name={name} required defaultValue="" className="field font-normal text-[color:var(--ink)]"><option value="" disabled>Choose</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>)}
            {error ? <p role="alert" className="text-[13px] font-bold" style={{ color: "var(--mustard)" }}>{error}</p> : null}
            <div className="mt-1 flex justify-end gap-2"><button type="button" onClick={() => setServing(null)} className="btn quiet text-[14px]">Cancel</button><button type="submit" className="btn text-[14px]">Mark served</button></div>
          </form>
        ) : null}
      </dialog>
    </RunFrame>
  );
}
