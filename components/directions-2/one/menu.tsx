"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { Dish } from "../shared/dishes";
import { useCart } from "../shared/use-cart";
import { LINEN_PALETTE, LinenFrame } from "./frame";

const base = "/directions-2/one";

// The card: a folded linen card on the cloth, the dishes painted in gouache beside their
// names. Tap a dish and it goes on your napkin at the bottom of the table.
export function LinenMenu({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const cart = useCart(menu);

  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate([".card", ".row", ".napkin"], { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set([".card", ".napkin"], { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".card", { opacity: [0, 1], scaleY: [0.96, 1], duration: 600 }, 100)
        .add(".row", { opacity: [0, 1], x: [-8, 0], duration: 350, delay: stagger(40) }, "-=300")
        .add(".napkin", { opacity: [0, 1], y: [20, 0], duration: 450 }, "-=400");
    });
    return () => scope.revert();
  }, []);

  async function place(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const placed = await cart.fire();
    if (placed) router.push(`${base}/order/${placed.id}`);
  }

  return (
    <LinenFrame>
      <div ref={root} className="relative">
        <div className="sun" aria-hidden="true" />
        <main className="relative mx-auto max-w-3xl px-4 pb-44 pt-6 sm:px-5">
          <div className="card stitched rounded-2xl px-4 pb-6 pt-5 sm:px-7" style={{ opacity: 0, transformOrigin: "50% 0" }}>
            <h1 className="serif text-4xl italic leading-none">The card</h1>
            <p className="mt-1 text-[14px] text-[var(--ink-soft)]">Tap a dish to put it on your napkin. The kitchen tells you how long it will take.</p>
            {menu.menus.map((section) => (
              <section key={section.id} className="mt-6" aria-labelledby={`one-${section.id}`}>
                <h2 id={`one-${section.id}`} className="serif text-2xl italic">
                  {section.type === "FOOD" ? "From the kitchen" : "From the bar"}
                </h2>
                <ul className="mt-2 divide-y divide-[var(--thread)]">
                  {section.items.map((item) => {
                    const q = cart.cart[item.id] ?? 0;
                    return (
                      <li key={item.id} className="row flex items-center gap-3 py-2.5" style={{ opacity: 0 }}>
                        <button type="button" onClick={() => cart.add(item)} className="row flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes`}>
                          <span className="dish-lift relative shrink-0">
                            <Dish id={item.id} material="gouache" palette={LINEN_PALETTE} size={72} />
                            {q > 0 ? (
                              <span className="stitched absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold" aria-hidden="true">
                                {q}
                              </span>
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="serif block text-[21px] italic leading-tight">{item.name}</span>
                            <span className="block text-[13px] leading-snug text-[var(--ink-soft)]">{item.description}</span>
                            <span className="mt-0.5 block text-[12px] text-[var(--ink-soft)]">{item.prepTimeMinutes} minutes</span>
                          </span>
                          <span className="shrink-0 text-[16px] font-bold tabular">{item.price}</span>
                        </button>
                        {q > 0 ? (
                          <button type="button" onClick={() => cart.remove(item)} aria-label={`Remove one ${item.name}`} className="stitched flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold">
                            -
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </main>

        {/* the napkin: the order in hand, within the thumb's reach */}
        <form onSubmit={place} noValidate className="napkin fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3 sm:px-5" style={{ opacity: 0 }} aria-label="Your order">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2">
            <p className="min-w-0 flex-1 text-[14px]">
              {cart.count === 0 ? (
                <span className="text-[var(--ink-soft)]">Nothing on the napkin yet. Tap a dish.</span>
              ) : (
                <>
                  <span className="font-bold">{cart.count} {cart.count === 1 ? "dish" : "dishes"}</span>
                  <span className="block truncate text-[var(--ink-soft)]">{cart.lines.map((l) => `${l.item.name} x${l.quantity}`).join(", ")}</span>
                </>
              )}
            </p>
            {cart.count > 0 ? (
              <>
                <label className="flex items-center gap-2 text-[13px] font-bold">
                  Table
                  <input className="field w-16 tabular" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" />
                </label>
                <span className="serif text-2xl italic tabular">{formatNaira(cart.totalKobo)}</span>
                <button type="submit" disabled={cart.firing || cart.fired !== null} className="btn ml-auto text-[14px]">
                  {cart.fired ? "Sent" : cart.firing ? "Sending" : "Ask the kitchen"}
                </button>
              </>
            ) : null}
            {cart.error ? (
              <p role="alert" className="basis-full text-[13px] font-bold" style={{ color: "var(--tomato)" }}>
                {cart.error}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </LinenFrame>
  );
}
