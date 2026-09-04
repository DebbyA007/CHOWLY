"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { clockDate, shortName } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Foot, GUEST_TABS, Header, Screen, TabBar } from "./chrome";
import { ActionSheet } from "./order";
import { firstVisit } from "./once";
import { preloadMenu } from "./use-menu";
import { useMyOrders, useOrder } from "./use-order";

type Method = "CARD" | "MOBILE_MONEY" | "CASH";
const METHODS: { value: Method; label: string; paid: string }[] = [
  { value: "CARD", label: "Card", paid: "Paid by card" },
  { value: "MOBILE_MONEY", label: "Bank transfer", paid: "Paid by bank transfer" },
  { value: "CASH", label: "Cash at the till", paid: "Paid by cash at the till" },
];

// Screens 7 and 8. The summary, the method, the one button; then, paid, the receipt
// prints in its place. The button and the receipt say the payment is pretend, once each.
export function PayScreen() {
  const mine = useMyOrders();
  const o = useOrder(mine.current?.id ?? null);
  const order = o.order ?? mine.current;
  return (
    <>
      {!order ? <NoOrder loaded={mine.loaded} /> : order.payment ? <Receipt order={order} justPaid={o.justPaid} api={o} /> : <PayBody order={order} api={o} />}
      <Foot>
        <TabBar tabs={GUEST_TABS} active="Pay" onHover={(label) => { if (label === "Menu") preloadMenu(); }} />
      </Foot>
    </>
  );
}

function NoOrder({ loaded }: { loaded: boolean }) {
  return (
    <Screen>
      <Header title="Pay" subtitle="The Golden Gate" />
      <div className="px-[22px]">
        <p className="text-[13.5px] leading-[1.55] text-fg-muted">{loaded ? "Nothing to pay yet. Order from the menu, and this is where you settle up once it has been served." : "Finding your order."}</p>
        {loaded ? <Link href="/menu" className="btn-primary press mt-5">Menu</Link> : null}
      </div>
    </Screen>
  );
}

function Summary({ order }: { order: SerializedOrder }) {
  return (
    <section className="card fibre mx-[22px] p-[18px]" aria-label="Summary">
      {order.items.map((line) => (
        <div key={line.id} className="flex items-baseline justify-between py-2 text-[14px]">
          <span><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.name}</span>
          <span className="tabular struck font-semibold">{line.subtotal}</span>
        </div>
      ))}
      <div className="rule mt-[10px]" />
      <div className="pt-3">
        <div className="tabular flex justify-between py-1 text-[12.5px] text-fg-muted"><span>Subtotal</span><span>{order.subtotal}</span></div>
        <div className="tabular flex justify-between py-1 text-[12.5px] text-fg-muted"><span>VAT 7.5%</span><span>{order.vat}</span></div>
        <div className="mt-3 flex items-baseline justify-between"><span className="text-[13.5px] font-semibold">Total</span><span className="serif struck tabular text-[32px] text-accent">{order.total}</span></div>
      </div>
    </section>
  );
}

function PayBody({ order, api }: { order: SerializedOrder; api: ReturnType<typeof useOrder> }) {
  const [method, setMethod] = useState<Method>("CARD");
  const served = order.status === "SERVED";
  const busy = api.busy === "pay";
  return (
    <Screen>
      <Header title="Pay" subtitle={`Order #${order.reference}`} pill={`Table ${order.tableNo}`} />
      <Summary order={order} />
      <div className="px-[22px] pt-6">
        <p className="text-[12.5px] text-fg-muted">How would you like to pay?</p>
        <div role="radiogroup" aria-label="Payment method" className="mt-[11px] flex flex-col gap-[10px]">
          {METHODS.map((m) => {
            const on = m.value === method;
            return (
              <button key={m.value} type="button" role="radio" aria-checked={on} onClick={() => setMethod(m.value)} className="press flex items-center gap-[13px] rounded-[12px] border p-[17px] text-left" style={{ background: on ? "var(--accent)" : "transparent", color: on ? "var(--bg)" : "var(--fg)", borderColor: on ? "var(--accent)" : "var(--chip-border)" }}>
                <span className="block h-4 w-4 shrink-0 rounded-full border" style={{ borderColor: on ? "var(--bg)" : "var(--chip-border)", background: on ? "var(--bg)" : "transparent", boxShadow: on ? "inset 0 0 0 3px var(--accent)" : "none" }} aria-hidden="true" />
                <span className={`text-[14.5px] ${on ? "font-semibold" : ""}`}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-[22px] pb-[26px] pt-[26px]">
        {api.notice ? <p role="alert" className="mb-3 text-[13px] font-semibold text-late">{api.notice}</p> : null}
        {busy ? (
          <div className="flex items-center justify-center gap-[10px] rounded-full py-[19px] text-[15.5px] font-semibold" style={{ background: "var(--accent-busy)", color: "var(--fg)" }} aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            Taking payment
          </div>
        ) : (
          <button type="button" data-pay onClick={() => api.pay(method)} disabled={!served} className="btn-primary press !py-[19px] !text-[15.5px]">
            Pay {order.total} (pretend)
          </button>
        )}
        {!served ? <p className="mt-3 text-center text-[12.5px] text-fg-muted">You can pay once your order has been served.</p> : null}
      </div>
    </Screen>
  );
}

// The receipt: the one place paper is literal. Bone on near-black, fibre in the
// surface, a perforation under the header, ruled lines where a printer rules, the
// foot torn, the numerals struck in, and a stamp that lands once. On a fresh payment it
// prints: the card feeds down from the perforation, the lines come in, the stamp lands.
export function Receipt({ order, justPaid, api }: { order: SerializedOrder; justPaid: boolean; api: ReturnType<typeof useOrder> }) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [rating, setRating] = useState(false);
  const payment = order.payment!;
  const method = METHODS.find((m) => m.value === payment.method) ?? METHODS[0]!;
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const parts = [".receipt", ".line", ".stamp", ".after"];
      const fresh = justPaid || firstVisit(`receipt-${order.id}`);
      if (self?.matches.reduceMotion || !fresh) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);
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
          <div className="mt-5 flex flex-col gap-[10px] pb-[26px]">
            <button type="button" data-rate-open onClick={() => setRating(true)} className="btn-outline press !py-4 !text-[14.5px]">Rate your order</button>
          </div>
        </div>
        {api.notice ? <p role="status" className="px-[22px] pb-4 text-[13px] font-semibold text-accent">{api.notice}</p> : null}
        {rating ? <ActionSheet kind="rate" api={api} order={order} onClose={() => setRating(false)} /> : null}
      </div>
    </Screen>
  );
}
