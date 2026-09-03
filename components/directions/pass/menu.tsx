"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import "./pass.css";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";

type Scope = ReturnType<typeof createScope>;

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A heat lamp's pool of light as halftone: a grid of amber dots that grow toward the
// lamp and vanish at the edge. Texture, not a gradient, and it prints like one.
function HalftonePool({ seed }: { seed: number }) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    const step = 11;
    for (let y = step; y < 210; y += step) {
      for (let x = step / 2; x < 200; x += step) {
        const dx = (x - 100) / 100;
        const dy = y / 210;
        const d = Math.sqrt(dx * dx * 1.6 + dy * dy);
        const r = Math.max(0, 3.4 * (1 - d) - seeded(seed + x * 7 + y) * 0.7);
        if (r > 0.25) out.push({ x, y, r });
      }
    }
    return out;
  }, [seed]);
  return (
    <svg className="pass-pool" viewBox="0 0 200 210" width="200" height="210" aria-hidden="true">
      {/* the lamp bell */}
      <path d="M 70 0 L 130 0 L 146 22 L 54 22 Z" fill="var(--p-brass)" stroke="var(--p-brass-dark)" strokeWidth="2" />
      <rect x="54" y="20" width="92" height="5" fill="var(--p-soot)" />
      <g fill="var(--p-heat)" fillOpacity="0.55">
        {dots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y + 26} r={dot.r.toFixed(2)} />
        ))}
      </g>
    </svg>
  );
}

export function PassMenu({ menu }: { menu: MenuView }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (!self) return;
      const reduce = self.matches.reduceMotion === true;

      // An added line re-prints: the count stamps in and the hole is punched.
      self.add("print", (line: HTMLElement) => {
        const count = line.querySelector(".pass-count");
        if (!count) return;
        if (reduce) {
          animate(count, { opacity: [0, 1], duration: 120 });
          return;
        }
        animate(count, { opacity: [0, 1], y: [6, 0], duration: 160, ease: "outQuad" });
      });
      // A new line feeds up out of the printer slot.
      self.add("feed", (row: HTMLElement) => {
        if (reduce) {
          animate(row, { opacity: [0, 1], duration: 150 });
          return;
        }
        animate(row, { opacity: [0, 1], y: [16, 0], duration: 220, ease: "outQuad" });
      });

      const all = [".pass-lamp", ".pass-name", ".pass-sub", ".pass-strip", ".pass-slot"];
      if (reduce) {
        animate(all, { opacity: [0, 1], duration: 200 });
        animate(".pass-line, .pass-desc", { opacity: 1, duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      utils.set(".pass-lamp", { opacity: 0 });
      utils.set(".pass-strip", { opacity: 0 });

      createTimeline({ defaults: { ease: "outExpo" } })
        // the lamps come on one at a time
        .add(".pass-lamp", { opacity: [0, 1], duration: 380, ease: "outQuad", delay: stagger(240) })
        // the name warms into the steel
        .add(".pass-name", { opacity: [0, 1], y: [10, 0], duration: 700 }, "-=500")
        .add(".pass-sub", { opacity: [0, 1], duration: 400 }, "-=350")
        // the strips drop off the rail and swing to rest
        .add(
          ".pass-strip",
          {
            opacity: [0, 1],
            y: [-70, 0],
            rotate: [(_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 1.6 : -1.6), (_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 0.7 : -0.6)],
            duration: 900,
            ease: "outBack(1.4)",
            delay: stagger(160),
          },
          "-=350",
        )
        // then they print, top to bottom
        .add(".pass-line, .pass-desc", { opacity: [0, 1], duration: 140, delay: stagger(26) }, "-=550")
        .add(".pass-slot", { opacity: [0, 1], y: [30, 0], duration: 450 }, "-=400");
    });
    return () => scope.current?.revert();
  }, []);

  function add(item: MenuItemView, line: HTMLElement) {
    const wasEmpty = !cart[item.id];
    setCart((current) => ({ ...current, [item.id]: Math.min(MAX_PER_ITEM, (current[item.id] ?? 0) + 1) }));
    requestAnimationFrame(() => {
      scope.current?.methods.print?.(line);
      if (wasEmpty) {
        const row = root.current?.querySelector<HTMLElement>(`[data-ticket-line="${item.id}"]`);
        if (row) scope.current?.methods.feed?.(row);
      }
    });
  }
  function remove(item: MenuItemView) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[item.id] ?? 0) - 1;
      if (quantity > 0) next[item.id] = quantity;
      else delete next[item.id];
      return next;
    });
  }

  const lines = cartLines(cart, menu);
  const count = cartCount(cart);
  const totalKobo = cartTotalKobo(lines);

  return (
    <div ref={root} className="pass fixed inset-0 overflow-x-hidden overflow-y-auto">
      <div className="relative">
        <div className="pass-rail" />
        {[18, 42, 66, 90].map((left, i) => (
          <div key={left} className="pass-lamp" style={{ left: `${left}%`, opacity: 0 }}>
            <HalftonePool seed={i + 1} />
          </div>
        ))}
      </div>

      <header className="relative mx-auto max-w-6xl px-6 pb-8 pt-44 sm:px-10 sm:pt-52">
        <h1 className="pass-name pass-serif text-[clamp(3.6rem,11vw,10rem)]" style={{ opacity: 0, textWrap: "balance" }}>
          {menu.restaurant.name}
        </h1>
        <p className="pass-sub mt-6 text-sm sm:text-base" style={{ opacity: 0, color: "var(--p-brass-light)" }}>
          {menu.restaurant.location}. The pass is open. Tap a line to put it on your ticket.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-64 sm:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {menu.menus.map((section) => (
            <section key={section.id} className="pass-strip px-5 pt-5 sm:px-7" style={{ opacity: 0, transformOrigin: "50% 0" }} aria-labelledby={`pass-${section.id}`}>
              <div className="pass-strip-head flex items-baseline justify-between pb-2">
                <h2 id={`pass-${section.id}`} className="text-lg font-bold">
                  {section.name.toUpperCase()}
                </h2>
                <span className="text-xs" style={{ color: "var(--p-ink-soft)" }}>
                  {section.items.length} lines
                </span>
              </div>
              <ul className="mt-2">
                {section.items.map((item) => {
                  const quantity = cart[item.id] ?? 0;
                  return (
                    <li key={item.id}>
                      <button type="button" className="pass-line" style={{ opacity: 0 }} onClick={(event) => add(item, event.currentTarget)} aria-label={`Add ${item.name} to the ticket`}>
                        <span className={`pass-punch ${quantity > 0 ? "is-punched" : ""}`} aria-hidden="true" />
                        <span className="pass-item-name">
                          {item.name}
                          {quantity > 0 ? <span className="pass-count"> x{quantity}</span> : null}
                        </span>
                        <span className="tabular">{item.price.replace("₦", "")}</span>
                        <span className="pass-mins tabular">{item.prepTimeMinutes}&apos;</span>
                      </button>
                      <div className="pass-desc flex items-baseline justify-between gap-3" style={{ opacity: 0 }}>
                        <span>{item.description}</span>
                        {quantity > 0 ? (
                          <button type="button" className="pass-less" onClick={() => remove(item)} aria-label={`Remove one ${item.name}`}>
                            -
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs" style={{ color: "var(--p-ink-soft)" }}>
                Prices in naira. Minutes are the kitchen&apos;s own.
              </p>
            </section>
          ))}
        </div>
      </main>

      <aside className="pass-slot fixed inset-x-0 bottom-0 px-4 pb-0 pt-3 sm:px-10" style={{ opacity: 0 }} aria-label="Your ticket">
        <form className="pass-ticket mx-auto max-w-xl px-5 pb-4" onSubmit={(event) => event.preventDefault()}>
          <div className="flex items-baseline justify-between border-b-2 border-dashed pb-2" style={{ borderColor: "var(--p-ink)" }}>
            <span className="font-bold">YOUR TICKET</span>
            <span className="text-xs" style={{ color: "var(--p-ink-soft)" }}>
              {count === 0 ? "nothing fired yet" : `${count} ${count === 1 ? "item" : "items"}`}
            </span>
          </div>
          {lines.length === 0 ? (
            <p className="py-3 text-sm" style={{ color: "var(--p-ink-soft)" }}>
              Tap a line on the strips above. It prints here.
            </p>
          ) : (
            <ul className="py-2 text-sm">
              {lines.map((line) => (
                <li key={line.item.id} data-ticket-line={line.item.id} className="flex justify-between gap-3 py-0.5">
                  <span>
                    {line.item.name} <span className="pass-count">x{line.quantity}</span>
                  </span>
                  <span className="tabular">{formatNaira(line.item.priceKobo * line.quantity).replace("₦", "")}</span>
                </li>
              ))}
            </ul>
          )}
          {count > 0 ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-dashed pt-3" style={{ borderColor: "var(--p-ink)" }}>
              <label className="flex items-center gap-2 text-sm font-bold">
                TABLE
                <input className="pass-table" value={tableNo} onChange={(event) => setTableNo(event.target.value)} inputMode="numeric" maxLength={8} />
              </label>
              <span className="ml-auto text-lg font-bold tabular">{formatNaira(totalKobo)}</span>
              <button type="submit" className="pass-fire">
                Fire the order
              </button>
            </div>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
