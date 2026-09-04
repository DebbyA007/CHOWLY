"use client";

import Link from "next/link";
import { useState } from "react";
import { Dish } from "@/components/walkthrough/dishes";
import { DemoControls } from "@/components/walkthrough/demo-controls";
import { useOrder } from "@/components/walkthrough/use-order";
import { GLAZE_PALETTE, GlazeFrame } from "./frame";

const base = "/directions-2/three";

function Beads({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] text-[14px] font-bold" style={{ background: value !== null && n <= value ? "var(--teal)" : "var(--white)", color: value !== null && n <= value ? "var(--white)" : "var(--ink)" }}>{n}</button>
      ))}
    </div>
  );
}

// Your plate on the terrazzo, and the room settling around it. The clock is the room.
export function GlazeOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const [desc, setDesc] = useState("");
  const [slipScore, setSlipScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;
  if (o.error && !order) {
    return (
      <GlazeFrame>
        <main className="mx-auto max-w-3xl px-5 py-10"><div className="glazed p-5"><h1 className="news text-3xl">Not your table</h1><p className="mt-2 text-[14px] text-[var(--ink-soft)]">{o.error.message} An order shows only to the browser that placed it.</p><Link href={`${base}/menu`} className="btn mt-4 inline-block text-[14px]">Back to the plates</Link></div></main>
      </GlazeFrame>
    );
  }
  if (!order) return <GlazeFrame><main className="mx-auto max-w-3xl px-5 py-10 text-[14px] text-[var(--ink-soft)]">Setting the place.</main></GlazeFrame>;
  const caption = o.state === "waiting" ? `of ${order.waitMinutes} minutes the kitchen promised` : o.state === "late" ? `past the ${order.waitMinutes} promised. The room has settled into evening.` : o.state === "served" ? "On the table." : "Settled. Thank you.";
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;
  return (
    <GlazeFrame progress={o.progress} state={o.state}>
      <main className="mx-auto max-w-3xl px-5 pb-32 pt-5">
        <p className="text-[13px] text-[var(--ink-soft)]">Order {order.reference}, table {order.tableNo}</p>
        <div className="plate room-plate relative mx-auto mt-3 flex aspect-square w-full max-w-[340px] flex-col items-center justify-center text-center">
          <svg viewBox="0 0 340 340" className="pointer-events-none absolute inset-0" aria-hidden="true"><path d="M 70 110 L 110 140 L 96 190 M 250 84 L 226 130 L 262 168 M 130 270 L 168 236 L 210 258" fill="none" stroke="#d6d1c6" strokeWidth="1" /><circle cx="170" cy="170" r="128" fill="none" stroke="#efeae0" strokeWidth="3" /></svg>
          <div className="flex gap-1" aria-hidden="true">{order.items.slice(0, 3).map((l) => <Dish key={l.id} id={l.menuItemId} material="glaze" palette={GLAZE_PALETTE} size={56} />)}</div>
          <p className="news tabular text-[clamp(3.2rem,15vw,4.6rem)] leading-none" aria-label={`${o.digits} ${caption}`} style={{ fontVariationSettings: '"opsz" 144' }}>{o.digits}</p>
          <p className="mt-1 max-w-[220px] text-[12px] leading-snug text-[var(--ink-soft)]">{caption}</p>
        </div>
        <p className="mt-4 text-center text-[13px] text-[var(--ink-soft)]" aria-live="polite">
          {order.status === "PLACED" ? `Ordered${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen promised ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Served${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
        </p>
        <ul className="glazed mt-5 divide-y divide-[#e6e1d6] px-4 py-1 text-[15px]" aria-label="Your dishes">
          {order.items.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 py-2"><span className="news text-[18px]">{l.name} <span className="text-[13px] text-[var(--ink-soft)]">x{l.quantity}</span></span><span className="tabular">{l.subtotal}</span></li>)}
          <li className="flex justify-between py-2 text-[17px] font-bold"><span>Total</span><span className="tabular">{order.total}</span></li>
        </ul>
        {o.notice ? <p role="status" className="mt-3 text-[14px] font-bold" style={{ color: "var(--teal)" }}>{o.notice}</p> : null}
        {order.status === "SERVED" && !order.payment ? (
          <section className="glazed mt-6 px-4 py-4" aria-labelledby="three-bill">
            <h2 id="three-bill" className="news text-2xl">The bill, {order.total}</h2>
            <p className="text-[13px] text-[var(--ink-soft)]">Pretend payment for the demo. No money moves, and the record says so.</p>
            <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
              {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="rounded-full border-[1.5px] border-[var(--ink)] px-3 py-1.5 text-[13px] font-bold" style={{ background: method === v ? "var(--ink)" : "var(--white)", color: method === v ? "var(--white)" : "var(--ink)" }}>{label}</button>)}
            </div>
            <button type="button" disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="btn mt-3 text-[14px]">{o.busy === "settle" ? "Settling" : "Settle (pretend)"}</button>
          </section>
        ) : null}
        {order.payment ? (
          <section className="glazed mt-6 px-4 py-4" aria-labelledby="three-receipt">
            <h2 id="three-receipt" className="news text-3xl">Settled. Thank you.</h2>
            <p className="mt-1 text-[13px] text-[var(--ink-soft)]">By {order.payment.method === "CARD" ? "card" : order.payment.method === "CASH" ? "cash" : "mobile money"}. {order.payment.amount}.</p>
            <p className="mt-2 text-[13px] font-bold" style={{ color: "var(--rust)" }}>Pretend payment. No money moved, and the record is marked pretend.</p>
          </section>
        ) : null}
        {o.late ? (
          <section className="glazed mt-6 px-4 py-4" aria-labelledby="three-word">
            <h2 id="three-word" className="news text-2xl">A word for the floor</h2>
            <p className="text-[13px] text-[var(--ink-soft)]">The kitchen promised {order.waitMinutes} minutes and this is {lateBy} past it. Say what went wrong; the floor sees it.</p>
            {order.complaints.length > 0 ? <ul className="mt-2 text-[13px]">{order.complaints.map((c) => <li key={c.id}><span className="font-bold">Sent.</span> {c.description}</li>)}</ul> : null}
            <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words."); return; } if (await o.sendComplaint(desc.trim(), slipScore)) { setDesc(""); setSlipScore(null); } }}>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="field" aria-label="What went wrong" />
              <Beads value={slipScore} onChange={setSlipScore} name="Score with the word" />
              <div><button type="submit" disabled={o.busy === "complaint"} className="btn text-[14px]">{o.busy === "complaint" ? "Sending" : "Send"}</button></div>
            </form>
          </section>
        ) : null}
        <section className="mt-6" aria-labelledby="three-rate">
          <h2 id="three-rate" className="news text-2xl">How was it?</h2>
          <p className="text-[13px] text-[var(--ink-soft)]">{order.rating ? `You gave it ${order.rating.score} of 5. Change it if you like.` : "One to five. On its own, or with a word."}</p>
          <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Pick a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
            <Beads value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" />
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field" placeholder="A note for the kitchen, if you like" aria-label="A note for the kitchen" />
            <div><button type="submit" disabled={o.busy === "rating"} className="btn quiet text-[14px]">{o.busy === "rating" ? "Saving" : order.rating ? "Change it" : "Rate it"}</button></div>
          </form>
        </section>
      </main>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </GlazeFrame>
  );
}
