"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { clockDate, clockTime, shortName } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Foot, GUEST_TABS, Header, Screen, TabBar } from "./chrome";
import { ActionSheet } from "./order";
import { preloadMenu } from "./use-menu";
import { useMyOrders, useOrder } from "./use-order";
import { selectOrder } from "./selection";
import { ConnectionBar, useFreshness } from "./connection";
import { isPending } from "./pending";
import { PaySkeleton } from "./skeleton";
import { useArrival } from "./arrival";

type Method = "CARD" | "MOBILE_MONEY" | "CASH";
const METHODS: { value: Method; label: string; how: string; paid: string }[] = [
  { value: "CARD", label: "Card", how: "The waiter brings the reader to your table.", paid: "Paid by card" },
  { value: "MOBILE_MONEY", label: "Bank transfer", how: "The account details show once you tap Pay.", paid: "Paid by bank transfer" },
  { value: "CASH", label: "Cash at the till", how: "Settle at the till on your way out.", paid: "Paid by cash at the till" },
];

// Screens 7 and 8. Payment stays where a restaurant puts it, at the end, just before
// the guest leaves: the bill for the table, how to settle it, one button; then the bill
// lifts away and the receipt prints in its place. The button and the receipt say the
// payment is pretend, once each.
export function PayScreen({ id }: { id?: string } = {}) {
  const mine = useMyOrders();
  useEffect(() => {
    if (id) selectOrder(id);
  }, [id]);
  const o = useOrder(mine.current && !isPending(mine.current.id) ? mine.current.id : null);
  const order = o.order ?? mine.current;
  const fresh = useFreshness(o.error ?? mine.error, o.seenAt ?? mine.seenAt);
  return (
    <>
      {!order ? (mine.loaded ? <NoOrder /> : <PaySkeleton />) : isPending(order.id) ? <NoOrder sending /> : order.payment ? <Receipt order={order} api={o} /> : <PayBody order={order} api={o} fresh={fresh} />}
      <Foot>
        <TabBar tabs={GUEST_TABS} active="Pay" onHover={(label) => { if (label === "Menu") preloadMenu(); }} />
      </Foot>
    </>
  );
}

function NoOrder({ sending = false }: { sending?: boolean }) {
  return (
    <Screen>
      <Header title="Pay" subtitle="The Golden Gate" />
      <div className="px-[22px]">
        <p className="text-[13.5px] leading-[1.55] text-fg-muted">{sending ? "Your order is on its way to the kitchen. This is where you settle up once it has been served." : "Nothing to pay yet. Order from the menu, and this is where you settle up once it has been served."}</p>
        {sending ? <Link href="/order" className="btn-primary press mt-5">Your order</Link> : <Link href="/menu" className="btn-primary press mt-5">Menu</Link>}
      </div>
    </Screen>
  );
}

// The bill as it is brought to a table: the table and the order at the top, when it
// was placed and served, the lines with the price each when there is more than one,
// the total struck into the paper, and who looked after the table.
function Bill({ order }: { order: SerializedOrder }) {
  const s = order.staff;
  const credit = [s.waiter ? `Served by ${shortName(s.waiter.name)}` : null, s.chef ? `Chef ${s.chef.name}` : null, s.bartender ? `Bar ${s.bartender.name}` : null].filter(Boolean).join(" · ");
  return (
    <section className="card fibre mx-[22px] p-[18px]" aria-label="Bill" data-section="bill">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="serif text-[21px] leading-[1.1]">Table {order.tableNo}</h2>
        <p className="tabular text-[11.5px] text-fg-muted">Order #{order.reference}</p>
      </div>
      <p className="tabular mt-[3px] text-[11.5px] text-fg-muted">Placed {clockTime(order.placedAt)}{order.servedAt ? ` · served ${clockTime(order.servedAt)}` : " · not served yet"}</p>
      <div className="rule mt-3" />
      <div className="mt-[4px]">
        {order.items.map((line) => (
          <div key={line.id} className="flex items-baseline justify-between gap-3 py-2 text-[14px]">
            <span className="min-w-0"><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.name}{line.quantity > 1 ? <span className="ml-2 text-[11.5px] text-fg-muted">{line.unitPrice} each</span> : null}</span>
            <span className="tabular struck shrink-0 font-semibold">{line.subtotal}</span>
          </div>
        ))}
      </div>
      <div className="rule-soft mt-[6px]" />
      <div className="pt-3">
        <div className="tabular flex justify-between py-1 text-[12.5px] text-fg-muted"><span>Subtotal</span><span>{order.subtotal}</span></div>
        <div className="tabular flex justify-between py-1 text-[12.5px] text-fg-muted"><span>VAT 7.5%</span><span>{order.vat}</span></div>
        <div className="mt-3 flex items-baseline justify-between"><span className="text-[13.5px] font-semibold">To pay</span><span className="serif struck tabular text-[32px] text-accent" data-total>{order.total}</span></div>
      </div>
      {credit ? <p className="mt-4 text-[11.5px] leading-[1.6] text-fg-muted">{credit}</p> : null}
    </section>
  );
}

function PayBody({ order, api, fresh }: { order: SerializedOrder; api: ReturnType<typeof useOrder>; fresh: { stale: boolean; since: number | null } }) {
  const [method, setMethod] = useState<Method>("CARD");
  const served = order.status === "SERVED";
  const busy = api.busy === "pay";
  const reduce = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const entrance = useArrival();
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const parts = [".summary", ".method", ".action"];
    if (!entrance) {
      utils.set(parts, { opacity: 1 });
      return;
    }
    if (reduce) {
      animate(parts, { opacity: [0, 1], duration: 200 });
      return;
    }
    createTimeline({ defaults: { ease: "outQuart" } })
      .add(".summary", { opacity: [0, 1], y: [10, 0], duration: 450 }, 40)
      .add(".method", { opacity: [0, 1], y: [8, 0], duration: 360, delay: stagger(80) }, "-=250")
      .add(".action", { opacity: [0, 1], y: [10, 0], duration: 380 }, "-=200");
  }, [order.id, reduce, entrance]);
  function choose(value: Method, target: HTMLElement) {
    setMethod(value);
    if (reduce) return;
    const dot = target.querySelector<HTMLElement>(".dot");
    animate(target, { scale: [1, 1.015, 1], duration: 260, ease: "outQuad" });
    if (dot) animate(dot, { scale: [0.4, 1], duration: 320, ease: "outBack(2)" });
  }
  // The moment of paying: the other ways to settle step back while the payment is
  // taken, then the bill lifts away and the receipt prints where it was.
  function pay() {
    const el = root.current;
    if (el && !reduce) animate(el.querySelectorAll(".method[aria-checked=false]"), { opacity: 0.35, duration: 300, ease: "outQuad" });
    void api.pay(method, async () => {
      if (!el) return;
      if (reduce) {
        await animate(el, { opacity: [1, 0], duration: 180 }).then(() => undefined);
        return;
      }
      await createTimeline({ defaults: { ease: "inQuad" } })
        .add(".action, .method", { opacity: 0, duration: 220 }, 0)
        .add(".summary", { y: [0, -28], opacity: [1, 0], duration: 380 }, 80)
        .then(() => undefined);
    });
  }
  return (
    <Screen>
      <div ref={root}>
      <Header title="Your bill" subtitle={served ? `Served ${clockTime(order.servedAt!)} · settle when you are ready` : "Settle once your order has been served"} pill={`Table ${order.tableNo}`} />
      <ConnectionBar stale={fresh.stale} since={fresh.since} what="your order" />
      <div className="summary" style={{ opacity: 0 }}><Bill order={order} /></div>
      <div className="px-[22px] pt-6">
        <p className="text-[12.5px] text-fg-muted">How would you like to settle?</p>
        <div role="radiogroup" aria-label="Payment method" className="mt-[11px] flex flex-col gap-[10px]">
          {METHODS.map((m) => {
            const on = m.value === method;
            return (
              <button key={m.value} type="button" role="radio" aria-checked={on} data-method={m.value} onClick={(e) => choose(m.value, e.currentTarget)} disabled={busy} className="method press flex items-center gap-[13px] rounded-[12px] border p-[17px] text-left" style={{ opacity: 0, background: on ? "var(--accent-ghost)" : "transparent", borderColor: on ? "var(--accent-ghost-border)" : "var(--outline)" }}>
                <span className="dot block h-4 w-4 shrink-0 rounded-full border" style={{ borderColor: on ? "var(--bg)" : "var(--chip-border)", background: on ? "var(--bg)" : "transparent", boxShadow: on ? "inset 0 0 0 3px var(--accent)" : "none" }} aria-hidden="true" />
                <span className="min-w-0">
                  <span className={`block text-[14.5px] ${on ? "font-semibold" : ""}`}>{m.label}</span>
                  <span className="mt-[2px] block text-[11.5px] leading-[1.45] text-fg-muted">{m.how}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="action px-[22px] pb-[26px] pt-[26px]" style={{ opacity: 0 }}>
        {api.notice ? <p role="alert" className="mb-3 text-[13px] font-semibold text-late">{api.notice}</p> : null}
        {busy ? (
          <div className="flex items-center justify-center gap-[10px] rounded-full py-[19px] text-[15.5px] font-semibold" style={{ background: "var(--accent-busy)", color: "var(--fg)" }} aria-live="polite" data-paying>
            <span className="spinner" aria-hidden="true" />
            Taking payment
          </div>
        ) : (
          <button type="button" data-pay onClick={pay} disabled={!served} className="btn-primary press !py-[19px] !text-[15.5px]">
            Pay {order.total} (pretend)
          </button>
        )}
        <p className="mt-3 text-center text-[12.5px] text-fg-muted">{served ? "Settle here and you are free to go." : "You can pay once your order has been served."}</p>
      </div>
      </div>
    </Screen>
  );
}

// The receipt: the one place paper is literal. Bone on near-black, fibre in the
// surface, a perforation under the header, ruled lines where a printer rules, the
// foot torn, the numerals struck in, and a stamp that lands once. On a fresh payment it
// prints: the card feeds down from the perforation, the lines come in, the stamp lands.
export function Receipt({ order, api }: { order: SerializedOrder; api: ReturnType<typeof useOrder> }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [rating, setRating] = useState(false);
  const payment = order.payment!;
  const method = METHODS.find((m) => m.value === payment.method) ?? METHODS[0]!;
  const entrance = useArrival();
  useLayoutEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const parts = [".receipt", ".line", ".stamp", ".after"];
      // on a tab press the receipt is simply there, printed
      if (!entrance) {
        utils.set(parts, { opacity: 1 });
        utils.set(".stamp", { opacity: 0.9, rotate: -8 });
        utils.set(".receipt", { clipPath: "inset(0 0 0 0)" });
        return;
      }
      if (self?.matches.reduceMotion) {
        animate(parts, { opacity: [0, 1], duration: 200 });
        utils.set(".receipt", { clipPath: "inset(0 0 0 0)" });
        return;
      }
      utils.set(parts, { opacity: 1 });
      utils.set(".line", { opacity: 0 });
      utils.set(".stamp", { opacity: 0 });
      utils.set(".after", { opacity: 0 });
      createTimeline({ defaults: { ease: "outQuad" } })
        .add(".receipt", { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], duration: 1100, ease: "linear" }, 120)
        .add(".line", { opacity: [0, 1], y: [-4, 0], duration: 260, delay: stagger(70) }, 260)
        .add(".stamp", { opacity: [0, 0.9], scale: [1.7, 1], rotate: [-16, -8], duration: 380, ease: "outBack(2)" }, "-=80")
        .add(".after", { opacity: [0, 1], duration: 400 }, "-=150");
    });
    return () => scope.revert();
    // prints once per payment
  }, [order.id, entrance]);
  useEffect(() => {
    if (!rating) return;
    const el = root.current?.querySelector<HTMLElement>(".sheet");
    if (el) animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [28, 0], duration: 240, ease: "outQuad" });
  }, [rating, reduce]);
  const served = order.staff;
  const credit = [served.waiter ? `Served by ${shortName(served.waiter.name)}` : null, served.chef ? `Chef ${served.chef.name}` : null, served.bartender ? `Bar ${served.bartender.name}` : null].filter(Boolean).join(" · ");
  return (
    <Screen>
      <div ref={root}>
        <Header title="Paid" subtitle="Thank you. Your table is settled." />
        <section className="receipt fibre torn-bottom mx-[22px] overflow-hidden rounded-t-[16px] bg-surface" style={{ opacity: 0 }} aria-label="Receipt" data-section="receipt">
          <div className="perforation relative px-5 pb-5 pt-[22px] text-center">
            <span className="stamp absolute right-4 top-4" style={{ opacity: 0 }} aria-hidden="true">PAID</span>
            <h2 className="line serif text-[24px] leading-[1.15]">The Golden Gate</h2>
            <p className="line mt-[6px] text-[11.5px] leading-[1.6] text-fg-muted">13 Ubah Street, Berger, Lagos<br />{clockDate(payment.paidAt)}</p>
            <p className="line tabular mt-[5px] text-[11.5px] text-fg-muted">Order #{order.reference} · Table {order.tableNo} · Receipt {payment.receiptNo ?? "0000"}</p>
          </div>
          <div className="px-5 pb-7 pt-[18px]">
            {order.items.map((line) => (
              <div key={line.id} className="line flex items-baseline justify-between py-2 text-[14px]">
                <span><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.name}</span>
                <span className="tabular struck font-semibold">{line.subtotal}</span>
              </div>
            ))}
            <div className="line rule mt-[10px]" />
            <div className="line tabular flex justify-between pt-3 text-[12.5px] text-fg-muted"><span>Subtotal</span><span>{order.subtotal}</span></div>
            <div className="line tabular flex justify-between pt-2 text-[12.5px] text-fg-muted"><span>VAT 7.5%</span><span>{order.vat}</span></div>
            <div className="line rule mt-[13px]" />
            <div className="line flex items-baseline justify-between pt-[14px]">
              <span className="text-[13.5px] font-semibold">{method.paid}</span>
              <span className="serif struck tabular text-[32px] text-accent">{payment.amount}</span>
            </div>
            <p className="line mt-3 text-[11.5px] text-fg-muted">Pretend payment. No money moved.</p>
          </div>
        </section>
        <div className="after px-[22px] pt-5" style={{ opacity: 0 }}>
          {credit ? <p className="text-[12px] leading-[1.6] text-fg-muted">{credit}</p> : null}
          {order.rating ? (
            <p className="mt-3 text-[13.5px] leading-[1.55]" data-rating>You rated it <span className="font-semibold">{order.rating.score} of 5</span>{order.rating.comment ? `. ${order.rating.comment}` : "."}</p>
          ) : null}
          <div className="mt-5 flex flex-col gap-[10px] pb-[26px]">
            <button type="button" data-rate-open onClick={() => setRating(true)} className="btn-outline press !py-4 !text-[14.5px]">{order.rating ? "Change your rating" : "Rate your order"}</button>
            <Link href="/menu" data-go-menu className="btn-outline press !py-4 !text-[14.5px]" onMouseEnter={preloadMenu} onFocus={preloadMenu}>Order something else</Link>
          </div>
        </div>
        {api.notice ? <p role="status" className="px-[22px] pb-4 text-[13px] font-semibold text-fg">{api.notice}</p> : null}
        {rating ? <ActionSheet kind="rate" api={api} order={order} onClose={() => setRating(false)} /> : null}
      </div>
    </Screen>
  );
}
