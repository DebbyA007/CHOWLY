"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { clockTime, mmss, promiseLabel } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Foot, GUEST_TABS, Header, Screen, TabBar } from "./chrome";
import { preloadMenu } from "./use-menu";
import { orderClock, useMyOrders, useOrder, type Clock } from "./use-order";
import { selectOrder } from "./selection";
import { ConnectionBar, useFreshness } from "./connection";
import { abandonPlacement, isPending, retryPlacement, type Pending } from "./pending";
import { OrderSkeleton } from "./skeleton";
import { Vessel, type VesselState } from "./vessel";
import { useArrival } from "./arrival";

const CIRCUMFERENCE = 2 * Math.PI * 82;
// Once the promise is spent, the arc closes again and ochre crosses to red over this long.
const CROSS_SECONDS = 120;
const OCHRE = [210, 162, 76];
const RED = [201, 72, 47];
const tone = (k: number) => `rgb(${OCHRE.map((c, i) => Math.round(c + ((RED[i] ?? c) - c) * k)).join(",")})`;

// One value drives the ring: t, elapsed over promised. Below 1 the arc empties as the
// minutes are used, in ochre. From 1 to 1 plus the crossfade the arc closes again while
// ochre becomes red. Past that it holds, full and red. The tone is one CSS variable the
// numerals, the pill, the tab and the stepper all read, so nothing on the screen can
// disagree with the ring.
function ringAt(t: number, crossT: number): { offset: number; k: number } {
  if (t <= 1) return { offset: CIRCUMFERENCE * Math.max(0, t), k: 0 };
  const k = crossT > 0 ? Math.min(1, (t - 1) / crossT) : 1;
  return { offset: CIRCUMFERENCE * (1 - k), k };
}

// Screens 3 and 4. With an id, that order is selected for the session first.
export function OrderScreen({ id }: { id?: string } = {}) {
  const mine = useMyOrders();
  useEffect(() => {
    if (id) selectOrder(id);
  }, [id]);
  const o = useOrder(mine.current && !isPending(mine.current.id) ? mine.current.id : null);
  const order = o.order ?? mine.current;
  const clock = order ? orderClock(order, o.now) : null;
  const fresh = useFreshness(o.error ?? mine.error, o.seenAt ?? mine.seenAt);
  return (
    <div className="ring-scope">
      {order && clock ? <OrderBody order={order} clock={clock} api={o} open={mine.open} others={mine.others} pending={mine.pending} fresh={fresh} /> : mine.loaded ? <NoOrder /> : <OrderSkeleton />}
      <Foot>
        <TabBar tabs={GUEST_TABS} active="Order" tone="ring" onHover={(label) => { if (label === "Menu") preloadMenu(); }} />
      </Foot>
    </div>
  );
}

function NoOrder() {
  return (
    <Screen>
      <Header title="Your order" subtitle="The Golden Gate" />
      <div className="px-[22px]">
        <p className="text-[13.5px] leading-[1.55] text-fg-muted">Nothing ordered yet. Anything you add from the menu shows up here, with the kitchen&apos;s time.</p>
        <Link href="/menu" className="btn-primary press mt-5" onMouseEnter={preloadMenu} onFocus={preloadMenu}>Menu</Link>
      </div>
    </Screen>
  );
}

type Api = ReturnType<typeof useOrder>;

type Fresh = { stale: boolean; since: number | null };

function OrderBody({ order, clock, api, open, others, pending, fresh }: { order: SerializedOrder; clock: Clock; api: Api; open: SerializedOrder[]; others: SerializedOrder[]; pending: Pending | null; fresh: Fresh }) {
  const root = useRef<HTMLDivElement>(null);
  // Still on its way to the kitchen, or refused: the same screen, said plainly.
  const sending = isPending(order.id);
  const failed = sending && pending?.status === "failed";
  const entrance = useArrival();
  const ring = useRef<SVGCircleElement>(null);
  const reduce = usePrefersReducedMotion();
  const [sheet, setSheet] = useState<"report" | "rate" | null>(null);
  const isLate = clock.state === "late";
  const lateMinutes = Math.floor(clock.lateSeconds / 60);
  const placedAt = new Date(order.placedAt);
  const served = !!order.servedAt;
  const paid = !!order.paidAt;
  // Three steps the data can vouch for: placed, served, paid. Nothing is invented between.
  const steps = [
    { name: "Order placed", time: `${clockTime(placedAt)}, promised in ${order.waitMinutes} minutes`, done: true },
    { name: "Served", time: served ? clockTime(order.servedAt!) : isLate ? "Any moment" : `About ${clockTime(order.dueAt)}`, done: served },
    { name: "Paid", time: paid ? clockTime(order.paidAt!) : served ? "When you are ready" : "After it is served", done: paid },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const current = doneCount - 1;
  const lastDone = useRef(doneCount);
  // The arc's first value, set once per order: React never writes the offset again,
  // because the animation owns it and a per-tick rewrite would step it backwards.
  const [firstOffset] = useState(() => (reduce ? CIRCUMFERENCE * Math.min(1, clock.elapsedSeconds / Math.max(1, clock.promisedSeconds)) : CIRCUMFERENCE));
  const drawnFor = useRef<string | null>(null);

  // The ring. One animation from real elapsed time against placedAt, so a refresh lands
  // exactly where the clock is and the arc sweeps continuously from there. Under
  // reduced motion the arc and the tone are set once per state and the stylesheet steps
  // them slowly.
  useEffect(() => {
    const scope = root.current?.closest<HTMLElement>(".ring-scope");
    const el = ring.current;
    if (!scope || !el) return;
    const promisedS = order.waitMinutes * 60;
    const crossT = CROSS_SECONDS / promisedS;
    const apply = (t: number) => {
      const { offset, k } = ringAt(t, crossT);
      el.style.strokeDashoffset = String(offset);
      scope.style.setProperty("--ring-tone", tone(k));
    };
    if (order.status !== "PLACED") {
      el.style.strokeDashoffset = "0";
      scope.style.setProperty("--ring-tone", "var(--accent)");
      return;
    }
    const tNow = (Date.now() - new Date(order.placedAt).getTime()) / 1000 / promisedS;
    const tEnd = 1 + crossT;
    if (reduce) {
      apply(tNow >= 1 ? tEnd : tNow);
      return;
    }
    if (tNow >= tEnd) {
      apply(tEnd);
      return;
    }
    const proxy = { t: Math.max(0, tNow) };
    // When the kitchen's order replaces the provisional one the arc is already on
    // screen, so it carries on from where it is instead of drawing in again.
    const continuing = drawnFor.current !== null && isPending(drawnFor.current) && !isPending(order.id);
    drawnFor.current = order.id;
    let draw: ReturnType<typeof animate> | null = null;
    if (continuing) {
      apply(proxy.t);
    } else {
      // The arc draws in from empty to where the clock is, then the sweep takes over.
      el.style.strokeDashoffset = String(CIRCUMFERENCE);
      scope.style.setProperty("--ring-tone", tone(ringAt(proxy.t, crossT).k));
      draw = animate(el, { strokeDashoffset: [CIRCUMFERENCE, ringAt(proxy.t, crossT).offset], duration: 700, ease: "outQuart" });
    }
    const sweep = animate(proxy, { t: tEnd, duration: Math.max(0, (tEnd - proxy.t) * promisedS * 1000), ease: "linear", delay: continuing ? 0 : 700, onUpdate: () => apply(proxy.t) });
    return () => {
      draw?.pause();
      sweep.pause();
    };
  }, [order.id, order.status, order.placedAt, order.waitMinutes, reduce]);

  // The entrance, every visit: the ring settles, the caption, the steps, the items.
  // Not again when the kitchen's order replaces the provisional one: that is the same
  // screen carrying on, and the pieces are already there.
  const enteredFor = useRef<string | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const continuing = enteredFor.current !== null && isPending(enteredFor.current) && !isPending(order.id);
    enteredFor.current = order.id;
    if (continuing) return;
    const parts = [".pot-wrap", ".ring-wrap", ".caption", ".late-note", ".late-actions", ".step", ".items"].filter((s) => el.querySelector(s));
    if (!entrance) {
      utils.set(parts, { opacity: 1 });
      return;
    }
    if (reduce) {
      animate(parts, { opacity: [0, 1], duration: 200 });
      return;
    }
    const tl = createTimeline({ defaults: { ease: "outQuart" } })
      .add(".pot-wrap", { opacity: [0, 1], y: [6, 0], duration: 500 }, 40)
      .add(".ring-wrap", { opacity: [0, 1], scale: [0.96, 1], duration: 600 }, "-=380")
      .add(".caption", { opacity: [0, 1], duration: 400 }, "-=300");
    if (el.querySelector(".late-note")) tl.add(".late-note, .late-actions", { opacity: [0, 1], y: [6, 0], duration: 400, delay: stagger(90) }, "-=250");
    tl.add(".step", { opacity: [0, 1], x: [-6, 0], duration: 380, delay: stagger(70) }, "-=250").add(".items", { opacity: [0, 1], y: [10, 0], duration: 450 }, "-=200");
    return () => {
      tl.pause();
    };
    // once per mount of this order, not on every poll
  }, [order.id, reduce, entrance]);

  // Crossing the promise while the screen is open brings the note and the actions in.
  const wasLate = useRef(isLate);
  useEffect(() => {
    if (!isLate || wasLate.current) {
      wasLate.current = isLate;
      return;
    }
    wasLate.current = true;
    const els = root.current?.querySelectorAll<HTMLElement>(".late-note, .late-actions");
    if (els && els.length) animate(els, reduce ? { opacity: [0, 1], duration: 200 } : { opacity: [0, 1], y: [6, 0], duration: 420, ease: "outQuad", delay: stagger(90) });
  }, [isLate, reduce]);

  // A step completing swells its dot once.
  useEffect(() => {
    if (doneCount <= lastDone.current) {
      lastDone.current = doneCount;
      return;
    }
    lastDone.current = doneCount;
    if (reduce) return;
    const dot = root.current?.querySelectorAll<HTMLElement>(".dot")[doneCount - 1];
    if (dot) animate(dot, { scale: [1, 1.35, 1], duration: 500, ease: "outQuad" });
  }, [doneCount, reduce]);

  useEffect(() => {
    if (!sheet) return;
    const el = root.current?.querySelector<HTMLElement>(".sheet");
    if (el) animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [28, 0], duration: 240, ease: "outQuad" });
  }, [sheet, reduce]);

  const centreLabel = clock.state === "waiting" ? "Ready in" : clock.state === "late" ? "Elapsed" : clock.state === "served" ? "Served" : "Paid";
  // The vessel matches the order: a pot for food, a glass for a drinks-only order. It
  // simmers or pours while the order is being made, comes to the boil when it is late,
  // and turns into the plated dish or the full glass once it has been served.
  const vesselState: VesselState = clock.state === "late" ? "late" : clock.state === "waiting" ? "cooking" : "served";
  const centreValue = clock.state === "waiting" ? mmss(clock.remainingSeconds) : clock.state === "late" ? mmss(clock.elapsedSeconds) : clockTime(clock.state === "served" ? order.servedAt! : order.paidAt!);
  return (
    <Screen>
      <div ref={root}>
        <Header title={sending ? "Your order" : `Order #${order.reference}`} subtitle={failed ? "Not sent" : sending ? "Sending to the kitchen" : isLate ? `${lateMinutes} ${lateMinutes === 1 ? "minute" : "minutes"} late` : "The Golden Gate"} subtitleTone={isLate || failed ? "late" : "muted"} pill={`Table ${order.tableNo}`} pillTone="ring" />
        <ConnectionBar stale={fresh.stale} since={fresh.since} what="your order" />
        {open.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto px-[22px] pb-3" role="tablist" aria-label="Open orders">
            {open.map((o) => (
              <button key={o.id} type="button" role="tab" aria-selected={o.id === order.id} data-switch={o.id} onClick={() => selectOrder(o.id)} className="chip press !px-[14px] !py-2 !text-[12.5px]">{o.reference ? `#${o.reference}` : "Sending"}</button>
            ))}
          </div>
        ) : null}
        {failed ? (
          <div className="mx-[22px] mb-6 rounded-[12px] border border-[color:var(--late)] p-4" role="alert" data-failed>
            <p className="text-[14px] font-semibold text-late">The kitchen did not get this order.</p>
            <p className="mt-[6px] text-[13px] leading-[1.5] text-fg-muted">{pending?.message} Your order is kept on the menu.</p>
            <div className="mt-4 flex flex-col gap-[10px]">
              {pending && pending.payload.items.length > 0 ? <button type="button" data-retry onClick={retryPlacement} className="btn-primary press !py-[15px] !text-[14px]">Try again</button> : null}
              <Link href="/menu" data-go-menu onClick={abandonPlacement} className="btn-outline press !py-[15px] !text-[14px]" onMouseEnter={preloadMenu} onFocus={preloadMenu}>Back to the menu</Link>
            </div>
          </div>
        ) : null}
        <div className={`flex flex-col items-center px-[22px] pb-[26px] pt-[14px] ${failed ? "hidden" : ""}`} data-state={failed ? "failed" : sending ? "sending" : clock.state} data-clock={`t ${(clock.elapsedSeconds / Math.max(1, clock.promisedSeconds)).toFixed(3)}`}>
          <div className="pot-wrap mb-[2px]" style={{ opacity: 0 }}><Vessel kind={order.kind} state={vesselState} /></div>
          <div className="ring-wrap relative h-[184px] w-[184px]" style={{ opacity: 0 }}>
            <svg width="184" height="184" viewBox="0 0 184 184" className="block" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
              <circle className="ring-track" cx="92" cy="92" r="82" fill="none" stroke={isLate ? "var(--track-late)" : "var(--track)"} strokeWidth="9" />
              <circle ref={ring} className="ring-progress" cx="92" cy="92" r="82" fill="none" strokeWidth="9" strokeDasharray={CIRCUMFERENCE} style={{ strokeDashoffset: firstOffset }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11.5px]" style={{ color: isLate ? "var(--ring-tone)" : "var(--fg-muted)" }}>{centreLabel}</p>
              <p data-digits className={`tabular mt-[2px] font-medium leading-[1.1] tracking-[-0.03em] ${clock.state === "waiting" || clock.state === "late" ? "text-[40px]" : "text-[30px]"}`} style={{ color: isLate ? "var(--ring-tone)" : "var(--fg)" }}>{centreValue}</p>
            </div>
          </div>
          <p className="caption mt-4 text-[12px] text-fg-muted" style={{ opacity: 0 }}>{promiseLabel(order.waitMinutes)} · placed {clockTime(placedAt)}</p>
          {sending ? <p className="mt-3 flex items-center gap-2 text-[12.5px] text-fg-muted" data-sending><span className="spinner" aria-hidden="true" />Sending to the kitchen</p> : null}
          {sending ? null : isLate ? (
            <>
              <p className="late-note pretty mt-5 text-center text-[13.5px] leading-[1.55]">Sorry, your food is taking longer than we said. It&apos;s with the chef now.</p>
              <div className="late-actions mt-5 flex w-full flex-col gap-[10px]">
                <button type="button" data-report onClick={() => setSheet("report")} className="btn-outline press !py-[15px] !text-[14px]">Report a problem</button>
                <button type="button" data-rate-open onClick={() => setSheet("rate")} className="btn-outline press !py-[15px] !text-[14px]">{order.rating ? "Change your rating" : "Rate your order"}</button>
              </div>
            </>
          ) : served && !paid ? (
            <div className="late-actions mt-5 flex w-full flex-col gap-[10px]">
              <p className="pretty text-center text-[13.5px] leading-[1.55] text-fg-muted">Settle the bill whenever you are ready.</p>
              <Link href="/pay" data-go-pay className="btn-primary press !py-[17px] !text-[15px]">Pay {order.total}</Link>
              {order.rating ? <p className="mt-1 text-center text-[13.5px] leading-[1.55]">You rated it {order.rating.score} of 5.</p> : null}
              <button type="button" data-rate-open onClick={() => setSheet("rate")} className="btn-outline press !py-[15px] !text-[14px]">{order.rating ? "Change your rating" : "Rate your order"}</button>
              {api.late ? <button type="button" data-report onClick={() => setSheet("report")} className="btn-outline press !py-[15px] !text-[14px]">Report a problem</button> : null}
            </div>
          ) : paid ? (
            <div className="late-actions mt-5 flex w-full flex-col gap-[10px]">
              {order.rating ? <p className="text-center text-[13.5px] leading-[1.55]">You rated it {order.rating.score} of 5.</p> : null}
              <button type="button" data-rate-open onClick={() => setSheet("rate")} className="btn-outline press !py-[15px] !text-[14px]">{order.rating ? "Change your rating" : "Rate your order"}</button>
            </div>
          ) : null}
        </div>
        <ol className={`px-[22px] ${isLate ? "pt-1" : ""} ${failed ? "hidden" : ""}`} aria-label="Progress">
          {steps.map((step, i) => {
            const pending = !step.done;
            return (
              <li key={step.name} className="step flex gap-[15px]" style={{ opacity: 0 }}>
                <div className="flex w-[12px] shrink-0 flex-col items-center">
                  <span className="dot mt-[5px] block h-[11px] w-[11px] rounded-full border" style={{ background: pending ? "transparent" : "var(--ring-tone)", borderColor: pending ? "var(--pending)" : "var(--ring-tone)" }} aria-hidden="true" />
                  {i < steps.length - 1 ? <span className="w-px flex-1" style={{ background: pending ? "var(--pending)" : "var(--ring-tone)" }} aria-hidden="true" /> : null}
                </div>
                <div className="flex-1 pb-6">
                  <p className={`text-[14.5px] ${i === current ? "font-semibold" : ""} ${pending ? "text-fg-muted" : "text-fg"}`} aria-current={i === current ? "step" : undefined}>{step.name}</p>
                  <p className="mt-[3px] text-[11.5px] text-fg-muted">{step.time}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <section className="items card fibre mx-[22px] mb-6 px-[18px] pb-4 pt-[18px]" style={{ opacity: 0 }} aria-label="Items">
          {order.items.map((line) => (
            <div key={line.id} className="flex items-baseline justify-between py-[7px] text-[14px]">
              <span><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.name}</span>
              <span className="tabular struck font-semibold">{line.subtotal}</span>
            </div>
          ))}
          <div className="rule mt-[10px]" />
          <div className="flex items-baseline justify-between pt-[13px]">
            <span className="text-[12.5px] text-fg-muted">Total</span>
            <span className="serif struck tabular text-[24px]">{order.subtotal}</span>
          </div>
        </section>
        {api.notice ? <p role="status" className="px-[22px] pb-4 text-[13px] font-semibold text-fg">{api.notice}</p> : null}
        {clock.state === "served" || clock.state === "paid" ? (
          <div className="items px-[22px] pb-6" style={{ opacity: 0 }}>
            <div className="flex flex-col gap-[10px]">
              {clock.state === "paid" ? <Link href="/pay" data-go-receipt className="btn-outline press">See the receipt</Link> : null}
              <Link href="/menu" data-go-menu className="btn-outline press" onMouseEnter={preloadMenu} onFocus={preloadMenu}>Order something else</Link>
            </div>
          </div>
        ) : null}
        {others.length > 0 ? (
          <section className="items px-[22px] pb-8" style={{ opacity: 0 }} aria-labelledby="earlier">
            <h2 id="earlier" className="text-[12.5px] text-fg-muted">Earlier orders</h2>
            <ul className="mt-2">
              {others.map((o) => {
                const c = orderClock(o, null);
                return (
                  <li key={o.id} className="border-t border-[color:var(--hairline)]">
                    <Link href={`/order/${o.id}`} data-earlier={o.id} className="press flex items-baseline justify-between gap-3 py-3" onClick={() => selectOrder(o.id)}>
                      <span className="min-w-0"><span className="font-semibold">#{o.reference}</span><span className="ml-2 text-[12.5px] text-fg-muted">{clockTime(o.placedAt)} · {o.items.reduce((n, l) => n + l.quantity, 0)} {o.items.reduce((n, l) => n + l.quantity, 0) === 1 ? "item" : "items"}</span></span>
                      <span className="tabular shrink-0 text-[13px]"><span className="text-fg-muted">{c.state === "paid" ? "Paid" : c.state === "served" ? "Served" : c.state === "late" ? "Late" : "Placed"}</span><span className="ml-2 font-semibold">{o.total}</span></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {sheet ? <ActionSheet kind={sheet} api={api} order={order} onClose={() => setSheet(null)} /> : null}
      </div>
    </Screen>
  );
}

// Report a problem, or rate the order. A sheet over the screen, the same surface and
// pills as everything else. The report is the assignment's complaint; the server
// accepts it only once the order is late.
export function ActionSheet({ kind, api, order, onClose }: { kind: "report" | "rate"; api: Api; order: SerializedOrder; onClose: () => void }) {
  const [text, setText] = useState("");
  const [score, setScore] = useState<number | null>(order.rating?.score ?? null);
  const [note, setNote] = useState(order.rating?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const reduce = usePrefersReducedMotion();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (kind === "report") {
      if (text.trim().length < 3) {
        setError("Tell us what went wrong in a few words.");
        return;
      }
      if (await api.report(text.trim())) onClose();
      return;
    }
    if (score === null) {
      setError("Pick a number from 1 to 5.");
      return;
    }
    if (await api.rate(score, note)) onClose();
  }
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" role="presentation">
      <button type="button" className="absolute inset-0 h-full w-full bg-[rgba(20,18,15,0.7)]" aria-label="Close" onClick={onClose} />
      <form aria-label={kind === "report" ? "Report a problem" : "Rate your order"} className="sheet relative w-full max-w-[430px] rounded-t-[16px] bg-surface fibre px-[22px] pb-[30px] pt-5" style={{ opacity: 0 }} onSubmit={submit} noValidate data-section={kind === "report" ? "complaint" : "rating"}>
        <h2 className="serif text-[25px] leading-[1.05]">{kind === "report" ? "Report a problem" : "Rate your order"}</h2>
        {kind === "report" ? (
          <>
            <p className="mt-[5px] text-[12.5px] text-fg-muted">We promised {order.waitMinutes} minutes. Tell us what went wrong and a manager will come over.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={500} aria-label="What went wrong" className="mt-4 block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[16px] text-fg" />
          </>
        ) : (
          <>
            <p className="mt-[5px] text-[12.5px] text-fg-muted">{order.rating ? `You gave it ${order.rating.score} of 5. Change it if you like.` : "How was it, from 1 to 5?"}</p>
            <div role="radiogroup" aria-label="Score" className="mt-4 flex gap-[9px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={score === n} aria-label={`${n} of 5`} onClick={(e) => { setScore(n); if (!reduce) animate(e.currentTarget, { scale: [1, 1.12, 1], duration: 280, ease: "outQuad" }); }} className="chip press tabular !px-[15px] !py-[11px] !text-[13.5px] !font-semibold">{n}</button>
              ))}
            </div>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} aria-label="A note for the kitchen" placeholder="Anything to add?" className="mt-4 block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[16px] text-fg placeholder:text-fg-muted" />
          </>
        )}
        {error ? <p role="alert" className="mt-3 text-[13px] font-semibold text-late">{error}</p> : null}
        <button type="submit" data-send className="btn-primary press mt-5" disabled={api.busy !== null}>{api.busy ? "Sending" : kind === "report" ? "Send" : "Send rating"}</button>
        <button type="button" onClick={onClose} className="press mt-4 block w-full text-center text-[12.5px] text-fg-muted underline">Not now</button>
      </form>
    </div>
  );
}
