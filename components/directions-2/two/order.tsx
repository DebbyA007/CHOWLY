"use client";

import Link from "next/link";
import { useState } from "react";
import { Dish } from "@/components/walkthrough/dishes";
import { DemoControls } from "@/components/walkthrough/demo-controls";
import { useOrder } from "@/components/walkthrough/use-order";
import { BILL_PALETTE, BillFrame, Candle } from "./frame";

const base = "/directions-2/two";

function Marks({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="garamond flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] text-[17px]" style={{ background: value !== null && n <= value ? "var(--ink)" : "transparent", color: value !== null && n <= value ? "var(--paper)" : "var(--ink)" }}>
          {n}
        </button>
      ))}
    </div>
  );
}

// Your order, printed, with the candle beside it. The clock is the candle: it burns
// down through the promised minutes, and past them it is a stub in its own wax while the
// page has dimmed. Never red.
export function BillOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const [desc, setDesc] = useState("");
  const [slipScore, setSlipScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;
  if (o.error && !order) {
    return (
      <BillFrame>
        <main className="mx-auto max-w-2xl px-5 py-10">
          <h1 className="garamond text-3xl italic">Not your card</h1>
          <p className="mt-2 text-[15px] text-[var(--ink-soft)]">{o.error.message} An order shows only to the browser that placed it.</p>
          <Link href={`${base}/menu`} className="ink-button mt-4 inline-block">Back to the bill of fare</Link>
        </main>
      </BillFrame>
    );
  }
  if (!order) return <BillFrame><main className="mx-auto max-w-2xl px-5 py-10 italic text-[var(--ink-soft)]">Printing.</main></BillFrame>;
  const caption = o.state === "waiting" ? `of the ${order.waitMinutes} minutes the kitchen named` : o.state === "late" ? `past the ${order.waitMinutes} named. The candle is a stub.` : o.state === "served" ? "On the table." : "Settled, with thanks.";
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;
  return (
    <BillFrame progress={o.progress} state={o.state}>
      <main className="mx-auto max-w-2xl px-5 pb-32 pt-5">
        <p className="text-[15px] italic text-[var(--ink-soft)]">No. {order.reference}, table {order.tableNo}</p>
        <div className="rule-double mt-2 flex items-center gap-4 py-3">
          <div className="candle shrink-0"><Candle progress={o.progress} out={o.state === "paid"} size={150} /></div>
          <div className="min-w-0 flex-1">
            <p className="garamond tabular text-[clamp(3rem,14vw,5rem)] leading-none work" aria-label={`${o.digits} ${caption}`} style={{ fontFamily: "var(--font-garamond)", fontVariantNumeric: "lining-nums" }}>{o.digits}</p>
            <p className="mt-1 text-[14px] italic leading-snug text-[var(--ink-soft)]">{caption}</p>
          </div>
        </div>
        <p className="mt-3 text-[15px] italic text-[var(--ink-soft)]" aria-live="polite">
          {order.status === "PLACED" ? `Ordered${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen named ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Served${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
        </p>
        <ul className="mt-4" aria-label="Your dishes">
          {order.items.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-1.5">
              <Dish id={l.menuItemId} material="ink" palette={BILL_PALETTE} size={40} />
              <span className="garamond flex-1 text-[19px]">{l.name} <span className="text-[15px] italic text-[var(--ink-soft)]">x{l.quantity}</span></span>
              <span className="leader w-4" aria-hidden="true" /><span className="garamond text-[18px]">{l.subtotal}</span>
            </li>
          ))}
        </ul>
        <p className="rule mt-1 flex justify-between pt-2 text-[19px] font-bold"><span>Total</span><span>{order.total}</span></p>
        {o.notice ? <p role="status" className="mt-3 text-[15px] font-bold" style={{ color: "var(--green)" }}>{o.notice}</p> : null}

        {order.status === "SERVED" && !order.payment ? (
          <section className="rule-double mt-6 px-1 py-3" aria-labelledby="two-bill">
            <h2 id="two-bill" className="garamond text-2xl italic">The account, {order.total}</h2>
            <p className="text-[14px] italic text-[var(--ink-soft)]">Pretend payment for the demo. No money moves, and the record says so.</p>
            <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
              {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => (
                <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="garamond border-[1.5px] border-[var(--ink)] px-3 py-1 text-[16px]" style={{ background: method === v ? "var(--ink)" : "transparent", color: method === v ? "var(--paper)" : "var(--ink)" }}>{label}</button>
              ))}
            </div>
            <button type="button" disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="ink-button mt-3">{o.busy === "settle" ? "Settling" : "Settle the account (pretend)"}</button>
          </section>
        ) : null}
        {order.payment ? (
          <section className="rule-double mt-6 px-1 py-3" aria-labelledby="two-receipt">
            <h2 id="two-receipt" className="garamond misreg text-4xl italic">Paid in full.</h2>
            <p className="mt-1 text-[14px] italic text-[var(--ink-soft)]">By {order.payment.method === "CARD" ? "card" : order.payment.method === "CASH" ? "cash" : "mobile money"}, {order.payment.amount}. The candle is out.</p>
            <p className="mt-2 text-[14px] font-bold" style={{ color: "var(--green)" }}>Pretend payment. No money moved, and the record is marked pretend.</p>
          </section>
        ) : null}
        {o.late ? (
          <section className="rule-double mt-6 px-1 py-3" aria-labelledby="two-word">
            <h2 id="two-word" className="garamond text-2xl italic">A note to the house</h2>
            <p className="text-[14px] italic text-[var(--ink-soft)]">The kitchen named {order.waitMinutes} minutes and this is {lateBy} past it. Say what went wrong; the house reads it.</p>
            {order.complaints.length > 0 ? <ul className="mt-2 text-[14px]">{order.complaints.map((c) => <li key={c.id}><span className="font-bold">Sent.</span> {c.description}</li>)}</ul> : null}
            <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words."); return; } if (await o.sendComplaint(desc.trim(), slipScore)) { setDesc(""); setSlipScore(null); } }}>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="field" aria-label="What went wrong" />
              <Marks value={slipScore} onChange={setSlipScore} name="Score with the note" />
              <div><button type="submit" disabled={o.busy === "complaint"} className="ink-button">{o.busy === "complaint" ? "Sending" : "Send"}</button></div>
            </form>
          </section>
        ) : null}
        <section className="rule mt-6 pt-3" aria-labelledby="two-rate">
          <h2 id="two-rate" className="garamond text-2xl italic">Mark it</h2>
          <p className="text-[14px] italic text-[var(--ink-soft)]">{order.rating ? `You marked it ${order.rating.score} of 5. Change it if you like.` : "One to five. On its own, or with a note."}</p>
          <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Pick a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
            <Marks value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" />
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field" placeholder="A note for the kitchen, if you like" aria-label="A note for the kitchen" />
            <div><button type="submit" disabled={o.busy === "rating"} className="ink-button open">{o.busy === "rating" ? "Marking" : order.rating ? "Change it" : "Rate it"}</button></div>
          </form>
        </section>
      </main>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </BillFrame>
  );
}
