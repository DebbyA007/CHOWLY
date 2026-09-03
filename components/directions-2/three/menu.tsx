"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { Dish } from "../shared/dishes";
import { useCart } from "../shared/use-cart";
import { GLAZE_PALETTE, GlazeFrame } from "./frame";

const base = "/directions-2/three";

// Plates on the terrazzo. Every dish is glazed onto its own plate; tap the plate.
export function GlazeMenu({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const cart = useCart(menu);
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate([".head", ".dish", ".bill"], { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(".bill", { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".head", { opacity: [0, 1], duration: 500 }, 100)
        .add(".dish", { opacity: [0, 1], scale: [1.08, 1], duration: 600, ease: "outBack(1.1)", delay: stagger(60, { from: "center" }) }, "-=250")
        .add(".bill", { opacity: [0, 1], y: [16, 0], duration: 450 }, "-=400");
    });
    return () => scope.revert();
  }, []);
  async function order(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const placed = await cart.fire();
    if (placed) router.push(`${base}/order/${placed.id}`);
  }
  return (
    <GlazeFrame>
      <div ref={root}>
        <main className="mx-auto max-w-3xl px-5 pb-48 pt-6">
          <h1 className="head news text-4xl" style={{ opacity: 0 }}>The plates</h1>
          <p className="head mt-1 text-[14px] text-[var(--ink-soft)]" style={{ opacity: 0 }}>Tap a plate to bring it to the table. The minutes are the kitchen&apos;s.</p>
          {menu.menus.map((section) => (
            <section key={section.id} className="mt-6" aria-labelledby={`three-${section.id}`}>
              <h2 id={`three-${section.id}`} className="head news text-2xl" style={{ opacity: 0 }}>{section.type === "FOOD" ? "Kitchen" : "Bar"}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                {section.items.map((item) => {
                  const q = cart.cart[item.id] ?? 0;
                  return (
                    <li key={item.id} className="dish flex flex-col items-center text-center" style={{ opacity: 0 }}>
                      <button type="button" onClick={() => cart.add(item)} className="plate relative flex h-[132px] w-[132px] items-center justify-center" aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes`}>
                        <Dish id={item.id} material="glaze" palette={GLAZE_PALETTE} size={104} />
                        {q > 0 ? <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--teal)] text-[13px] font-bold text-[var(--white)]" aria-hidden="true">{q}</span> : null}
                      </button>
                      <span className="news mt-2 block text-[19px] leading-tight">{item.name}</span>
                      <span className="block text-[13px] font-bold tabular">{item.price} <span className="font-normal text-[var(--ink-soft)]">{item.prepTimeMinutes} min</span></span>
                      {q > 0 ? <button type="button" onClick={() => cart.remove(item)} aria-label={`Remove one ${item.name}`} className="mt-1 h-7 w-7 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--white)] text-base font-bold leading-none">-</button> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </main>
        <form onSubmit={order} noValidate className="bill fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ opacity: 0 }} aria-label="Your order">
          <div className="glazed mx-auto max-w-3xl px-4 pb-3 pt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="min-w-0 flex-1 text-[14px]">
                {cart.count === 0 ? <span className="text-[var(--ink-soft)]">Nothing brought to the table yet. Tap a plate.</span> : <><span className="font-bold">{cart.count} {cart.count === 1 ? "plate" : "plates"}</span><span className="block truncate text-[var(--ink-soft)]">{cart.lines.map((l) => `${l.item.name} x${l.quantity}`).join(", ")}</span></>}
              </p>
              {cart.count > 0 ? (
                <>
                  <label className="flex items-center gap-2 text-[13px] font-bold">Table <input className="field w-16 tabular" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" /></label>
                  <span className="news text-2xl tabular">{formatNaira(cart.totalKobo)}</span>
                  <button type="submit" disabled={cart.firing || cart.fired !== null} className="btn ml-auto text-[14px]">{cart.fired ? "Ordered" : cart.firing ? "Ordering" : "Order"}</button>
                </>
              ) : null}
              {cart.error ? <p role="alert" className="basis-full text-[13px] font-bold" style={{ color: "var(--rust)" }}>{cart.error}</p> : null}
            </div>
          </div>
        </form>
      </div>
    </GlazeFrame>
  );
}
