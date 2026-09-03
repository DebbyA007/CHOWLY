"use client";

import Link from "next/link";
import { useState } from "react";
import { Dish } from "../shared/dishes";
import { DemoControls } from "../shared/demo-controls";
import { useOrder } from "../shared/use-order";
import { LINEN_PALETTE, LinenFrame } from "./frame";

const base = "/directions-2/one";

function Dots({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--ink)] text-[14px] font-bold" style={{ background: value !== null && n <= value ? "var(--olive)" : "#fffdf8", color: value !== null && n <= value ? "#fffdf8" : "var(--ink)" }}>
          {n}
        </button>
      ))}
    </div>
  );
}

// Your plate on the cloth, and the afternoon moving across it. The clock is the sun.
export function LinenOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const [desc, setDesc] = useState("");
  const [slipScore, setSlipScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;

  if (o.error && !order) {
    return (
      <LinenFrame>
        <main className="mx-auto max-w-3xl px-5 py-10">
          <div className="stitched rounded-2xl p-5">
            <h1 className="serif text-3xl italic">Not your table</h1>
            <p className="mt-2 text-[14px] text-[var(--ink-soft)]">{o.error.message} An order shows only to the browser that placed it.</p>
            <Link href={`${base}/menu`} className="btn mt-4 inline-block text-[14px]">Back to the card</Link>
          </div>
        </main>
      </LinenFrame>
    );
  }
  if (!order) return <LinenFrame><main className="mx-auto max-w-3xl px-5 py-10 text-[14px] text-[var(--ink-soft)]">Laying the table.</main></LinenFrame>;

  const caption = o.state === "waiting" ? `of ${order.waitMinutes} minutes the kitchen promised` : o.state === "late" ? `past the ${order.waitMinutes} minutes promised. The sun has moved off your plate.` : o.state === "served" ? "On the table." : "Settled. Thank you.";
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;

  return (
    <LinenFrame progress={o.progress} state={o.state}>
      <div className="relative">
        <div className="sun" aria-hidden="true" />
        <span className="ring" style={{ left: "6%", top: 120 }} aria-hidden="true" />
        <main className="relative mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-5">
          <p className="text-[13px] text-[var(--ink-soft)]">
            Order {order.reference}, table {order.tableNo}
          </p>
          {/* the plate */}
          <div className="relative mx-auto mt-3 flex aspect-square w-full max-w-[340px] flex-col items-center justify-center rounded-full text-center" style={{ background: "#fffdf8", boxShadow: "inset 0 0 0 10px #f3eee1, inset 0 0 0 12px #e6dfd0" }}>
            <div className="flex gap-1" aria-hidden="true">
              {order.items.slice(0, 3).map((line) => (
                <Dish key={line.id} id={line.menuItemId} material="gouache" palette={LINEN_PALETTE} size={56} className="dish-lift" />
              ))}
            </div>
            <p className="serif tabular text-[clamp(3.2rem,15vw,4.6rem)] leading-none" aria-label={`${o.digits} ${caption}`}>
              {o.digits}
            </p>
            <p className="mt-1 max-w-[220px] text-[12px] leading-snug text-[var(--ink-soft)]">{caption}</p>
          </div>

          <p className="mt-4 text-center text-[13px] text-[var(--ink-soft)]" aria-live="polite">
            {order.status === "PLACED" ? `Ordered${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen promised ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Served${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
          </p>

          <ul className="mt-5 divide-y divide-[var(--thread)] border-y border-[var(--thread)] text-[15px]" aria-label="Your dishes">
            {order.items.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 py-2">
                <span className="serif italic">{line.name} <span className="not-italic text-[13px] text-[var(--ink-soft)]">x{line.quantity}</span></span>
                <span className="tabular">{line.subtotal}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between text-[17px] font-bold"><span>Total</span><span className="tabular">{order.total}</span></p>

          {o.notice ? <p role="status" className="mt-3 text-[14px] font-bold" style={{ color: "var(--olive)" }}>{o.notice}</p> : null}

          {order.status === "SERVED" && !order.payment ? (
            <section className="stitched mt-6 rounded-2xl px-4 py-4" aria-labelledby="one-bill">
              <h2 id="one-bill" className="serif text-2xl italic">The bill, {order.total}</h2>
              <p className="text-[13px] text-[var(--ink-soft)]">Pretend payment for the demo. No money moves, and the record says so.</p>
              <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
                {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => (
                  <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="rounded-full border-2 border-[var(--ink)] px-3 py-1.5 text-[13px] font-bold" style={{ background: method === v ? "var(--ink)" : "#fffdf8", color: method === v ? "#fffdf8" : "var(--ink)" }}>{label}</button>
                ))}
              </div>
              <button type="button" disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="btn mt-3 text-[14px]">{o.busy === "settle" ? "Settling" : "Settle (pretend)"}</button>
            </section>
          ) : null}

          {order.payment ? (
            <section className="stitched mt-6 rounded-2xl px-4 py-4" aria-labelledby="one-receipt" style={{ transform: "rotate(-1deg)" }}>
              <h2 id="one-receipt" className="serif text-3xl italic">Paid, thank you.</h2>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">By {order.payment.method === "CARD" ? "card" : order.payment.method === "CASH" ? "cash" : "mobile money"}. {order.payment.amount}.</p>
              <p className="mt-2 text-[13px] font-bold" style={{ color: "var(--tomato)" }}>Pretend payment. No money moved, and the record is marked pretend.</p>
            </section>
          ) : null}

          {o.late ? (
            <section className="stitched mt-6 rounded-2xl px-4 py-4" aria-labelledby="one-word">
              <h2 id="one-word" className="serif text-2xl italic">A word with the waiter</h2>
              <p className="text-[13px] text-[var(--ink-soft)]">The kitchen promised {order.waitMinutes} minutes and this is {lateBy} past it. Say what went wrong; the floor sees it.</p>
              {order.complaints.length > 0 ? <ul className="mt-2 text-[13px]">{order.complaints.map((c) => <li key={c.id}><span className="font-bold">Sent.</span> {c.description}</li>)}</ul> : null}
              <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words."); return; } if (await o.sendComplaint(desc.trim(), slipScore)) { setDesc(""); setSlipScore(null); } }}>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="field" aria-label="What went wrong" />
                <Dots value={slipScore} onChange={setSlipScore} name="Score with the word" />
                <div><button type="submit" disabled={o.busy === "complaint"} className="btn text-[14px]">{o.busy === "complaint" ? "Sending" : "Send"}</button></div>
              </form>
            </section>
          ) : null}

          <section className="mt-6 border-t border-[var(--thread)] pt-4" aria-labelledby="one-rate">
            <h2 id="one-rate" className="serif text-2xl italic">How was it?</h2>
            <p className="text-[13px] text-[var(--ink-soft)]">{order.rating ? `You gave it ${order.rating.score} of 5. Change it if you like.` : "One to five. On its own, or with a word."}</p>
            <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Pick a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
              <Dots value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" />
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field" placeholder="A note for the kitchen, if you like" aria-label="A note for the kitchen" />
              <div><button type="submit" disabled={o.busy === "rating"} className="btn quiet text-[14px]">{o.busy === "rating" ? "Saving" : order.rating ? "Change it" : "Rate it"}</button></div>
            </form>
          </section>
        </main>
      </div>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </LinenFrame>
  );
}
