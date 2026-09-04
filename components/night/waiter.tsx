"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import type { SerializedOrder } from "@/lib/orders";
import { clockTime, mmss, shortName } from "@/lib/clock";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Chip, Foot, Header, Screen, TabBar, WAITER_TABS } from "./chrome";
import { DishPhoto } from "./photo";
import { orderClock } from "./use-order";
import { preloadMenu, useMenu } from "./use-menu";
import { useRail, type Rail } from "./use-rail";

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const KITCHEN_AFTER_SECONDS = 120;
const READY_WITHIN_SECONDS = 60;
type Status = "Ready" | "Late" | "In the kitchen" | "Just placed" | "Served";
type Filter = "All" | "Cooking" | "Late" | "Served";

// What a row says about an order, and in which colour.
function statusOf(order: SerializedOrder, now: number | null): { status: Status; time: string; colour: string } {
  if (order.status !== "PLACED") return { status: "Served", time: `Served ${clockTime(order.servedAt ?? order.placedAt)}`, colour: "var(--served-dot)" };
  const c = orderClock(order, now);
  if (c.state === "late") return { status: "Late", time: `${Math.max(1, Math.floor(c.lateSeconds / 60))} min late`, colour: "var(--late)" };
  if (c.remainingSeconds <= READY_WITHIN_SECONDS) return { status: "Ready", time: "Ready now", colour: "var(--accent)" };
  if (c.elapsedSeconds < KITCHEN_AFTER_SECONDS) return { status: "Just placed", time: `${order.waitMinutes} min left`, colour: "var(--fg-muted)" };
  return { status: "In the kitchen", time: `${mmss(c.remainingSeconds)} left`, colour: "var(--fg-muted)" };
}
const inFilter = (status: Status, filter: Filter) => filter === "All" || (filter === "Late" ? status === "Late" : filter === "Served" ? status === "Served" : status !== "Late" && status !== "Served");

function staffPill(rail: Rail | undefined): string {
  const first = rail?.staff.waiters[0];
  return first ? shortName(first.name) : "Staff";
}

// Rows enter in two ways: the ones there at mount stagger in from below, and any that
// appear later, on a poll or a filter, slide in from the right.
function useRowEntrance(listRef: React.RefObject<HTMLElement | null>, ids: string, reduce: boolean) {
  const known = useRef<Set<string>>(new Set());
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const fresh = [...list.querySelectorAll<HTMLElement>("[data-order-id]")].filter((el) => !known.current.has(el.dataset.orderId!));
    const firstBatch = known.current.size === 0;
    fresh.forEach((el) => known.current.add(el.dataset.orderId!));
    if (fresh.length === 0) return;
    if (reduce) {
      animate(fresh, { opacity: [0, 1], duration: 200 });
      return;
    }
    if (firstBatch) animate(fresh, { opacity: [0, 1], y: [10, 0], duration: 380, ease: "outQuad", delay: stagger(45) });
    else animate(fresh, { opacity: [0, 1], x: [28, 0], duration: 420, ease: "outQuart" });
  }, [ids, reduce, listRef]);
}

function Row({ order, status, time, colour, meta }: { order: SerializedOrder; status: Status; time: string; colour: string; meta: string }) {
  return (
    <li data-order-id={order.id} className="entry mx-[22px] mb-[10px]" style={{ opacity: 0 }}>
      <Link href={`/waiter/${order.id}`} className="card fibre press flex items-center gap-[14px] px-[18px] py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-[9px]">
            <span className="ref serif text-[21px]">Table {order.tableNo}</span>
            <span className="text-[11.5px] text-fg-muted">#{order.reference}</span>
          </div>
          <div className="rule-soft mt-1" />
          <p className="tabular mt-1 truncate text-[12px] text-fg-muted">{meta}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-[6px]">
            <span className="tone block h-[7px] w-[7px] rounded-full" style={{ background: colour }} aria-hidden="true" />
            <span className="tone text-[12.5px] font-semibold" style={{ color: colour }}>{status}</span>
          </div>
          <p className="tabular mt-[5px] text-[12px] text-fg-muted">{time}</p>
        </div>
      </Link>
    </li>
  );
}

// Screen 5. Live orders: header, filter chips, one card per order, the tabs. New orders
// slide in on the poll; a status change recolours in place. Nothing pulses.
export function LiveOrders() {
  const rail = useRail();
  const { menu } = useMenu();
  const reduce = usePrefersReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");
  const listRef = useRef<HTMLUListElement>(null);
  const drinkIds = new Set(menu?.menus.filter((m) => m.type === "DRINKS").flatMap((m) => m.items.map((i) => i.id)) ?? []);
  const rows = rail.orders.map((order) => ({ order, ...statusOf(order, rail.now) }));
  const open = rows.filter((r) => r.status !== "Served").length;
  const drinksPending = rows.filter((r) => r.status !== "Served" && r.order.items.some((l) => drinkIds.has(l.menuItemId))).length;
  const subtitle = `${WORDS[open] ?? open} open · ${(WORDS[drinksPending] ?? String(drinksPending)).toLowerCase()} ${drinksPending === 1 ? "drink" : "drinks"} pending`;
  const shown = rows.filter((r) => inFilter(r.status, filter));
  useRowEntrance(listRef, shown.map((r) => r.order.id).join(","), reduce);
  return (
    <>
      <Screen>
        <Header title="Live orders" subtitle={rail.data ? subtitle : "Opening the floor"} pill={staffPill(rail.data)} />
        <div className="flex gap-2 overflow-x-auto px-[22px] pb-[14px]" role="tablist" aria-label="Filter">
          {(["All", "Cooking", "Late", "Served"] as Filter[]).map((f) => (
            <Chip key={f} on={f === filter} onClick={() => setFilter(f)} className="!px-[14px] !py-2 !text-[12.5px]">{f}</Chip>
          ))}
        </div>
        {rail.error ? <p role="alert" className="px-[22px] pb-3 text-[13px] font-semibold text-late">{rail.error.message}</p> : null}
        <ul ref={listRef} aria-label="Orders">
          {rail.data && shown.length === 0 ? <li className="card mx-[22px] px-[18px] py-4 text-[13px] text-fg-muted" data-empty>{filter === "All" ? "No open orders. New ones appear here within a few seconds." : `Nothing ${filter === "Late" ? "late" : filter === "Served" ? "served" : "cooking"} right now.`}</li> : null}
          {shown.map(({ order, status, time, colour }) => (
            <Row key={order.id} order={order} status={status} time={time} colour={colour} meta={`${order.items.reduce((n, l) => n + l.quantity, 0)} ${order.items.reduce((n, l) => n + l.quantity, 0) === 1 ? "item" : "items"} · ${order.subtotal}`} />
          ))}
        </ul>
        <div className="h-[14px]" />
      </Screen>
      <Foot>
        <TabBar tabs={WAITER_TABS} active="Orders" onHover={(label) => { if (label === "Menu") preloadMenu(); }} />
      </Foot>
    </>
  );
}

// Screen 6. One order open: the card, who cooked, who mixed, mark as served. The screen
// enters piece by piece; marking is one way, and the button drains from a filled pill
// to the outline that records when it happened.
export function WaiterOrder({ id }: { id: string }) {
  const rail = useRail();
  const reduce = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const order = rail.orders.find((o) => o.id === id) ?? null;
  const [chef, setChef] = useState<string | null>(null);
  const [bartender, setBartender] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const staff = rail.staff;
  const chefId = chef ?? order?.staff.chef?.id ?? staff?.chefs[0]?.id ?? null;
  const bartenderId = bartender ?? order?.staff.bartender?.id ?? staff?.bartenders[0]?.id ?? null;
  const served = !!order && order.status !== "PLACED";
  const c = order ? orderClock(order, rail.now) : null;
  const entered = useRef(false);
  const wasServed = useRef(served);

  useEffect(() => {
    if (!order || entered.current || !root.current) return;
    entered.current = true;
    const parts = [".card-in", ".line", ".field", ".action"].filter((s) => root.current!.querySelector(s));
    if (reduce) {
      animate(parts, { opacity: [0, 1], duration: 200 });
      return;
    }
    utils.set(parts, { opacity: 1 });
    createTimeline({ defaults: { ease: "outQuart" } })
      .add(".card-in", { opacity: [0, 1], y: [10, 0], duration: 450 }, 40)
      .add(".line", { opacity: [0, 1], x: [-6, 0], duration: 320, delay: stagger(50) }, "-=250")
      .add(".field", { opacity: [0, 1], y: [8, 0], duration: 380, delay: stagger(110) }, "-=200")
      .add(".action", { opacity: [0, 1], y: [10, 0], duration: 380 }, "-=200");
  }, [order, reduce]);

  useEffect(() => {
    if (served && !wasServed.current) {
      const el = root.current?.querySelector<HTMLElement>("[data-served-at]");
      const clock = root.current?.querySelector<HTMLElement>(".clock");
      if (el && !reduce) {
        animate(el, { backgroundColor: ["rgba(210,162,76,0.55)", "rgba(210,162,76,0)"], color: ["#14120f", "#d2a24c"], scale: [0.985, 1.03, 1], duration: 620, ease: "outQuad" });
        if (clock) animate(clock, { opacity: [0, 1], y: [4, 0], duration: 400, ease: "outQuad" });
        animate(".chip", { opacity: [1, 0.6], duration: 400, delay: stagger(40) });
      }
    }
    wasServed.current = served;
  }, [served, reduce]);

  function pick(setter: (id: string) => void, id: string, target: HTMLElement) {
    setter(id);
    if (!reduce) animate(target, { scale: [1, 1.06, 1], duration: 260, ease: "outQuad" });
  }
  async function serve(target: HTMLElement) {
    if (!order || !staff || !chefId || !bartenderId) return;
    const waiterId = staff.waiters[0]?.id;
    if (!waiterId) return;
    setSaving(true);
    setError(null);
    // the press is answered before the request returns: the pill settles and its fill dims
    const pressed = reduce ? null : animate(target, { scale: [1, 0.985], backgroundColor: ["rgba(210,162,76,1)", "rgba(210,162,76,0.55)"], duration: 220, ease: "outQuad" });
    try {
      await rail.serve(order.id, { waiterId, chefId, bartenderId });
    } catch (e) {
      pressed?.pause();
      if (!reduce) animate(target, { scale: 1, backgroundColor: "rgba(210,162,76,1)", duration: 220 });
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Screen>
        <div ref={root}>
          <Header back={{ href: "/waiter", label: "Live orders" }} title={order ? `Order #${order.reference}` : "Order"} pill={order ? `Table ${order.tableNo}` : undefined} pillTone={c?.state === "late" ? "late" : "accent"} />
          {!order ? (
            <p className="px-[22px] text-[13px] text-fg-muted">{rail.data ? "That order is not on the floor any more." : "Opening the order."}</p>
          ) : (
            <>
              <section className="card-in card fibre mx-[22px] p-[18px]" style={{ opacity: 0 }} aria-label="Order">
                <div className="flex justify-between text-[12px] text-fg-muted">
                  <span>Placed {clockTime(order.placedAt)}</span>
                  {served ? <span className="clock tabular font-semibold text-accent">Served {clockTime(order.servedAt ?? order.placedAt)}</span> : c?.state === "late" ? <span className="clock tone tabular font-semibold text-late">{Math.max(1, Math.floor(c.lateSeconds / 60))} min late</span> : <span className="clock tone tabular font-semibold text-accent">{mmss(c?.remainingSeconds ?? 0)} left</span>}
                </div>
                <div className="mt-[14px]">
                  {order.items.map((line) => (
                    <div key={line.id} className="line" style={{ opacity: 0 }}>
                      <div className="rule-soft" />
                      <div className="flex items-baseline justify-between py-[9px] text-[14.5px]">
                        <span><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.name}</span>
                        <span className="text-[11.5px] text-fg-muted">{line.prepTimeMinutes} min</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rule mt-[14px]" />
                <div className="flex items-baseline justify-between pt-[13px]">
                  <span className="text-[12.5px] text-fg-muted">Total</span>
                  <span className="serif struck tabular text-[23px]">{order.subtotal}</span>
                </div>
              </section>
              <div className="field px-[22px] pt-6" style={{ opacity: 0 }}>
                <p className="text-[12.5px] text-fg-muted">Chef</p>
                <div className="mt-[10px] flex flex-wrap gap-[9px]" role="radiogroup" aria-label="Chef">
                  {(staff?.chefs ?? []).map((p) => <button key={p.id} type="button" role="radio" aria-checked={p.id === chefId} disabled={served} onClick={(e) => pick(setChef, p.id, e.currentTarget)} className="chip press !px-[15px] !py-[11px] !font-semibold" data-chef={p.id}>{p.name}</button>)}
                </div>
              </div>
              <div className="field px-[22px] pt-[22px]" style={{ opacity: 0 }}>
                <p className="text-[12.5px] text-fg-muted">Bartender</p>
                <div className="mt-[10px] flex flex-wrap gap-[9px]" role="radiogroup" aria-label="Bartender">
                  {(staff?.bartenders ?? []).map((p) => <button key={p.id} type="button" role="radio" aria-checked={p.id === bartenderId} disabled={served} onClick={(e) => pick(setBartender, p.id, e.currentTarget)} className="chip press !px-[15px] !py-[11px] !font-semibold" data-bartender={p.id}>{p.name}</button>)}
                </div>
              </div>
              <div className="action px-[22px] pb-[26px] pt-7" style={{ opacity: 0 }}>
                {error ? <p role="alert" className="mb-3 text-[13px] font-semibold text-late">{error}</p> : null}
                {served ? (
                  <p className="rounded-full border py-[17px] text-center text-[15px] font-semibold text-accent" style={{ borderColor: "var(--accent-served-border)" }} data-served-at>Served at {clockTime(order.servedAt ?? order.placedAt)}</p>
                ) : (
                  <button type="button" data-serve onClick={(e) => serve(e.currentTarget)} disabled={saving || !staff} className="btn-primary" style={{ transition: "none" }}>{saving ? "Marking as served" : "Mark as served"}</button>
                )}
              </div>
            </>
          )}
        </div>
      </Screen>
      <Foot>
        <TabBar tabs={WAITER_TABS} active="Orders" />
      </Foot>
    </>
  );
}

// The Tables tab: the same open orders, one card per table, sorted by table.
export function Tables() {
  const rail = useRail();
  const reduce = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const rows = rail.orders.filter((o) => o.status === "PLACED").map((order) => ({ order, ...statusOf(order, rail.now) })).sort((a, b) => a.order.tableNo.localeCompare(b.order.tableNo, undefined, { numeric: true }));
  useRowEntrance(listRef, rows.map((r) => r.order.id).join(","), reduce);
  return (
    <>
      <Screen>
        <Header title="Tables" subtitle={rail.data ? `${WORDS[rows.length] ?? rows.length} ${rows.length === 1 ? "table" : "tables"} waiting` : "Opening the floor"} pill={staffPill(rail.data)} />
        <ul ref={listRef} aria-label="Tables">
          {rail.data && rows.length === 0 ? <li className="card mx-[22px] px-[18px] py-4 text-[13px] text-fg-muted" data-empty>No tables waiting on an order.</li> : null}
          {rows.map(({ order, status, time, colour }) => (
            <Row key={order.id} order={order} status={status} time={time} colour={colour} meta={order.items.map((l) => `${l.quantity}× ${l.name}`).join(" · ")} />
          ))}
        </ul>
      </Screen>
      <Foot>
        <TabBar tabs={WAITER_TABS} active="Tables" />
      </Foot>
    </>
  );
}

// The Menu tab on the waiter side: the same rows, nothing to add. They stagger in.
export function WaiterMenu() {
  const { menu, error } = useMenu();
  const reduce = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu || !root.current) return;
    const rows = root.current.querySelectorAll(".row");
    if (rows.length === 0) return;
    animate(rows, reduce ? { opacity: [0, 1], duration: 200 } : { opacity: [0, 1], y: [8, 0], duration: 380, ease: "outQuad", delay: stagger(40, { start: 60 }) });
  }, [menu, reduce]);
  return (
    <>
      <Screen>
        <div ref={root}>
          <Header title="Menu" subtitle={menu ? menu.restaurant.location.replace(/, Lagos$/, "") : "Loading the menu"} />
          {error ? <p role="alert" className="px-[22px] text-[13px] font-semibold text-late">{error.message}</p> : null}
          {menu?.menus.map((section) => (
            <section key={section.id} aria-labelledby={`w-${section.id}`}>
              <h2 id={`w-${section.id}`} className="px-[22px] pb-2 pt-4 text-[12.5px] text-fg-muted">{section.name}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item.id} className="row flex items-center gap-[17px] border-b border-[color:var(--hairline)] px-[22px] py-5" style={{ opacity: 0 }}>
                    <DishPhoto src={item.photo} alt="" size={56} />
                    <div className="min-w-0 flex-1">
                      <h3 className="serif text-[20px] leading-[1.2]">{item.name}</h3>
                      <p className="pretty mt-[5px] text-[12px] leading-[1.5] text-fg-muted">{item.description}</p>
                      <div className="mt-[10px] flex items-baseline gap-[10px]"><span className="text-[14px] font-semibold text-accent">{item.price}</span><span className="text-[11.5px] text-fg-muted">{item.prepTimeMinutes} min</span></div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Screen>
      <Foot>
        <TabBar tabs={WAITER_TABS} active="Menu" />
      </Foot>
    </>
  );
}
