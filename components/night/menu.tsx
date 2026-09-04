"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";
import { Chip, Foot, GUEST_TABS, Header, Screen, TabBar } from "./chrome";
import { DishPhoto } from "./photo";
import { useTicker } from "./ticker";
import { useCart } from "./use-cart";
import { useMenu } from "./use-menu";
import { preloadMine } from "./use-order";
import { ConnectionBar, useOnline } from "./connection";
import { MenuSkeleton } from "./skeleton";

// Screen 2. Header, category chips, the dish list, the persistent cart bar, the tabs.
// Tapping a category filters in place with no animation. The add control morphs into
// the quantity stepper; the cart bar rises the first time something lands on it, and
// its count and total tick rather than jump.
export function Menu() {
  const { menu, error } = useMenu();
  const cart = useCart(menu);
  return (
    <>
      {menu ? <MenuBody menu={menu} cart={cart} /> : error ? <Screen><Header title="The Golden Gate" subtitle="13 Ubah Street, Berger" /><p className="px-[22px] text-[13px] font-semibold text-late" role="alert">{error.message}</p></Screen> : <Screen foot={128}><MenuSkeleton /></Screen>}
      <Foot>
        <CartBar count={cart.count} totalKobo={cart.totalKobo} ready={!!menu && cart.hydrated} />
        <TabBar tabs={GUEST_TABS} active="Menu" onHover={(label) => { if (label !== "Menu") preloadMine(); }} />
      </Foot>
    </>
  );
}

type CartApi = ReturnType<typeof useCart>;

function MenuBody({ menu, cart }: { menu: MenuView; cart: CartApi }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const reduce = usePrefersReducedMotion();
  const [category, setCategory] = useState(menu.menus[0]?.name ?? "");
  const [review, setReview] = useState(false);
  const [tableSheet, setTableSheet] = useState(false);
  const [tableDraft, setTableDraft] = useState("");
  const net = useOnline();
  const section = menu.menus.find((m) => m.name === category) ?? menu.menus[0];

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const soft = self?.matches.reduceMotion === true;
      self?.add("sheet", (el: HTMLElement) => animate(el, soft ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [28, 0], duration: 240, ease: "outQuad" }));
      // Placing the order answers the tap at once: the lines leave upward one by one
      // while the request runs. On success the sheet lifts away and the Order tab opens
      // with the ring drawing in; on failure the lines come back and the error prints.
      self?.add("sending", () => {
        if (soft) return;
        animate(".sheet li", { opacity: [1, 0.25], y: [0, -10], duration: 260, ease: "inQuad", delay: stagger(45) });
        animate(".sheet .totals", { opacity: [1, 0.5], duration: 260 });
      });
      self?.add("unsend", () => {
        if (soft) return;
        animate(".sheet li", { opacity: 1, y: 0, duration: 220, ease: "outQuad" });
        animate(".sheet .totals", { opacity: 1, duration: 220 });
      });
      self?.add("placed", (onDone: () => void) => {
        if (soft) {
          animate(".sheet", { opacity: [1, 0], duration: 150, onComplete: onDone });
          return;
        }
        createTimeline({ onComplete: onDone })
          .add(".sheet li", { opacity: 0, y: -18, duration: 160, ease: "inQuad", delay: stagger(30) })
          .add(".sheet", { y: [0, -44], opacity: [1, 0], duration: 320, ease: "inQuad" }, "-=40");
      });
      if (soft) return;
      utils.set(".row", { opacity: 0 });
      animate(".row", { opacity: [0, 1], y: [8, 0], duration: 380, ease: "outQuad", delay: stagger(45, { start: 80 }) });
    });
    return () => scope.current?.revert();
  }, []);
  useEffect(() => {
    if (!review) return;
    const el = root.current?.querySelector<HTMLElement>(".sheet");
    if (el) scope.current?.methods.sheet?.(el);
  }, [review]);

  const [placedRef, setPlacedRef] = useState<string | null>(null);
  function place() {
    scope.current?.methods.sending?.();
    const placed = cart.place();
    if (!placed) {
      scope.current?.methods.unsend?.();
      return;
    }
    setPlacedRef(placed.id);
    const go = () => router.push("/order");
    if (scope.current?.methods.placed) scope.current.methods.placed(go);
    else go();
  }

  return (
    <Screen foot={cart.count > 0 ? 150 : 128}>
      <div ref={root as React.RefObject<HTMLDivElement>}>
        <Header title={menu.restaurant.name} subtitle={menu.restaurant.location.replace(/, Lagos$/, "")} pill={cart.hydrated ? (cart.tableNo ? `Table ${cart.tableNo}` : "Which table?") : undefined} onPill={() => { setTableDraft(cart.tableNo); setTableSheet(true); }} />
        <ConnectionBar stale={!net.online} since={net.since} what="the menu" />
        {tableSheet ? (
          <div className="fixed inset-0 z-30 flex items-end justify-center" role="presentation">
            <button type="button" className="absolute inset-0 h-full w-full bg-[rgba(20,18,15,0.7)]" aria-label="Close" onClick={() => setTableSheet(false)} />
            <form className="relative w-full max-w-[430px] rounded-t-[16px] bg-surface fibre px-[22px] pb-[30px] pt-5" aria-label="Your table" onSubmit={(e) => { e.preventDefault(); const v = tableDraft.trim(); if (!/^[A-Za-z0-9-]{1,8}$/.test(v)) return; cart.setTableNo(v); setTableSheet(false); }} noValidate>
              <h2 className="serif text-[25px] leading-[1.05]">Which table?</h2>
              <p className="mt-[5px] text-[12.5px] text-fg-muted">The number is on the card on your table.</p>
              <input value={tableDraft} onChange={(e) => setTableDraft(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" autoFocus className="tabular mt-4 block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[14.5px] text-fg" />
              <button type="submit" className="btn-primary press mt-4" data-keep-table>Keep</button>
            </form>
          </div>
        ) : null}
        <div className="flex gap-[9px] overflow-x-auto px-[22px] pb-4" role="tablist" aria-label="Categories">
          {menu.menus.map((m) => (
            <Chip key={m.id} on={m.name === category} onClick={() => setCategory(m.name)}>{m.name}</Chip>
          ))}
        </div>
        <ul aria-label={section?.name}>
          {section?.items.map((item) => (
            <DishRow key={item.id} item={item} quantity={cart.cart[item.id] ?? 0} onAdd={() => cart.add(item)} onRemove={() => cart.remove(item)} reduce={reduce} />
          ))}
        </ul>
        {/* The cart bar's button lives in the foot; this is the review it opens. */}
        <ReviewTrigger onOpen={() => setReview(true)} disabled={cart.count === 0} />
        {review ? (
          <div className="fixed inset-0 z-30 flex items-end justify-center" role="presentation">
            <button type="button" className="absolute inset-0 h-full w-full bg-[rgba(20,18,15,0.7)]" aria-label="Back to the menu" onClick={() => setReview(false)} />
            <form aria-label="Your order" className="sheet relative w-full max-w-[430px] rounded-t-[16px] bg-surface fibre px-[22px] pb-[30px] pt-5" style={{ opacity: 0, maxHeight: "86dvh", overflowY: "auto" }} onSubmit={(e) => { e.preventDefault(); void place(); }} noValidate>
              <h2 className="serif text-[25px] leading-[1.05]">Your order</h2>
              <ul className="mt-2">
                {cart.lines.map((line) => (
                  <li key={line.item.id} className="flex items-center justify-between gap-3 py-[9px] text-[14px]">
                    <span className="min-w-0"><span className="mr-[10px] text-fg-muted">{line.quantity}×</span>{line.item.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="tabular font-semibold">{formatNaira(line.item.priceKobo * line.quantity)}</span>
                      <Stepper quantity={line.quantity} onAdd={() => cart.add(line.item)} onRemove={() => cart.remove(line.item)} reduce={reduce} name={line.item.name} small />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="totals">
              <div className="rule mt-2" />
              <div className="flex items-center justify-between py-3 text-[12.5px] text-fg-muted"><span>Subtotal</span><span className="tabular">{formatNaira(cart.subtotalKobo)}</span></div>
              <div className="flex items-center justify-between pb-3 text-[12.5px] text-fg-muted"><span>VAT 7.5%</span><span className="tabular">{formatNaira(cart.totalKobo - cart.subtotalKobo)}</span></div>
              <div className="flex items-baseline justify-between"><span className="text-[13.5px] font-semibold">Total</span><span className="serif struck tabular text-[32px] text-accent">{formatNaira(cart.totalKobo)}</span></div>
              </div>
              <label className="mt-5 block text-[12.5px] text-fg-muted">
                Your table
                <input value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" className="tabular mt-[10px] block w-full rounded-[12px] border border-[color:var(--chip-border)] bg-transparent px-[17px] py-4 text-[14.5px] text-fg" />
              </label>
              {cart.error ? <p role="alert" className="mt-3 text-[13px] font-semibold text-late">{cart.error}</p> : null}
              <button type="submit" data-place className="btn-primary press mt-5" disabled={cart.placing || cart.count === 0 || placedRef !== null}>{placedRef || cart.placing ? "Sending to the kitchen" : "Place order"}</button>
              <button type="button" onClick={() => setReview(false)} className="press mt-4 block w-full text-center text-[12.5px] text-fg-muted underline">Keep browsing</button>
            </form>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

// The cart bar's "View order" is rendered in the foot, outside this tree, so the
// trigger is shared through a custom event: simple, and the foot stays dumb.
function ReviewTrigger({ onOpen, disabled }: { onOpen: () => void; disabled: boolean }) {
  useEffect(() => {
    const handler = () => {
      if (!disabled) onOpen();
    };
    window.addEventListener("chowly:view-order", handler);
    return () => window.removeEventListener("chowly:view-order", handler);
  }, [onOpen, disabled]);
  return null;
}

function DishRow({ item, quantity, onAdd, onRemove, reduce }: { item: MenuItemView; quantity: number; onAdd: () => void; onRemove: () => void; reduce: boolean }) {
  return (
    <li className="row flex items-center gap-[17px] border-b border-[color:var(--hairline)] px-[22px] py-5">
      <DishPhoto src={item.photo} alt="" size={76} />
      <div className="min-w-0 flex-1">
        <h3 className="serif text-[20px] leading-[1.2]">{item.name}</h3>
        <p className="pretty mt-[5px] text-[12px] leading-[1.5] text-fg-muted">{item.description}</p>
        <div className="mt-[10px] flex items-baseline gap-[10px]">
          <span className="text-[14px] font-semibold text-accent">{item.price}</span>
          <span className="text-[11.5px] text-fg-muted">{item.prepTimeMinutes} min</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <Stepper quantity={quantity} onAdd={onAdd} onRemove={onRemove} reduce={reduce} name={item.name} />
      </div>
    </li>
  );
}

// The add control. One element that morphs: a 38px circle at zero, a pill with the
// minus, the count and the plus once something is on the order. Width and colour
// glide between the two; under reduced motion it changes at once.
function Stepper({ quantity, onAdd, onRemove, reduce, name, small = false }: { quantity: number; onAdd: () => void; onRemove: () => void; reduce: boolean; name: string; small?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const was = useRef(quantity);
  const has = quantity > 0;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const changed = (was.current > 0) !== has;
    was.current = quantity;
    if (!changed || reduce) return;
    animate(el, { width: has ? [38, 92] : [92, 38], duration: 200, ease: "outQuad" });
    animate(el.querySelectorAll(".glyph"), { opacity: [0, 1], duration: 180, delay: 60 });
  }, [has, quantity, reduce]);
  const size = small ? 34 : 38;
  return (
    <div ref={ref} className="tone flex items-center justify-center overflow-hidden rounded-full" style={{ height: size, width: has ? 92 : size, background: has ? "var(--accent)" : "var(--accent-ghost)", border: `1px solid ${has ? "var(--accent)" : "var(--accent-ghost-border)"}`, color: has ? "var(--bg)" : "var(--accent)", transition: reduce ? "none" : "background-color 200ms ease, border-color 200ms ease, color 200ms ease" }}>
      {has ? (
        <>
          <button type="button" onClick={onRemove} className="glyph press flex h-full items-center px-[10px] text-[15px] leading-none" aria-label={`Remove one ${name}`}>−</button>
          <span className="glyph tabular min-w-[9px] text-center text-[13px] font-bold" aria-live="polite">{quantity}</span>
          <button type="button" data-add onClick={onAdd} className="glyph press flex h-full items-center px-[10px] text-[15px] leading-none" aria-label={`Add one more ${name}`}>+</button>
        </>
      ) : (
        <button type="button" data-add onClick={onAdd} className="press flex h-full w-full items-center justify-center text-[20px] leading-none" aria-label={`Add ${name} to order`}>+</button>
      )}
    </div>
  );
}

// The persistent cart bar. It never disappears: empty, it says so in the same slot,
// so the layout does not jump. It rises once, the first time an item lands.
function CartBar({ count, totalKobo, ready }: { count: number; totalKobo: number; ready: boolean }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const risen = useRef(false);
  const shownCount = useTicker(count, reduce);
  const shownTotal = useTicker(totalKobo, reduce, 420);
  useEffect(() => {
    if (count === 0 || risen.current || !ref.current) return;
    risen.current = true;
    if (reduce) return;
    animate(ref.current, { y: [56, 0], opacity: [0, 1], duration: 360, ease: "outQuart" });
  }, [count, reduce]);
  if (!ready) return <div className="h-[63px] border-t border-[color:var(--hairline)] bg-surface" aria-hidden="true" />;
  if (count === 0) {
    return <div className="border-t border-[color:var(--hairline)] bg-surface p-5 text-center text-[13px] text-fg-muted" aria-live="polite">Your order is empty</div>;
  }
  return (
    <div ref={ref} className="flex items-center justify-between border-t border-[color:var(--accent-cart-border)] bg-surface py-4 pl-[22px] pr-4">
      <div>
        <p className="tabular text-[11.5px] text-fg-muted" aria-live="polite">{shownCount} {shownCount === 1 ? "item" : "items"}</p>
        <p className="serif struck tabular mt-[2px] text-[23px] leading-[1.1]">{formatNaira(shownTotal)}</p>
      </div>
      <button type="button" data-open-order onClick={() => window.dispatchEvent(new Event("chowly:view-order"))} className="press rounded-full bg-accent px-5 py-[13px] text-[13.5px] font-semibold text-bg">View order</button>
    </div>
  );
}
