"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoControls } from "@/components/walkthrough/demo-controls";
import { Dish } from "@/components/walkthrough/dishes";
import { useOrder } from "@/components/walkthrough/use-order";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";
import { Cutlery, Glass, MAT_PALETTE, MatFrame, base, glassState } from "./frame";

function Marks({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="tabular flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[color:var(--ink)] text-[15px] font-extrabold" style={{ background: value !== null && n <= value ? "var(--print)" : "#fff" }}>{n}</button>
      ))}
    </div>
  );
}

// Your place while you wait. The glass is the clock: five cubes when the order goes
// in, melting as the minutes are used, none when the promise is past, and from then
// the glass sweats a ring into the placemat. The bowl lands on the mat when served.
export function MatOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const reduce = usePrefersReducedMotion();
  const [desc, setDesc] = useState("");
  const [wordScore, setWordScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;
  if (o.error && !order) {
    return <MatFrame><main className="mx-auto max-w-6xl px-3 pt-6 sm:px-6"><div className="kraft max-w-md px-5 py-5"><h1 className="young text-3xl">Not your table</h1><p className="mt-2 text-sm">{o.error.message} An order shows only to the browser that placed it.</p><Link href={`${base}/menu`} className="btn mt-4 inline-block text-sm">Back to the placemat</Link></div></main></MatFrame>;
  }
  if (!order) return <MatFrame><main className="mx-auto max-w-6xl px-3 pt-6 sm:px-6"><div className="kraft px-5 py-5 text-sm">Finding your table.</div></main></MatFrame>;
  const glass = glassState(o.progress, o.state, o.lateSeconds, o.promised, reduce);
  const caption = o.state === "waiting" ? `of ${order.waitMinutes} minutes promised. ${glass.cubes} ${glass.cubes === 1 ? "cube" : "cubes"} left in the glass.` : o.state === "late" ? `past the ${order.waitMinutes} promised. The ice is gone and the glass is sweating a ring.` : o.state === "served" ? "On the table." : "Paid. The glass is empty.";
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;
  const payment = order.payment;
  const first = order.items[0];
  return (
    <MatFrame>
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-3 sm:px-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6" data-state={o.state} data-clock={`ice ${glass.cubes} of 5, ring ${glass.ring.toFixed(2)}`}>
        <section className="kraft relative px-4 pb-5 pt-5 sm:px-6" aria-label={`${o.digits} ${caption}`}>
          <div className="flex items-baseline justify-between gap-3"><h1 className="young text-2xl sm:text-4xl">{order.reference}</h1><span className="text-[13px] font-extrabold">Table {order.tableNo}</span></div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p data-digits className={`young tabular text-[clamp(3rem,13vw,5.6rem)] leading-none ${o.state === "served" || o.state === "paid" ? "text-[color:var(--enamel-rim)]" : ""}`}>{o.state === "late" ? <><span style={{ color: "var(--pepper)" }}>+</span>{o.digits.slice(1)}</> : o.digits}</p>
              <p className="mt-1 max-w-[210px] text-[13px] leading-snug text-[color:var(--ink-soft)] sm:max-w-md sm:text-sm">{caption}</p>
            </div>
            <div className="shrink-0 pt-1" aria-hidden="true"><Glass cubes={glass.cubes} ring={glass.ring} out={o.state === "paid"} size={96} /></div>
          </div>
          <p className="mt-3 text-[13px] text-[color:var(--ink-soft)]" aria-live="polite">
            {order.status === "PLACED" ? `Sent${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen promised ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Served${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
          </p>
          {(o.state === "served" || o.state === "paid") && first ? (
            <div className="relative mt-4 h-[150px]" aria-hidden="true">
              <div className="enamel absolute left-2 top-2 h-[130px] w-[130px]"><Dish id={first.menuItemId} material="gouache" palette={MAT_PALETTE} size={102} /></div>
              <Cutlery className="absolute left-[150px] top-2" />
            </div>
          ) : null}
          <ul className="slip mt-4 px-4 py-1 text-[15px]" aria-label="Dishes">
            {order.items.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 border-b border-dashed border-[color:var(--ink)] py-2 last:border-b-0"><span className="flex items-center gap-2"><span className="enamel h-8 w-8" aria-hidden="true"><Dish id={l.menuItemId} material="gouache" palette={MAT_PALETTE} size={24} /></span>{l.name} <span className="font-extrabold">x{l.quantity}</span></span><span className="tabular">{l.subtotal}</span></li>)}
            <li className="flex justify-between py-2 font-extrabold"><span>Total</span><span className="tabular">{order.total}</span></li>
          </ul>
          {o.notice ? <p role="status" className="mt-3 text-[14px] font-extrabold">{o.notice}</p> : null}
        </section>
        <div className="mt-4 flex flex-col gap-4 lg:mt-0">
          {order.status === "SERVED" && !payment ? (
            <section className="slip clipped px-4 pb-4 pt-6" aria-labelledby="three-settle" data-section="settle">
              <h2 id="three-settle" className="young text-xl">The chit, {order.total}</h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
                {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="rounded-full border-[1.5px] border-[color:var(--ink)] px-3 py-1.5 text-[13px] font-extrabold" style={{ background: method === v ? "var(--print)" : "#fff" }}>{label}</button>)}
              </div>
              <button type="button" data-settle disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="btn mt-3 text-[14px]">{o.busy === "settle" ? "Paying" : "Pay the chit (pretend)"}</button>
            </section>
          ) : null}
          {payment ? (
            <section className="slip clipped px-4 pb-4 pt-6" aria-labelledby="three-receipt" data-section="receipt">
              <h2 id="three-receipt" className="young text-2xl">Paid.</h2>
              <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">{payment.amount} by {payment.method === "CARD" ? "card" : payment.method === "CASH" ? "cash" : "mobile money"}. {order.reference}, table {order.tableNo}.</p>
              <p className="mt-2 text-[14px] font-extrabold" style={{ color: "var(--pepper)" }}>Pretend payment. No money moved.</p>
            </section>
          ) : null}
          {o.late ? (
            <section className="slip clipped px-4 pb-4 pt-6" aria-labelledby="three-word" data-section="complaint">
              <h2 id="three-word" className="young text-xl">A word for the waiter</h2>
              <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">The kitchen promised {order.waitMinutes} minutes and this is {lateBy} past it. Say what went wrong; the floor reads it.</p>
              {order.complaints.length > 0 ? <ul className="mt-2 text-[13px]">{order.complaints.map((c) => <li key={c.id}><span className="font-extrabold">Sent.</span> {c.description}</li>)}</ul> : null}
              <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words."); return; } if (await o.sendComplaint(desc.trim(), wordScore)) { setDesc(""); setWordScore(null); } }}>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="field" aria-label="What went wrong" />
                <Marks value={wordScore} onChange={setWordScore} name="Score with the word" />
                <div><button type="submit" data-send disabled={o.busy === "complaint"} className="btn text-[14px]">{o.busy === "complaint" ? "Sending" : "Send"}</button></div>
              </form>
            </section>
          ) : null}
          <form className="slip clipped px-4 pb-4 pt-6" aria-labelledby="three-marks" data-section="rating" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Pick a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
            <h2 id="three-marks" className="young text-xl">Marks</h2>
            <p className="mt-1 text-[13px] text-[color:var(--ink-soft)]">{order.rating ? `You gave it ${order.rating.score} of 5. Change it if you like.` : "One to five. On its own, or with a word."}</p>
            <div className="mt-3"><Marks value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" /></div>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field mt-3 w-full" placeholder="A note for the kitchen, if you like" aria-label="A note for the kitchen" />
            <div className="mt-3"><button type="submit" data-rate disabled={o.busy === "rating"} className="btn quiet text-[14px]">{o.busy === "rating" ? "Saving" : order.rating ? "Change the marks" : "Give the marks"}</button></div>
          </form>
        </div>
      </main>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </MatFrame>
  );
}
