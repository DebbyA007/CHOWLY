"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SerializedOrder } from "@/lib/orders";
import { clock, computeHeat } from "@/components/pass/heat";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Dish } from "@/components/walkthrough/dishes";
import { attachServeDrag } from "@/components/walkthrough/serve-drag";
import { useRail } from "@/components/walkthrough/use-rail";
import { Lamp } from "./lamp";
import { PASS_PALETTE, PassFrame, Peg } from "./frame";

// The pass from the kitchen side: a wooden rail with every fired ticket pegged to it
// under its own small lamp, taking its own heat, and a stone shelf below for the served
// ones. Pull a ticket down, press Enter on it, or use its button: all open the same
// dialog. Updates every three seconds.
export function PassRail() {
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
    return attachServeDrag(el, ".entry", "y", (element) => {
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
  const Ticket = ({ order, actionable }: { order: SerializedOrder; actionable: boolean }) => {
    const h = computeHeat(order.status, order.placedAt, order.waitMinutes, rail.now, reduce);
    return (
      <div className="heat relative pt-[112px]" style={{ ["--heat" as string]: h.heat.toFixed(3) }} data-state={h.state}>
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" aria-hidden="true"><Lamp seed={Number(order.id.replace(/\D/g, "").slice(-3) || 1) + 3} width={140} reach={h.reach} /></div>
        <article className="ticket paper torn-bottom relative px-4 pt-8" aria-label={`Order ${order.reference}, table ${order.tableNo}`}>
          <Peg className="absolute left-1/2 -top-2 -translate-x-1/2" />
          <div className="flex items-baseline justify-between gap-2 border-b-2 border-dashed border-ink pb-1.5"><h3 className="ref display-print text-xl">{order.reference}</h3><span className="text-xs font-bold">TABLE {order.tableNo}</span></div>
          <ul className="mt-2 text-sm">{order.items.map((l) => <li key={l.id} className="flex items-center justify-between gap-2 py-0.5"><span className="flex items-center gap-2"><span className="plate3 h-7 w-7" aria-hidden="true"><Dish id={l.menuItemId} material="gouache" palette={PASS_PALETTE} size={22} /></span>{l.name}</span><span className="tabular font-bold text-char-ink">x{l.quantity}</span></li>)}</ul>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t-2 border-dashed border-ink pt-2 text-xs">
            {order.status === "PLACED" ? <span className="tabular">{h.state === "late" ? <><span className="font-bold text-char-ink">+{clock(h.elapsedSeconds - h.promisedSeconds)}</span> past {order.waitMinutes}&apos;</> : <>{clock(Math.max(0, h.promisedSeconds - h.elapsedSeconds))} of {order.waitMinutes}&apos;</>}</span> : <span className="text-ink-soft">Served by {order.staff.waiter?.name ?? "the floor"}{order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}</span>}
            {order.complaints.length > 0 ? <span className="font-bold text-char-ink">{order.complaints.length === 1 ? "1 SLIP" : `${order.complaints.length} SLIPS`}</span> : null}
          </div>
          {actionable ? <button type="button" onClick={() => setServing(order)} className="stamp-button mt-3 w-full bg-served-ink px-3 py-2 text-sm text-paper">Mark served</button> : null}
        </article>
      </div>
    );
  };
  return (
    <PassFrame>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="display sign-text text-4xl sm:text-5xl">The pass</h1>
          <p className="text-xs text-ink-soft" role="status" aria-live="polite">{toast ?? (rail.data ? "Updates every 3 seconds." : "Opening the pass.")}</p>
        </div>
        {rail.error ? <p role="alert" className="mb-3 text-sm font-bold text-char-ink">{rail.error.message} The rail keeps trying.</p> : null}
        <section aria-labelledby="one-open">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pb-2"><h2 id="one-open" className="shrink-0 text-sm font-bold">ON THE PASS <span className="tabular text-ink-soft">{rail.placed.length}</span></h2><p className="text-xs text-ink-soft">pull a ticket down to serve it, or use its button</p></div>
          <div className="rail3 h-[16px]" />
          <div ref={listRef} className="-mt-[2px] grid gap-5 px-1 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {rail.data && rail.placed.length === 0 ? <div className="paper torn-bottom mt-[112px] px-4 pt-6" data-empty><p className="display-print text-xl">Nothing on the pass</p><p className="mt-1 text-sm text-ink-soft">Tickets fired from the strips hang here within a few seconds.</p></div> : null}
            {rail.placed.map((order) => (
              <div key={order.id} data-order-id={order.id} className="entry cursor-grab" tabIndex={0} role="button" aria-label={`${order.reference}, table ${order.tableNo}. Press Enter to mark served, or pull down to the shelf.`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServing(order); } }}>
                <Ticket order={order} actionable />
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="one-served" className="mt-4" data-served>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pb-2"><h2 id="one-served" className="shrink-0 text-sm font-bold">SERVED <span className="tabular text-ink-soft">{rail.served.length}</span></h2><p className="text-xs text-ink-soft">on the shelf, waiting to be settled</p></div>
          <div className="stone3 h-[16px] border-t-2 border-[color:var(--stone-dark)]" />
          <div className="grid gap-5 px-1 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {rail.served.length === 0 ? <p className="mt-6 text-sm text-ink-soft">Nothing served yet.</p> : rail.served.map((order) => <Ticket key={order.id} order={order} actionable={false} />)}
          </div>
        </section>
      </main>
      <dialog ref={dialogRef} onClose={() => setServing(null)} className="stone3 m-auto w-[calc(100%-2rem)] max-w-md border-4 border-[color:var(--stone-dark)] p-0 backdrop:bg-[#1b1a18]/75" aria-labelledby="one-serve">
        {serving && rail.staff ? (
          <form onSubmit={submit} className="flex flex-col">
            <div className="wood3 px-5 py-3 text-paper-fresh" style={{ color: "var(--paper-fresh)" }}><h2 id="one-serve" className="display-print text-2xl">Serve {serving.reference}</h2><p className="mt-0.5 text-xs">Table {serving.tableNo}. Record who served, cooked and mixed.</p></div>
            <div className="flex flex-col gap-4 p-5">
              {([["waiterId", "WAITER", rail.staff.waiters], ["chefId", "CHEF", rail.staff.chefs], ["bartenderId", "BARTENDER", rail.staff.bartenders]] as const).map(([name, label, people]) => (
                <label key={name} className="flex flex-col gap-1.5 text-xs font-bold">{label}<select name={name} required defaultValue="" className="border-2 border-soot bg-paper px-3 py-2 text-base font-normal text-ink"><option value="" disabled>Choose</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              ))}
              {error ? <p role="alert" className="text-sm font-bold" style={{ color: "var(--lamp-warm)" }}>{error}</p> : null}
              <div className="mt-1 flex justify-end gap-3"><button type="button" onClick={() => setServing(null)} className="stamp-button bg-paper px-4 py-2.5 text-ink">Cancel</button><button type="submit" className="stamp-button bg-served-ink px-4 py-2.5 text-paper">Mark served</button></div>
            </div>
          </form>
        ) : null}
      </dialog>
    </PassFrame>
  );
}
