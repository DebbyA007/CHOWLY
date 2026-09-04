"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate, createScope } from "animejs";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { Dish } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { useCart } from "@/components/walkthrough/use-cart";
import { useMenu } from "@/components/walkthrough/use-menu";
import { RUN_PALETTE, RunFrame, base } from "./frame";

// Not a feed. The tray holds every bowl around its rim; turn it and one bowl comes to
// the front, large, with its name, its price and the kitchen's minutes. One action,
// in the lower third: put it on my tray.
export function RunMenu() {
  const { menu, error } = useMenu();
  return <RunFrame>{menu ? <Tray menu={menu} /> : <main className="mx-auto max-w-6xl px-4 pt-10 text-sm sm:px-8">{error ? <span role="alert" className="font-bold text-[color:var(--red)]">{error.message}</span> : "Setting the tray."}</main>}</RunFrame>;
}

function Tray({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const items: MenuItemView[] = menu.menus.flatMap((s) => s.items);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const cart = useCart(menu);
  const n = items.length;
  const current = items[index] ?? items[0]!;
  const q = cart.cart[current.id] ?? 0;
  const section = menu.menus.find((s) => s.items.some((i) => i.id === current.id));
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const reduce = self?.matches.reduceMotion === true;
      self?.add("panel", (el: HTMLElement) => animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [30, 0], duration: 260, ease: "outQuad" }));
      self?.add("send", (onDone: () => void) => {
        if (reduce) {
          onDone();
          return;
        }
        animate(".chit", { x: [0, 420], rotate: [0, 6], opacity: [1, 0], duration: 600, ease: "inQuad", onComplete: onDone });
      });
      if (reduce || !firstVisit("two-menu")) {
        animate([".tray", ".front", ".aside"], { opacity: [0, 1], duration: 200 });
        return;
      }
      animate(".tray", { opacity: [0, 1], rotate: [-50, 0], duration: 1200, ease: "outQuint" });
      animate([".front", ".aside"], { opacity: [0, 1], duration: 500, delay: 500 });
    });
    return () => scope.current?.revert();
  }, []);
  useEffect(() => {
    if (!open) return;
    const el = root.current?.querySelector<HTMLElement>(".chit");
    if (el) scope.current?.methods.panel?.(el);
    root.current?.querySelector<HTMLElement>(".chit input")?.focus();
  }, [open]);

  const turn = (d: number) => setIndex((i) => (i + d + n) % n);
  async function send() {
    const placed = await cart.fire();
    if (!placed) return;
    scope.current?.methods.send?.(() => router.push(`${base}/order/${placed.id}`));
  }
  return (
    <div ref={root}>
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-3 sm:px-8 lg:grid lg:grid-cols-[520px_1fr] lg:items-start lg:gap-12">
        <div className="flex items-center justify-between lg:col-span-2">
          <h1 className="syne text-2xl leading-none sm:text-4xl">{menu.restaurant.name}</h1>
          <button type="button" data-open-ticket disabled={cart.count === 0 || cart.fired !== null} onClick={() => setOpen(true)} className="btn quiet px-3 py-2 text-[13px] disabled:opacity-60" aria-label={`Your tray, ${cart.count} bowls`}>
            My tray <span className="tabular ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[color:var(--ink)] px-1 text-[12px] text-[color:var(--chalk)]">{cart.count}</span>
          </button>
        </div>
        {/* The tray. Every bowl sits on its rim; the chosen one is turned to the top. */}
        <div className="relative mx-auto mt-3 aspect-square w-full max-w-[340px] sm:max-w-[440px] lg:max-w-none" onPointerDown={(e) => { dragStart.current = e.clientX; }} onPointerUp={(e) => { if (dragStart.current === null) return; const dx = e.clientX - dragStart.current; dragStart.current = null; if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1); }}>
          <div className="tray lacquer absolute inset-0 rounded-full" style={{ opacity: 0 }}>
            <div className="ring absolute inset-0" style={{ transform: `rotate(${(-index * 360) / n}deg)` }}>
              {items.map((item, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                const selected = i === index;
                return (
                  <button key={item.id} type="button" data-show={item.id} onClick={() => setIndex(i)} aria-label={`Show ${item.name}`} aria-pressed={selected} className="absolute" style={{ left: `${(50 + Math.cos(a) * 42).toFixed(2)}%`, top: `${(50 + Math.sin(a) * 42).toFixed(2)}%`, transform: `translate(-50%, -50%) rotate(${(index * 360) / n}deg)`, transition: "transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
                    <span className={`bowl block h-11 w-11 sm:h-14 sm:w-14 ${selected ? "ring-4 ring-[color:var(--mustard)]" : ""}`}><Dish id={item.id} material="glaze" palette={RUN_PALETTE} size={34} className="sm:hidden" /><Dish id={item.id} material="glaze" palette={RUN_PALETTE} size={44} className="hidden sm:block" /></span>
                  </button>
                );
              })}
            </div>
            <div className="front absolute inset-[22%] flex flex-col items-center justify-center text-center" style={{ opacity: 0 }}>
              <div className="bowl h-[104px] w-[104px] sm:h-[150px] sm:w-[150px]" aria-hidden="true"><Dish id={current.id} material="glaze" palette={RUN_PALETTE} size={84} className="sm:hidden" /><Dish id={current.id} material="glaze" palette={RUN_PALETTE} size={122} className="hidden sm:block" /></div>
              <p className="syne mt-2 text-[17px] leading-tight text-[color:var(--chalk)] sm:text-2xl">{current.name}</p>
              <p className="tabular text-[13px] text-[color:var(--chalk)] sm:text-base"><span className="font-bold">{current.price}</span>, {current.prepTimeMinutes} min</p>
            </div>
          </div>
        </div>
        <div className="aside mt-4 lg:mt-12" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" data-prev onClick={() => turn(-1)} className="btn quiet px-3 py-2 text-sm" aria-label="Previous bowl">Back</button>
            <p className="tabular text-center text-[13px] text-[color:var(--ink-soft)]"><span className="font-bold text-[color:var(--ink)]">{index + 1}</span> of {n}, {section?.name ?? ""}</p>
            <button type="button" data-next onClick={() => turn(1)} className="btn quiet px-3 py-2 text-sm" aria-label="Next bowl">Next</button>
          </div>
          <p className="chalk mt-3 px-4 py-3 text-[14px] leading-snug">{current.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" data-add={current.id} onClick={() => cart.add(current)} className="btn flex-1 text-[16px]" aria-label={`Add ${current.name}, ${current.price}, ${current.prepTimeMinutes} minutes`}>
              Put it on my tray{q > 0 ? <span className="tabular ml-2 rounded-full bg-[color:var(--ink)] px-2 py-0.5 text-[13px] text-[color:var(--chalk)]">x{q}</span> : null}
            </button>
            {q > 0 ? <button type="button" onClick={() => cart.remove(current)} className="btn quiet h-[50px] w-[50px] px-0 text-xl" aria-label={`Remove one ${current.name}`}>-</button> : null}
          </div>
        </div>
      </main>
      {open ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center" role="presentation">
          <button type="button" className="absolute inset-0 h-full w-full bg-[color:var(--ink)]/60" aria-label="Back to the tray" onClick={() => setOpen(false)} />
          <form aria-label="Your ticket" className="chit chalk relative max-h-[85dvh] w-full max-w-md overflow-y-auto px-5 py-5" onSubmit={(e) => { e.preventDefault(); void send(); }} noValidate style={{ opacity: 0 }}>
            <h2 className="syne text-2xl">My tray</h2>
            <ul className="mt-3 divide-y-2 divide-dashed divide-[color:var(--ink)] text-[15px]">
              {cart.lines.map((l) => (
                <li key={l.item.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="flex items-center gap-2"><span className="bowl h-9 w-9" aria-hidden="true"><Dish id={l.item.id} material="glaze" palette={RUN_PALETTE} size={28} /></span>{l.item.name} <span className="font-bold">x{l.quantity}</span></span>
                  <span className="flex items-center gap-2"><span className="tabular">{formatNaira(l.item.priceKobo * l.quantity)}</span><button type="button" onClick={() => cart.remove(l.item)} className="h-8 w-8 border-2 border-[color:var(--ink)] font-bold leading-none" aria-label={`Remove one ${l.item.name}`}>-</button></span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-[color:var(--ink)] pt-3">
              <label className="flex items-center gap-2 text-sm font-bold">Table <input className="field tabular w-16" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" /></label>
              <span className="syne ml-auto text-xl">{formatNaira(cart.totalKobo)}</span>
            </div>
            {cart.error ? <p role="alert" className="mt-2 text-sm font-bold text-[color:var(--red)]">{cart.error}</p> : null}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setOpen(false)} className="text-sm underline">Keep turning</button>
              <button type="submit" data-fire disabled={cart.firing || cart.fired !== null} className="btn text-[15px]">{cart.fired ? "Sent" : cart.firing ? "Sending" : "Send it to the kitchen"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
