"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import type { MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { Dish } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { useCart } from "@/components/walkthrough/use-cart";
import { useMenu } from "@/components/walkthrough/use-menu";
import { MAT_PALETTE, MatFrame, base, useWide } from "./frame";

// The menu is printed on the placemat, the way a diner's is: bowls in rows, the dish
// painted in each, its name and price beneath. Tap a bowl to add it. The chit is a
// paper slip clipped to the mat's corner; on a wide table it lies open beside the mat.
export function MatMenu() {
  const { menu, error } = useMenu();
  return <MatFrame>{menu ? <Mat menu={menu} /> : <main className="mx-auto max-w-6xl px-3 pt-6 sm:px-6"><div className="kraft px-5 py-5 text-sm">{error ? <span role="alert" className="font-extrabold text-[color:var(--pepper)]">{error.message}</span> : "Laying the table."}</div></main>}</MatFrame>;
}

function Mat({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const cart = useCart(menu);
  const wide = useWide();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const reduce = self?.matches.reduceMotion === true;
      self?.add("sheet", (el: HTMLElement) => animate(el, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [30, 0], duration: 240, ease: "outQuad" }));
      self?.add("send", (onDone: () => void) => {
        if (reduce) {
          onDone();
          return;
        }
        animate(".chit", { y: [0, -420], rotate: [0, -4], opacity: [1, 0], duration: 600, ease: "inQuad", onComplete: onDone });
      });
      if (reduce || !firstVisit("three-menu")) {
        animate([".mat", ".bowl-in", ".corner"], { opacity: [0, 1], duration: 200 });
        return;
      }
      animate(".mat", { opacity: [0, 1], y: [20, 0], duration: 600, ease: "outExpo" });
      animate(".bowl-in", { opacity: [0, 1], scale: [1.12, 1], duration: 550, ease: "outBack(1.2)", delay: stagger(45, { start: 250 }) });
      animate(".corner", { opacity: [0, 1], duration: 400, delay: 700 });
    });
    return () => scope.current?.revert();
  }, []);
  useEffect(() => {
    if (!open) return;
    const el = root.current?.querySelector<HTMLElement>(".chit");
    if (el) scope.current?.methods.sheet?.(el);
    root.current?.querySelector<HTMLElement>(".chit input")?.focus();
  }, [open]);
  async function send() {
    const placed = await cart.fire();
    if (!placed) return;
    scope.current?.methods.send?.(() => router.push(`${base}/order/${placed.id}`));
  }
  const chit = (
    <form aria-label="Your ticket" className="chit slip clipped px-4 pb-4 pt-6" onSubmit={(e) => { e.preventDefault(); void send(); }} noValidate style={{ opacity: wide ? 1 : 0 }}>
      <h2 className="young text-2xl">Your chit</h2>
      {cart.lines.length === 0 ? <p className="mt-2 text-[14px] text-[color:var(--ink-soft)]">Nothing on it yet. Tap a bowl.</p> : (
        <ul className="mt-2 divide-y divide-dashed divide-[color:var(--ink)] text-[15px]">
          {cart.lines.map((l) => (
            <li key={l.item.id} className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2"><span className="enamel h-8 w-8" aria-hidden="true"><Dish id={l.item.id} material="gouache" palette={MAT_PALETTE} size={24} /></span>{l.item.name} <span className="font-extrabold">x{l.quantity}</span></span>
              <span className="flex items-center gap-2"><span className="tabular">{formatNaira(l.item.priceKobo * l.quantity)}</span><button type="button" onClick={() => cart.remove(l.item)} className="h-7 w-7 border-[1.5px] border-[color:var(--ink)] font-extrabold leading-none" aria-label={`Remove one ${l.item.name}`}>-</button></span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-[1.5px] border-[color:var(--ink)] pt-3">
        <label className="flex items-center gap-2 text-[13px] font-extrabold">Table <input className="field tabular w-16" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" /></label>
        <span className="tabular ml-auto text-xl font-extrabold">{formatNaira(cart.totalKobo)}</span>
      </div>
      {cart.error ? <p role="alert" className="mt-2 text-[13px] font-extrabold text-[color:var(--pepper)]">{cart.error}</p> : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        {!wide ? <button type="button" onClick={() => setOpen(false)} className="text-[13px] underline">Keep looking</button> : <span />}
        <button type="submit" data-fire disabled={cart.firing || cart.fired !== null || cart.count === 0} className="btn text-[14px]">{cart.fired ? "Sent" : cart.firing ? "Sending" : "Send to the kitchen"}</button>
      </div>
    </form>
  );
  return (
    <div ref={root}>
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-3 sm:px-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-6 lg:pb-10">
        <section className="mat kraft px-4 pb-6 pt-5 sm:px-6" style={{ opacity: 0 }}>
          <h1 className="young text-3xl sm:text-5xl">{menu.restaurant.name}</h1>
          <p className="mt-1 text-[13px] text-[color:var(--ink-soft)] sm:text-sm">{menu.restaurant.location}. Tap a bowl to add it to your chit.</p>
          {menu.menus.map((section) => (
            <section key={section.id} className="mt-5" aria-labelledby={`three-${section.id}`}>
              <h2 id={`three-${section.id}`} className="young border-b-[1.5px] border-[color:var(--kraft-line)] pb-1 text-xl">{section.type === "FOOD" ? "From the kitchen" : "From the bar"}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                {section.items.map((item) => {
                  const q = cart.cart[item.id] ?? 0;
                  return (
                    <li key={item.id} className="flex flex-col items-center text-center">
                      <button type="button" data-add={item.id} onClick={() => cart.add(item)} className="bowl-in enamel relative h-[124px] w-[124px]" aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes`} style={{ opacity: 0 }}>
                        <Dish id={item.id} material="gouache" palette={MAT_PALETTE} size={96} />
                        {q > 0 ? <span className="slip absolute -right-1 -top-1 px-1.5 py-0.5 text-[12px] font-extrabold" aria-hidden="true">x{q}</span> : null}
                      </button>
                      <p className="young mt-2 text-[17px] leading-tight">{item.name}</p>
                      <p className="tabular text-[13px]"><span className="font-extrabold">{item.price}</span> <span className="text-[color:var(--ink-soft)]">{item.prepTimeMinutes} min</span></p>
                      {q > 0 ? <button type="button" onClick={() => cart.remove(item)} className="mt-1 h-7 w-7 rounded-full border-[1.5px] border-[color:var(--ink)] bg-[color:var(--slip)] text-base font-extrabold leading-none" aria-label={`Remove one ${item.name}`}>-</button> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </section>
        {wide ? <div className="sticky top-4">{chit}</div> : null}
      </main>
      {!wide ? (
        <>
          <div className="corner fixed bottom-4 left-3 z-20" style={{ opacity: 0 }}>
            <button type="button" data-open-ticket disabled={cart.count === 0 || cart.fired !== null} onClick={() => setOpen(true)} className="slip clipped px-4 pb-3 pt-4 text-left disabled:opacity-70" aria-label={`Your chit, ${cart.count} dishes`}>
              <span className="young block text-lg leading-none">Your chit</span>
              <span className="tabular mt-1 block text-[13px]">{cart.fired ? `Sent as ${cart.fired.reference}` : cart.count === 0 ? "Nothing on it yet." : `${cart.count} ${cart.count === 1 ? "dish" : "dishes"}, ${formatNaira(cart.totalKobo)}`}</span>
            </button>
          </div>
          {open ? (
            <div className="fixed inset-0 z-30 flex items-end" role="presentation">
              <button type="button" className="absolute inset-0 h-full w-full bg-[color:var(--indigo-deep)]/70" aria-label="Back to the placemat" onClick={() => setOpen(false)} />
              <div className="relative mx-auto w-full max-w-md px-3 pb-3">{chit}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
