"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { formatNaira } from "@/lib/money";
import { Dish } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { useCart } from "@/components/walkthrough/use-cart";
import { useMenu } from "@/components/walkthrough/use-menu";
import type { MenuView } from "@/lib/menu";
import { Lamp } from "./lamp";
import { PASS_PALETTE, PassFrame, base } from "./frame";

// The ordering screen, rebuilt around the task. The dishes are painted on plates down
// the strips, every row is one tap to add, and the ticket stays out of the way: a
// counter strip along the bottom that says what is on it, and opens the ticket only
// when asked. Nothing decorative sits in the path. The lamps stay on the rail, above.
export function PassMenu() {
  const { menu, error } = useMenu();
  return (
    <PassFrame>
      {menu ? <MenuBody menu={menu} /> : <main className="mx-auto max-w-6xl px-4 pt-[110px] text-sm text-ink-soft sm:px-8 sm:pt-52">{error ? <span role="alert" className="font-bold text-char-ink">{error.message}</span> : "Printing the strips."}</main>}
    </PassFrame>
  );
}

function MenuBody({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const cart = useCart(menu);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const reduce = self?.matches.reduceMotion === true;
      self?.add("count", (el: HTMLElement) => animate(el, reduce ? { opacity: [0, 1], duration: 120 } : { opacity: [0, 1], y: [6, 0], duration: 160, ease: "outQuad" }));
      self?.add("sheet", (el: HTMLElement) => animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [40, 0], duration: 260, ease: "outQuad" }));
      self?.add("tear", (onDone: () => void) => {
        if (reduce) {
          onDone();
          return;
        }
        createTimeline({ onComplete: onDone })
          .add(".ticket", { y: -24, rotate: -2.5, duration: 220, ease: "inQuad" })
          .add(".ticket", { y: "-70vh", x: 50, rotate: [-2.5, 4], duration: 700, ease: "outQuad" })
          .add(".ticket", { opacity: 0, duration: 200 }, "-=100");
      });
      const all = [".lamp", ".pass-name", ".pass-sub", ".strip", ".counter-bar"];
      if (reduce || !firstVisit("one-menu")) {
        animate(all, { opacity: [0, 1], duration: 200 });
        animate(".row", { opacity: 1, duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      utils.set([".lamp", ".strip"], { opacity: 0 });
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".lamp", { opacity: [0, 1], duration: 360, ease: "outQuad", delay: stagger(220) })
        .add(".pass-name", { opacity: [0, 1], y: [8, 0], duration: 600 }, "-=400")
        .add(".pass-sub", { opacity: [0, 1], duration: 350 }, "-=300")
        .add(".strip", { opacity: [0, 1], y: [-50, 0], rotate: [(_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 1.4 : -1.4), 0], duration: 800, ease: "outBack(1.3)", delay: stagger(150) }, "-=300")
        .add(".row", { opacity: [0, 1], duration: 140, delay: stagger(22) }, "-=500")
        .add(".counter-bar", { opacity: [0, 1], y: [24, 0], duration: 400 }, "-=300");
    });
    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    if (!open) return;
    const sheet = root.current?.querySelector<HTMLElement>(".sheet");
    if (sheet) scope.current?.methods.sheet?.(sheet);
    root.current?.querySelector<HTMLElement>(".sheet input")?.focus();
  }, [open]);

  async function fire() {
    const placed = await cart.fire();
    if (!placed) return;
    scope.current?.methods.tear?.(() => router.push(`${base}/order/${placed.id}`));
  }
  const empty = cart.count === 0;
  return (
    <div ref={root}>
      <div className="pointer-events-none absolute inset-x-0 top-[18px] hidden sm:block" aria-hidden="true">
        <div className="relative mx-auto max-w-6xl">
          {[{ left: "26%", seed: 1 }, { left: "44%", seed: 2 }, { left: "62%", seed: 3 }].map((lamp) => (
            <div key={lamp.seed} className="lamp absolute -translate-x-1/2" style={{ left: lamp.left, opacity: 0 }}>
              <Lamp seed={lamp.seed} width={170} />
            </div>
          ))}
        </div>
      </div>
      <header className="relative mx-auto max-w-6xl px-4 pb-4 pt-7 sm:px-8 sm:pt-[190px]">
        <h1 className="pass-name display sign-text text-[2.3rem] leading-none sm:text-6xl" style={{ opacity: 0 }}>{menu.restaurant.name}</h1>
        <p className="pass-sub mt-2 text-[13px] text-ink-soft sm:text-sm" style={{ opacity: 0 }}>{menu.restaurant.location}. Tap a plus to put a dish on your ticket.</p>
      </header>
      <main className="mx-auto max-w-6xl px-3 pb-28 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2 md:gap-10">
          {menu.menus.map((section) => (
            <section key={section.id} className="strip paper torn-bottom px-3 pt-4 sm:px-6" style={{ opacity: 0, transformOrigin: "50% 0" }} aria-labelledby={`one-${section.id}`}>
              <div className="flex items-baseline justify-between border-b-2 border-dashed border-ink px-1 pb-2">
                <h2 id={`one-${section.id}`} className="text-base font-bold">{section.name.toUpperCase()}</h2>
                <span className="text-xs text-ink-soft">{section.items.length} dishes</span>
              </div>
              <ul>
                {section.items.map((item) => {
                  const q = cart.cart[item.id] ?? 0;
                  return (
                    <li key={item.id} className="row flex items-center gap-3 border-b border-dashed border-[color:var(--ink-soft)] py-2.5 last:border-b-0" style={{ opacity: 0 }}>
                      <div className="plate3 h-[68px] w-[68px] shrink-0" aria-hidden="true"><Dish id={item.id} material="gouache" palette={PASS_PALETTE} size={58} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold leading-tight">{item.name}{q > 0 ? <span className="count ml-2 text-char-ink"> x{q}</span> : null}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-soft">{item.description}</p>
                        <p className="tabular mt-1 text-[13px]"><span className="font-bold">{item.price}</span> <span className="text-ink-soft">{item.prepTimeMinutes} min</span></p>
                      </div>
                      <div className="flex shrink-0 flex-col items-center gap-1.5">
                        <button type="button" data-add={item.id} onClick={(e) => { cart.add(item); const c = e.currentTarget.closest("li")?.querySelector<HTMLElement>(".count"); requestAnimationFrame(() => { const el = e.currentTarget?.closest("li")?.querySelector<HTMLElement>(".count") ?? c; if (el) scope.current?.methods.count?.(el); }); }} className="stamp-button flex h-11 w-11 items-center justify-center bg-char-ink text-xl leading-none text-paper" aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes`}>+</button>
                        {q > 0 ? <button type="button" onClick={() => cart.remove(item)} className="flex h-8 w-8 items-center justify-center border-2 border-ink bg-paper text-base font-bold leading-none" aria-label={`Remove one ${item.name}`}>-</button> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
      {/* The counter along the bottom edge: what is on the ticket, and the way to it. */}
      <div className="counter-bar fixed inset-x-0 bottom-0 z-20 wood3 border-t-2 border-[color:var(--wood-light)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 sm:px-8" style={{ opacity: 0 }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className="tabular min-w-0 flex-1 truncate text-[13px] text-paper-fresh" aria-live="polite" style={{ color: "var(--paper-fresh)" }}>
            {cart.fired ? `Fired as ${cart.fired.reference}` : empty ? "Nothing on your ticket yet." : `${cart.count} ${cart.count === 1 ? "dish" : "dishes"} on your ticket, ${formatNaira(cart.totalKobo)}`}
          </p>
          <button type="button" data-open-ticket disabled={empty || cart.fired !== null} onClick={() => setOpen(true)} className="stamp-button bg-paper px-4 py-2.5 text-sm text-ink disabled:opacity-60">
            {empty ? "Your ticket" : "See the ticket"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-30" role="presentation">
          <button type="button" className="absolute inset-0 h-full w-full bg-[color:var(--soot)]/60" aria-label="Back to the menu" onClick={() => setOpen(false)} />
          <form aria-label="Your ticket" className="sheet absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto" onSubmit={(e) => { e.preventDefault(); void fire(); }} noValidate style={{ opacity: 0 }}>
            <div className="ticket paper torn-top mx-auto max-w-xl px-5 pb-5 sm:px-7" style={{ transformOrigin: "50% 100%" }}>
              <div className="flex items-baseline justify-between border-b-2 border-dashed border-ink pb-2">
                <span className="font-bold">YOUR TICKET</span>
                <span className="text-xs text-ink-soft">{cart.count} {cart.count === 1 ? "dish" : "dishes"}</span>
              </div>
              <ul className="py-2 text-sm">
                {cart.lines.map((line) => (
                  <li key={line.item.id} className="flex items-center justify-between gap-3 py-1">
                    <span className="flex items-center gap-2"><span className="plate3 h-8 w-8" aria-hidden="true"><Dish id={line.item.id} material="gouache" palette={PASS_PALETTE} size={26} /></span>{line.item.name} <span className="font-bold text-char-ink">x{line.quantity}</span></span>
                    <span className="flex items-center gap-2"><span className="tabular">{formatNaira(line.item.priceKobo * line.quantity)}</span><button type="button" onClick={() => cart.remove(line.item)} className="h-7 w-7 border-2 border-ink font-bold leading-none" aria-label={`Remove one ${line.item.name}`}>-</button></span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-dashed border-ink pt-3">
                <label className="flex items-center gap-2 text-sm font-bold">TABLE <input className="tabular w-16 border-2 border-ink bg-paper px-2 py-1.5 font-bold" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" /></label>
                <span className="tabular ml-auto text-lg font-bold">{formatNaira(cart.totalKobo)}</span>
                <button type="submit" data-fire disabled={cart.firing || cart.fired !== null} className="stamp-button bg-char-ink px-4 py-2.5 text-paper">{cart.fired ? "Fired" : cart.firing ? "Firing" : "Fire the order"}</button>
              </div>
              {cart.error ? <p role="alert" className="mt-3 text-sm font-bold text-char-ink">{cart.error}</p> : null}
              <button type="button" onClick={() => setOpen(false)} className="mt-3 text-xs underline">Keep choosing</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
