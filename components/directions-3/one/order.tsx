"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline } from "animejs";
import { DemoControls } from "@/components/walkthrough/demo-controls";
import { Dish } from "@/components/walkthrough/dishes";
import { useOrder } from "@/components/walkthrough/use-order";
import { Lamp } from "./lamp";
import { PASS_PALETTE, PassFrame, Peg, base } from "./frame";

function Punch({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-3">
      {[1, 2, 3, 4, 5].map((n) => {
        const punched = value !== null && n <= value;
        return (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} onClick={() => onChange(n)} className="tabular flex h-11 w-11 items-center justify-center rounded-full border-[3px] text-base font-bold" style={{ borderColor: punched ? "var(--soot)" : "var(--ink)", background: punched ? "var(--soot)" : "var(--paper)", color: punched ? "var(--paper-fresh)" : "var(--ink)" }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

// The customer's order: a ticket pegged to the rail under its own lamp, and the lamp is
// the clock. Its pool shrinks as the promised minutes are used and its light cools and
// dims as the order runs late, while the paper ages. Served holds warm; paid puts it out.
export function PassOrder({ id }: { id: string }) {
  const o = useOrder(id);
  const root = useRef<HTMLDivElement>(null);
  const [desc, setDesc] = useState("");
  const [slipScore, setSlipScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY" | "CASH">("CARD");
  const order = o.order;

  useEffect(() => {
    if (!o.justPaid) return;
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate([".receipt", ".paid-stamp"], { opacity: [0, 1], duration: 200 });
        return;
      }
      createTimeline()
        .add(".receipt", { opacity: [0, 1], y: [-26, 0], duration: 420, ease: "outQuad" })
        .add(".paid-stamp", { opacity: [0, 1], scale: [1.9, 1], rotate: [-16, -9], duration: 380, ease: "outBack(2)" }, "+=120");
    });
    return () => scope.revert();
  }, [o.justPaid]);

  if (o.error && !order) {
    return (
      <PassFrame>
        <main className="mx-auto max-w-6xl px-4 pt-12 sm:px-8"><section className="paper torn-both mx-auto max-w-md px-6 pb-4"><h1 className="display-print mt-4 text-3xl">Nothing on this peg</h1><p className="mt-2 text-sm text-ink-soft">{o.error.message} An order shows only to the browser that placed it.</p><Link href={`${base}/menu`} className="stamp-button mt-6 inline-block bg-char-ink px-4 py-2.5 text-paper">Back to the strips</Link></section></main>
      </PassFrame>
    );
  }
  if (!order) return <PassFrame><main className="mx-auto max-w-6xl px-4 pt-12 text-sm text-ink-soft sm:px-8">Finding your ticket.</main></PassFrame>;

  const caption = o.state === "waiting" ? `of ${order.waitMinutes} minutes promised` : o.state === "late" ? `past the ${order.waitMinutes} minutes promised` : o.state === "served" ? "off the pass" : "settled";
  const lateBy = `${Math.floor(o.lateSeconds / 60)} min ${o.lateSeconds % 60} s`;
  const payment = order.payment;
  return (
    <PassFrame>
      <main ref={root} className="heat relative mx-auto w-full max-w-6xl px-4 pb-24 pt-[236px] sm:px-8 sm:pt-[280px]" style={{ ["--heat" as string]: o.progress.toFixed(3) }} data-state={o.state} data-clock={`lamp heat ${o.progress.toFixed(2)}, reach ${o.reach.toFixed(2)}`} aria-label={`Order ${order.reference}`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
          <Lamp seed={9} width={300} reach={o.reach} cord={26} className="sm:hidden" />
          <Lamp seed={9} width={360} reach={o.reach} cord={40} className="hidden sm:block" />
        </div>
        <article className="ticket paper torn-both relative mx-auto max-w-lg px-5 pb-4 sm:px-8">
          <Peg className="absolute left-1/2 top-0 -translate-x-1/2" />
          <div className="mt-8 flex items-baseline justify-between gap-4 border-b-2 border-dashed border-ink pb-2">
            <h1 className="display-print text-2xl">{order.reference}</h1>
            <span className="text-sm font-bold">TABLE {order.tableNo}</span>
          </div>
          <figure className="pt-5 text-center" aria-label={`${o.digits} ${caption}`}>
            <p data-digits className={`display tabular text-[clamp(3.6rem,13vw,6.4rem)] leading-none ${o.state === "served" || o.state === "paid" ? "text-served-ink" : "text-ink"}`}>
              {o.state === "late" ? <><span className="text-char-ink">+</span>{o.digits.slice(1)}</> : o.digits}
            </p>
            <figcaption className="mt-2 text-sm text-ink-soft">{caption}</figcaption>
          </figure>
          <p className="mt-4 text-center text-sm text-ink-soft" aria-live="polite">
            {order.status === "PLACED" ? `Fired${o.when(order.placedAt) ? ` at ${o.when(order.placedAt)}` : ""}. The kitchen promised ${order.waitMinutes} minutes.` : order.status === "SERVED" ? `Served${o.when(order.servedAt) ? ` at ${o.when(order.servedAt)}` : ""}${order.staff.waiter ? ` by ${order.staff.waiter.name}` : ""}.${order.staff.chef ? ` Cooked by ${order.staff.chef.name}` : ""}${order.staff.bartender ? `, drinks by ${order.staff.bartender.name}` : ""}.` : `Paid${o.when(order.paidAt) ? ` at ${o.when(order.paidAt)}` : ""}.`}
          </p>
          <ul className="mt-5 border-y-2 border-dashed border-ink py-2 text-sm" aria-label="Lines">
            {order.items.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 py-1">
                <span className="flex items-center gap-2"><span className="plate3 h-9 w-9" aria-hidden="true"><Dish id={line.menuItemId} material="gouache" palette={PASS_PALETTE} size={30} /></span>{line.name} <span className="font-bold text-char-ink">x{line.quantity}</span></span>
                <span className="tabular">{line.subtotal.replace("₦", "")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between text-base font-bold"><span>TOTAL</span><span className="tabular">{order.total}</span></p>
          {o.notice ? <p role="status" className="mt-3 text-sm font-bold text-served-ink">{o.notice}</p> : null}
          {order.status === "SERVED" && !payment ? (
            <section className="mt-6 border-t-2 border-dashed border-ink pt-4" aria-labelledby="one-settle" data-section="settle">
              <h2 id="one-settle" className="text-base font-bold">SETTLE {order.total}</h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-3 flex flex-wrap gap-2">
                {([["CARD", "Card"], ["MOBILE_MONEY", "Mobile money"], ["CASH", "Cash"]] as const).map(([v, label]) => (
                  <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className="border-2 px-3 py-1.5 text-sm font-bold" style={{ borderColor: method === v ? "var(--soot)" : "var(--ink)", background: method === v ? "var(--soot)" : "var(--paper)", color: method === v ? "var(--paper-fresh)" : "var(--ink)" }}>{label}</button>
                ))}
              </div>
              <button type="button" data-settle disabled={o.busy === "settle"} onClick={() => o.settle(method)} className="stamp-button mt-3 bg-served-ink px-4 py-2.5 text-paper">{o.busy === "settle" ? "Settling" : "Settle the ticket (pretend)"}</button>
            </section>
          ) : null}
          {o.late ? (
            <section className="mt-6 border-t-2 border-dashed border-char-ink pt-4" aria-labelledby="one-slip" data-section="complaint">
              <div className="flex items-baseline justify-between"><h2 id="one-slip" className="text-base font-bold text-char-ink">COMPLAINT SLIP</h2><span className="text-xs text-ink-soft">tear here</span></div>
              <p className="mt-1 text-xs text-ink-soft">The kitchen promised {order.waitMinutes} minutes and this ticket is {lateBy} past it. Tell the manager what went wrong; it prints on the rail.</p>
              {order.complaints.length > 0 ? <ul className="mt-2 text-xs">{order.complaints.map((c) => <li key={c.id} className="flex gap-2"><span className="font-bold text-char-ink">SENT</span><span className="text-ink-soft">{c.description}</span></li>)}</ul> : null}
              <form className="mt-3 flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); if (desc.trim().length < 3) { o.setNotice("Say what went wrong in a few words, so the manager can act on it."); return; } if (await o.sendComplaint(desc.trim(), slipScore)) { setDesc(""); setSlipScore(null); } }}>
                <label className="flex flex-col gap-1 text-xs font-bold">WHAT WENT WRONG<textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className="border-2 border-ink bg-paper px-2 py-1.5 text-sm font-normal" /></label>
                <div><p className="mb-2 text-xs font-bold">PUNCH A SCORE TOO, IF YOU WANT</p><Punch value={slipScore} onChange={setSlipScore} name="Score with the slip" /></div>
                <div><button type="submit" data-send disabled={o.busy === "complaint"} className="stamp-button bg-char-ink px-3.5 py-2 text-sm text-paper">{o.busy === "complaint" ? "Sending" : "Send the slip"}</button></div>
              </form>
            </section>
          ) : null}
          <form className="mt-6 border-t-2 border-dashed border-ink pt-4" aria-labelledby="one-rating" data-section="rating" onSubmit={async (e) => { e.preventDefault(); if (score === null) { o.setNotice("Punch a number from 1 to 5 first."); return; } await o.rate(score, note); }}>
            <h2 id="one-rating" className="text-base font-bold">HOW WAS IT</h2>
            <p className="mt-1 text-xs text-ink-soft">{order.rating ? `Punched ${order.rating.score} of 5. Punch again to change it.` : "Punch a number. On its own, or with a complaint slip."}</p>
            <div className="mt-3"><Punch value={score ?? order.rating?.score ?? null} onChange={setScore} name="Score" /></div>
            <label className="mt-3 flex flex-col gap-1 text-xs font-bold">NOTE FOR THE KITCHEN<input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="border-2 border-ink bg-paper px-2 py-1.5 text-sm font-normal" /></label>
            <div className="mt-3"><button type="submit" data-rate disabled={o.busy === "rating"} className="stamp-button bg-paper px-3.5 py-2 text-sm text-ink">{o.busy === "rating" ? "Punching" : order.rating ? "Punch it again" : "Punch it in"}</button></div>
          </form>
        </article>
        {payment ? (
          <section className="receipt paper torn-both relative mx-auto -mt-2 max-w-lg px-5 pb-4 sm:px-8" style={{ opacity: o.justPaid ? 0 : 1 }} aria-labelledby="one-receipt" data-section="receipt">
            <span className="paid-stamp pointer-events-none absolute right-6 top-8 border-[3px] border-char px-2 py-0.5 text-2xl font-bold text-char" style={{ transform: "rotate(-9deg)", opacity: o.justPaid ? 0 : 1, borderRadius: 4 }} aria-hidden="true">PAID</span>
            <div className="mt-5 flex items-baseline justify-between border-b-2 border-dashed border-ink pb-2"><h2 id="one-receipt" className="text-base font-bold">RECEIPT</h2><span className="text-xs text-ink-soft">{order.reference}, table {order.tableNo}</span></div>
            <ul className="py-2 text-sm">{order.items.map((line) => <li key={line.id} className="flex justify-between gap-3 py-0.5"><span>{line.name} <span className="font-bold text-char-ink">x{line.quantity}</span></span><span className="tabular">{line.subtotal.replace("₦", "")}</span></li>)}</ul>
            <p className="flex justify-between border-t-2 border-dashed border-ink pt-2 font-bold"><span>TOTAL</span><span className="tabular">{payment.amount}</span></p>
            <p className="mt-3 text-xs text-ink-soft">Paid by {payment.method === "CARD" ? "card" : payment.method === "CASH" ? "cash" : "mobile money"}.</p>
            <p className="mt-1 text-sm font-bold text-char-ink">Pretend payment. No money moved.</p>
            <p className="mt-3 text-xs text-ink-soft">Thank you for eating with us. The lamp is off.</p>
          </section>
        ) : null}
      </main>
      {order.status === "PLACED" ? <DemoControls waitMinutes={order.waitMinutes} busy={o.busy === "demo"} onFastForward={o.fastForward} /> : null}
    </PassFrame>
  );
}
