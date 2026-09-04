"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import type { MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { Dish } from "@/components/walkthrough/dishes";
import { useCart } from "@/components/walkthrough/use-cart";
import { BILL_PALETTE, BillFrame } from "./frame";

const base = "/directions-2/two";

// The bill of fare: one long printed column, the dishes drawn in ink with a second
// colour a hair out of register, dotted leaders to the prices.
export function BillMenu({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const cart = useCart(menu);
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (self?.matches.reduceMotion) {
        animate([".row", ".slip", ".head"], { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(".slip", { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".head", { opacity: [0, 1], duration: 500 }, 100)
        .add(".row", { opacity: [0, 1], duration: 300, delay: stagger(45) }, "-=250")
        .add(".slip", { opacity: [0, 1], y: [16, 0], duration: 450 }, "-=400");
    });
    return () => scope.revert();
  }, []);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const placed = await cart.fire();
    if (placed) router.push(`${base}/order/${placed.id}`);
  }
  return (
    <BillFrame>
      <div ref={root}>
        <main className="mx-auto max-w-2xl px-5 pb-44 pt-6">
          <h1 className="head garamond misreg text-4xl italic" style={{ opacity: 0 }}>Bill of fare</h1>
          <p className="head mt-1 text-[15px] italic text-[var(--ink-soft)]" style={{ opacity: 0 }}>Touch a dish to set it down on your order. The minutes are the kitchen&apos;s own.</p>
          {menu.menus.map((section) => (
            <section key={section.id} className="mt-6" aria-labelledby={`two-${section.id}`}>
              <h2 id={`two-${section.id}`} className="head garamond rule pt-2 text-2xl" style={{ opacity: 0 }}>
                {section.type === "FOOD" ? "First, from the kitchen" : "Then, from the bar"}
              </h2>
              <ul className="mt-1">
                {section.items.map((item) => {
                  const q = cart.cart[item.id] ?? 0;
                  return (
                    <li key={item.id} className="row flex items-center gap-2 py-2" style={{ opacity: 0 }}>
                      <button type="button" onClick={() => cart.add(item)} className="grid min-w-0 flex-1 grid-cols-[56px_1fr_auto] items-center gap-3 text-left" aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes`}>
                        <Dish id={item.id} material="ink" palette={BILL_PALETTE} size={56} />
                        <span className="min-w-0">
                          <span className="garamond block text-[21px] leading-tight">
                            {item.name}
                            {q > 0 ? <span className="ml-2 text-[17px] font-bold" style={{ color: "var(--green)" }}>x{q}</span> : null}
                          </span>
                          <span className="block text-[14px] italic leading-snug text-[var(--ink-soft)]">{item.description} {item.prepTimeMinutes} minutes.</span>
                        </span>
                        <span className="flex items-baseline gap-2"><span className="leader w-4" aria-hidden="true" /><span className="garamond text-[19px]">{item.price}</span></span>
                      </button>
                      {q > 0 ? <button type="button" onClick={() => cart.remove(item)} aria-label={`Remove one ${item.name}`} className="garamond h-8 w-8 border border-[var(--ink)] text-lg leading-none">-</button> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </main>
        <form onSubmit={send} noValidate className="slip fixed inset-x-0 bottom-0 z-20 px-5 pb-4 pt-3" style={{ opacity: 0, background: "var(--paper)" }} aria-label="Your order">
          <div className="rule-double mx-auto max-w-2xl px-1 py-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="min-w-0 flex-1 text-[15px]">
                {cart.count === 0 ? <span className="italic text-[var(--ink-soft)]">Nothing set down yet. Touch a dish.</span> : <><span className="garamond text-[17px]">{cart.count} {cart.count === 1 ? "dish" : "dishes"}</span><span className="block truncate text-[13px] italic text-[var(--ink-soft)]">{cart.lines.map((l) => `${l.item.name} x${l.quantity}`).join(", ")}</span></>}
              </p>
              {cart.count > 0 ? (
                <>
                  <label className="flex items-center gap-2 text-[14px]">Table <input className="field w-16 work" value={cart.tableNo} onChange={(e) => cart.setTableNo(e.target.value)} inputMode="numeric" maxLength={8} aria-label="Table number" /></label>
                  <span className="garamond text-2xl">{formatNaira(cart.totalKobo)}</span>
                  <button type="submit" disabled={cart.firing || cart.fired !== null} className="ink-button ml-auto">{cart.fired ? "Sent" : cart.firing ? "Sending" : "Send to the kitchen"}</button>
                </>
              ) : null}
              {cart.error ? <p role="alert" className="basis-full text-[14px] font-bold" style={{ color: "var(--green)" }}>{cart.error}</p> : null}
            </div>
          </div>
        </form>
      </div>
    </BillFrame>
  );
}
