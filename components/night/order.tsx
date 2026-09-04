"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { clockTime, mmss, promiseLabel } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Foot, GUEST_TABS, Header, Screen, TabBar } from "./chrome";
import { firstVisit } from "./once";
import { preloadMenu } from "./use-menu";
import { orderClock, useMyOrders, useOrder, type Clock } from "./use-order";

const CIRCUMFERENCE = 2 * Math.PI * 82;
const KITCHEN_AFTER_SECONDS = 120;

// Screens 3 and 4. The countdown ring is the feature: its arc empties as the promised
// minutes are used, driven from placedAt so it survives a refresh, and it counts up in
// late red once the promise is spent. Ochre to red is a slow crossfade on the ring,
// the numerals, the pill and the tab, never a snap. Then the stepper, then the items.
export function OrderScreen() {
  const mine = useMyOrders();
  const o = useOrder(mine.current?.id ?? null);
  const order = o.order ?? mine.current;
  const clock = order ? orderClock(order, o.now) : null;
  const tone = clock?.state === "late" ? "late" : "accent";
  return (
    <>
      {order && clock ? <OrderBody order={order} clock={clock} api={o} /> : <NoOrder loaded={mine.loaded} />}
      <Foot>
        <TabBar tabs={GUEST_TABS} active="Order" tone={tone} onHover={(label) => { if (label === "Menu") preloadMenu(); }} />
      </Foot>
    </>
  );
}

function NoOrder({ loaded }: { loaded: boolean }) {
  return (
    <Screen>
      <Header title="Your order" subtitle="The Golden Gate" />
      <div className="px-[22px]">
        <p className="text-[13.5px] leading-[1.55] text-fg-muted">{loaded ? "Nothing ordered yet. Anything you add from the menu shows up here, with the kitchen's time." : "Finding your order."}</p>
        {loaded ? <Link href="/menu" className="btn-primary press mt-5" onMouseEnter={preloadMenu} onFocus={preloadMenu}>Menu</Link> : null}
      </div>
    </Screen>
  );
}

type Api = ReturnType<typeof useOrder>;

function OrderBody({ order, clock, api }: { order: SerializedOrder; clock: Clock; api: Api }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [sheet, setSheet] = useState<"report" | "rate" | null>(null);
  const isLate = clock.state === "late";
  const lateMinutes = Math.floor(clock.lateSeconds / 60);
  const colour = isLate ? "var(--late)" : "var(--accent)";
  const arc = clock.state === "waiting" ? clock.fraction : 1;
  const placedAt = new Date(order.placedAt);
  const kitchenAt = new Date(placedAt.getTime() + KITCHEN_AFTER_SECONDS * 1000);
  const inKitchen = clock.elapsedSeconds >= KITCHEN_AFTER_SECONDS || !!order.servedAt;
  const served = !!order.servedAt;
  const steps = [
    { name: "Order placed", time: clockTime(placedAt), done: true },
    { name: "In the kitchen", time: inKitchen ? (isLate ? `Since ${clockTime(kitchenAt)}` : clockTime(kitchenAt)) : "Shortly", done: inKitchen },
    { name: "Ready to serve", time: served ? clockTime(order.servedAt!) : isLate ? "Any moment" : `About ${clockTime(order.dueAt)}`, done: served },
    { name: "Served", time: served ? clockTime(order.servedAt!) : "At your table", done: served },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const current = Math.min(doneCount, steps.length) - 1;
  const lastDone = useRef(doneCount);

  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".ring-wrap", ".caption", ".step", ".items"];
      if (self?.matches.reduceMotion || !firstVisit(`order-${order.id}`)) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".ring-wrap", { opacity: [0, 1], scale: [0.96, 1], duration: 600 }, 60)
        .add(".caption", { opacity: [0, 1], duration: 400 }, "-=300")
        .add(".step", { opacity: [0, 1], x: [-6, 0], duration: 380, delay: stagger(70) }, "-=250")
        .add(".items", { opacity: [0, 1], y: [10, 0], duration: 450 }, "-=200");
    });
    return () => scope.revert();
    // the entrance runs once per order, not on every poll
  }, [order.id]);

  // A step completing fills its dot: one small swell, then still.
  useEffect(() => {
    if (doneCount <= lastDone.current) {
      lastDone.current = doneCount;
      return;
    }
    lastDone.current = doneCount;
    if (reduce) return;
    const dots = root.current?.querySelectorAll<HTMLElement>(".dot");
    const dot = dots?.[doneCount - 1];
    if (dot) animate(dot, { scale: [1, 1.35, 1], duration: 500, ease: "outQuad" });
  }, [doneCount, reduce]);

  // Crossing the promise brings the note and the two actions in; they were not there at mount.
  useEffect(() => {
    if (!isLate) return;
    const els = root.current?.querySelectorAll<HTMLElement>(".late-note, .late-actions");
    if (!els || els.length === 0) return;
    animate(els, reduce ? { opacity: [0, 1], duration: 200 } : { opacity: [0, 1], y: [6, 0], duration: 420, ease: "outQuad", delay: stagger(90) });
  }, [isLate, reduce]);

  useEffect(() => {
    if (!sheet) return;
    const el = root.current?.querySelector<HTMLElement>(".sheet");
    if (el) animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [28, 0], duration: 240, ease: "outQuad" });
  }, [sheet, reduce]);

  const centreLabel = clock.state === "waiting" ? "Ready in" : clock.state === "late" ? "Elapsed" : clock.state === "served" ? "Served" : "Paid";
  const centreValue = clock.state === "waiting" ? mmss(clock.remainingSeconds) : clock.state === "late" ? mmss(clock.elapsedSeconds) : clockTime(clock.state === "served" ? order.servedAt! : order.paidAt!);
  return (
    <Screen>
      <div ref={root}>
        <Header title={`Order #${order.reference}`} subtitle={isLate ? `${lateMinutes} ${lateMinutes === 1 ? "minute" : "minutes"} late` : "The Golden Gate"} subtitleTone={isLate ? "late" : "muted"} pill={`Table ${order.tableNo}`} pillTone={isLate ? "late" : "accent"} />
        <div className="flex flex-col items-center px-[22px] pb-[26px] pt-[14px]" data-state={clock.state} data-clock={`ring ${Math.round(arc * 100)}%`}>
          <div className="ring-wrap relative h-[184px] w-[184px]" style={{ opacity: 0 }}>
            <svg width="184" height="184" viewBox="0 0 184 184" className="block" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
              <circle className="ring-track" cx="92" cy="92" r="82" fill="none" stroke={isLate ? "var(--track-late)" : "var(--track)"} strokeWidth="9" />
              <circle className="ring-progress" cx="92" cy="92" r="82" fill="none" stroke={colour} strokeWidth="9" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - arc)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="tone text-[11.5px]" style={{ color: isLate ? "var(--late)" : "var(--fg-muted)" }}>{centreLabel}</p>
              <p data-digits className={`tone tabular mt-[2px] leading-[1.1] ${clock.state === "waiting" || clock.state === "late" ? "text-[40px]" : "text-[30px]"} font-medium tracking-[-0.03em]`} style={{ color: isLate ? "var(--late)" : "var(--fg)" }}>{centreValue}</p>
            </div>
          </div>
          <p className="caption mt-4 text-[12px] text-fg-muted" style={{ opacity: 0 }}>{promiseLabel(order.waitMinutes)} · placed {clockTime(placedAt)}</p>
          {isLate ? (
            <>
              <p className="late-note pretty mt-5 text-center text-[13.5px] leading-[1.55]">Sorry, your food is taking longer than we said. It&apos;s with the chef now.</p>
              <div className="late-actions mt-5 flex w-full flex-col gap-[10px]">
                <button type="button" data-report onClick={() => setSheet("report")} className="btn-outline press !py-[15px] !text-[14px]">Report a problem</button>
                <button type="button" data-rate-open onClick={() => setSheet("rate")} className="btn-outline press !py-[15px] !text-[14px]">Rate your order</button>
              </div>
            </>
          ) : null}
        </div>
        <ol className={`px-[22px] ${isLate ? "pt-1" : ""}`} aria-label="Progress">
          {steps.map((step, i) => {
            const pending = !step.done;
            return (
              <li key={step.name} className="step flex gap-[15px]" style={{ opacity: 0 }}>
                <div className="flex w-[12px] shrink-0 flex-col items-center">
                  <span className="dot tone mt-[5px] block h-[11px] w-[11px] rounded-full border" style={{ background: pending ? "transparent" : colour, borderColor: pending ? "var(--pending)" : colour }} aria-hidden="true" />
                  {i < steps.length - 1 ? <span className="tone w-px flex-1" style={{ background: pending ? "var(--pending)" : colour }} aria-hidden="true" /> : null}
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
        {api.notice ? <p role="status" className="px-[22px] pb-4 text-[13px] font-semibold text-accent">{api.notice}</p> : null}
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
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={500} aria-label="What went wrong" className="mt-4 block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[14.5px] text-fg" />
          </>
        ) : (
          <>
            <p className="mt-[5px] text-[12.5px] text-fg-muted">{order.rating ? `You gave it ${order.rating.score} of 5. Change it if you like.` : "How was it, from 1 to 5?"}</p>
            <div role="radiogroup" aria-label="Score" className="mt-4 flex gap-[9px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={score === n} aria-label={`${n} of 5`} onClick={() => setScore(n)} className="chip press tabular !px-[15px] !py-[11px] !text-[13.5px] !font-semibold">{n}</button>
              ))}
            </div>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} aria-label="A note for the kitchen" placeholder="Anything to add?" className="mt-4 block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[14.5px] text-fg placeholder:text-fg-muted" />
          </>
        )}
        {error ? <p role="alert" className="mt-3 text-[13px] font-semibold text-late">{error}</p> : null}
        <button type="submit" data-send className="btn-primary press mt-5" disabled={api.busy !== null}>{api.busy ? "Sending" : kind === "report" ? "Send" : "Send rating"}</button>
        <button type="button" onClick={onClose} className="press mt-4 block w-full text-center text-[12.5px] text-fg-muted underline">Not now</button>
      </form>
    </div>
  );
}
