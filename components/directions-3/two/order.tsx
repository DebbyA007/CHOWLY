"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoControls } from "@/components/walkthrough/demo-controls";
import { Dish } from "@/components/walkthrough/dishes";
import { useOrder } from "@/components/walkthrough/use-order";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { RUN_PALETTE, RunFrame, base, tableFor } from "./frame";
import { Room, runPosition } from "./room";

function Marks({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="tabular flex h-11 w-11 items-center justify-center border-2 border-[color:var(--ink)] text-[15px] font-bold" style={{ background: value !== null && n <= value ? "var(--mustard)" : "var(--chalk)" }}>{n}</button>
      ))}
    </div>
  );
}

// Your run: the room, the route from the pass to your table, and the runner on it.
// Time is distance. Past the promise the runner is on a lap round the room, and the
// lap count is how far past.
export function RunOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const reduce = usePrefersReducedMotion();
  const [desc, setDesc] = useState("");
  const [noteScore, setNoteScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;
  if (o.error && !order) {
    return <RunFrame><main className="mx-auto max-w-6xl px-4 pt-10 sm:px-8"><div className="chalk max-w-md px-5 py-5"><h1 className="syne text-3xl">Not your run</h1><p className="mt-2 text-sm">{o.error.message} An order shows only to the browser that placed it.</p><Link href={`${base}/menu`} className="btn mt-4 inline-block text-sm">Back to the tray</Link></div></main></RunFrame>;
  }
  if (!order) return <RunFrame><main className="mx-auto max-w-6xl px-4 pt-10 text-sm sm:px-8">Finding your run.</main></RunFrame>;
  const table = tableFor(order.tableNo);
  const pos = runPosition(o.elapsed, o.promised, o.state, reduce);
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;
  const caption = o.state === "waiting" ? `${Math.round(pos.f * 100)}% of the way to table ${order.tableNo}, ${order.waitMinutes} minutes promised` : o.state === "late" ? `lap ${pos.lap}: past table ${order.tableNo} and round the room again` : o.state === "served" ? `On table ${order.tableNo}.` : "Settled.";
  const payment = order.payment;
  return (
    <RunFrame>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-8 lg:grid lg:grid-cols-[1fr_400px] lg:gap-10" data-state={o.state} data-clock={`runner ${Math.round(pos.f * 100)}% along, lap ${pos.lap}`}>
        <section aria-label={`${o.digits} ${caption}`}>
          <div className="flex items-baseline justify-between"><h1 className="syne text-2xl sm:text-4xl">{order.reference}</h1><span className="text-sm font-bold">Table {order.tableNo}</span></div>
          <div className="chalk mt-3 p-2"><Room runs={[{ id: order.id, reference: order.reference, table, f: pos.f, lap: pos.lap, state: o.state, mine: true }]} tableNo={order.tableNo} className="w-full" /></div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p data-digits className="syne tabular text-[clamp(3rem,13vw,5.5rem)] leading-none">{o.state === "late" ? <><span style={{ color: "var(--red)" }}>+</span>{o.digits.slice(1)}</> : o.digits}</p>
            <p className="max-w-[55%] text-right text-[13px] leading-snug text-[color:var(--ink-soft)]">{caption}</p>
          </div>
          <p className="mt-2 text-[13px] text-[color:var(--ink-soft)]" aria-live="polite">
            {order.status === "PLACED" ? `Sent${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen promised ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Landed${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? `, run by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
          </p>
        </section>
        <div>
          <ul className="chalk mt-4 divide-y-2 divide-dashed divide-[color:var(--ink)] px-4 py-1 text-[15px] lg:mt-0" aria-label="Bowls">
            {order.items.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 py-2"><span className="flex items-center gap-2"><span className="bowl h-9 w-9" aria-hidden="true"><Dish id={l.menuItemId} material="glaze" palette={RUN_PALETTE} size={28} /></span>{l.name} <span className="font-bold">x{l.quantity}</span></span><span className="tabular">{l.subtotal}</span></li>)}
            <li className="flex justify-between py-2 font-bold"><span>Total</span><span className="tabular">{order.total}</span></li>
          </ul>
          {o.notice ? <p role="status" className="mt-3 text-[14px] font-bold">{o.notice}</p> : null}
          {order.status === "SERVED" && !payment ? (
            <section className="chalk mt-4 px-4 py-4" aria-labelledby="two-settle" data-section="settle">
              <h2 id="two-settle" className="syne text-xl">Settle {order.total}</h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
                {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="border-2 border-[color:var(--ink)] px-3 py-1.5 text-[13px] font-bold" style={{ background: method === v ? "var(--mustard)" : "var(--chalk)" }}>{label}</button>)}
              </div>
              <button type="button" data-settle disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="btn mt-3 text-[14px]">{o.busy === "settle" ? "Settling" : "Settle the tray (pretend)"}</button>
            </section>
          ) : null}
          {payment ? (
            <section className="chalk mt-4 px-4 py-4" aria-labelledby="two-receipt" data-section="receipt">
              <h2 id="two-receipt" className="syne text-2xl">Chit. Paid.</h2>
              <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">{payment.amount} by {payment.method === "CARD" ? "card" : payment.method === "CASH" ? "cash" : "mobile money"}. {order.reference}, table {order.tableNo}.</p>
              <p className="mt-2 text-[14px] font-bold" style={{ color: "var(--red)" }}>Pretend payment. No money moved.</p>
            </section>
          ) : null}
          {o.late ? (
            <section className="chalk mt-4 px-4 py-4" aria-labelledby="two-note" data-section="complaint">
              <h2 id="two-note" className="syne text-xl">Call the runner over</h2>
              <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">The kitchen promised {order.waitMinutes} minutes and this run is {lateBy} past it. Say what went wrong; the floor reads it.</p>
              {order.complaints.length > 0 ? <ul className="mt-2 text-[13px]">{order.complaints.map((c) => <li key={c.id}><span className="font-bold">Sent.</span> {c.description}</li>)}</ul> : null}
              <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words."); return; } if (await o.sendComplaint(desc.trim(), noteScore)) { setDesc(""); setNoteScore(null); } }}>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="field" aria-label="What went wrong" />
                <Marks value={noteScore} onChange={setNoteScore} name="Score with the note" />
                <div><button type="submit" data-send disabled={o.busy === "complaint"} className="btn text-[14px]">{o.busy === "complaint" ? "Sending" : "Send"}</button></div>
              </form>
            </section>
          ) : null}
          <form className="chalk mt-4 px-4 py-4" aria-labelledby="two-marks" data-section="rating" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Pick a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
            <h2 id="two-marks" className="syne text-xl">Marks out of five</h2>
            <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">{order.rating ? `You gave it ${order.rating.score}. Change it if you like.` : "On its own, or with a note."}</p>
            <div className="mt-3"><Marks value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" /></div>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field mt-3 w-full" placeholder="A note for the kitchen, if you like" aria-label="A note for the kitchen" />
            <div className="mt-3"><button type="submit" data-rate disabled={o.busy === "rating"} className="btn quiet text-[14px]">{o.busy === "rating" ? "Saving" : order.rating ? "Change the marks" : "Give the marks"}</button></div>
          </form>
        </div>
      </main>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </RunFrame>
  );
}
