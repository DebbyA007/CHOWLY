"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, splitText, stagger, svg, utils } from "animejs";
import "./signwriter.css";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";

type Scope = ReturnType<typeof createScope>;

// A deterministic wobble so nothing sits perfectly straight, and it never changes between
// renders or between server and client.
function wobble(seed: number, spread: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * spread;
}

// A hand-drawn underline: a path with a little noise in it, drawn in with createDrawable.
function chalkLine(width: number, seed: number): string {
  const points: string[] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const x = (width / steps) * i;
    const y = 4 + wobble(seed + i, 2.2);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function Tally({ count }: { count: number }) {
  if (count > 5) {
    return <span className="sw-sign-face sw-chalk-yellow text-lg">x{count}</span>;
  }
  return (
    <svg width="44" height="22" viewBox="0 0 44 22" aria-hidden="true" className="inline-block align-middle">
      {Array.from({ length: Math.min(count, 4) }, (_, i) => (
        <path
          key={i}
          className="sw-tally"
          d={`M ${6 + i * 9} 3 L ${5 + i * 9 + wobble(i, 1.5)} 19`}
          stroke="var(--sw-yellow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {count === 5 ? <path className="sw-tally" d="M 2 16 L 40 5" stroke="var(--sw-yellow)" strokeWidth="2.5" strokeLinecap="round" fill="none" /> : null}
    </svg>
  );
}

export function SignwriterMenu({ menu }: { menu: MenuView }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (!self) return;
      const reduce = self.matches.reduceMotion === true;
      const sign = root.current?.querySelector<HTMLElement>(".sw-sign");
      if (!sign) return;

      // One-shot: the chalk tick and the tally mark draw when an item is added.
      self.add("tick", (row: HTMLElement) => {
        const marks = row.querySelectorAll<SVGPathElement>(".sw-tally");
        if (marks.length === 0) return;
        const last = marks[marks.length - 1];
        if (!last) return;
        if (reduce) {
          animate(last, { opacity: [0, 1], duration: 150 });
          return;
        }
        animate(svg.createDrawable(last), { draw: ["0 0", "0 1"], duration: 260, ease: "outQuad" });
      });

      if (reduce) {
        animate([".sw-board", ".sw-sign", ".sw-tag", ".sw-heading", ".sw-item", ".sw-counter"], { opacity: [0, 1], duration: 200 });
        return;
      }

      const split = splitText(sign, { chars: { class: "sw-char" } });
      const underlines = svg.createDrawable(".sw-underline");
      utils.set(underlines, { draw: "0 0" });
      utils.set([".sw-board", ".sw-sign", ".sw-tag", ".sw-heading", ".sw-item", ".sw-counter"], { opacity: 1 });
      utils.set(split.chars, { opacity: 0 });

      createTimeline({ defaults: { ease: "outQuart" } })
        // the board is painted with one wide brush, left to right
        .add(".sw-board", { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"], duration: 750, ease: "inOutQuart" })
        // the letters are cut in one at a time, each landing at its own slight angle
        .add(
          split.chars,
          {
            opacity: [0, 1],
            y: [18, 0],
            rotate: [(_el?: unknown, i?: number) => wobble(i ?? 0, 9), (_el?: unknown, i?: number) => wobble(i ?? 0, 2.4)],
            duration: 420,
            delay: stagger(48),
          },
          "-=250",
        )
        .add(".sw-tag", { opacity: [0, 1], x: [-10, 0], duration: 400 }, "-=200")
        // the chalk headings write, their underlines dragged across
        .add(".sw-heading", { opacity: [0, 1], x: [-8, 0], duration: 350, delay: stagger(120) }, "-=200")
        .add(underlines, { draw: "0 1", duration: 520, ease: "inOutSine", delay: stagger(120) }, "<+=120")
        // the items are chalked top to bottom
        .add(".sw-item", { opacity: [0, 1], x: [-6, 0], duration: 300, delay: stagger(38) }, "-=500")
        .add(".sw-counter", { opacity: [0, 1], y: [24, 0], duration: 500 }, "-=300");

      return () => split.revert();
    });
    return () => scope.current?.revert();
  }, []);

  function add(item: MenuItemView, row: HTMLElement) {
    setCart((current) => ({ ...current, [item.id]: Math.min(MAX_PER_ITEM, (current[item.id] ?? 0) + 1) }));
    requestAnimationFrame(() => scope.current?.methods.tick?.(row));
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
    <div ref={root} className="sw fixed inset-0 overflow-y-auto">
      <header className="sw-board mx-3 mt-3 px-6 py-8 sm:mx-8 sm:mt-6 sm:px-12 sm:py-12" style={{ opacity: 0 }}>
        <h1
          className="sw-sign sw-sign-face text-[clamp(3.4rem,11vw,10.5rem)] uppercase"
          style={{ opacity: 0, textWrap: "balance" }}
        >
          {menu.restaurant.name}
        </h1>
        <p className="sw-tag sw-sign-face mt-5 text-[clamp(1.1rem,2.4vw,1.9rem)]" style={{ opacity: 0 }}>
          {menu.restaurant.location}. Food is ready.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-44 pt-10 sm:px-10 sm:pt-14">
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
          {menu.menus.map((section, sectionIndex) => (
            <section key={section.id} aria-labelledby={`sw-${section.id}`}>
              <div className="relative mb-4 inline-block">
                <h2 id={`sw-${section.id}`} className="sw-heading sw-sign-face sw-chalk-yellow text-[2.4rem] leading-none" style={{ opacity: 0 }}>
                  {section.name}
                </h2>
                <svg className="absolute -bottom-2 left-0 h-3 w-full overflow-visible" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                  <path className="sw-underline" d={chalkLine(200, sectionIndex + 1)} fill="none" stroke="var(--sw-chalk)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <ul>
                {section.items.map((item, index) => {
                  const quantity = cart[item.id] ?? 0;
                  return (
                    <li key={item.id} className="sw-item" style={{ opacity: 0, transform: `rotate(${wobble(index + sectionIndex * 20, 0.6).toFixed(2)}deg)` }}>
                      <button type="button" className="sw-row" onClick={(event) => add(item, event.currentTarget)} aria-label={`Add ${item.name} to the order`}>
                        <span className="sw-name sw-sign-face sw-chalk flex items-center gap-2">
                          {item.name}
                          {quantity > 0 ? <Tally count={quantity} /> : null}
                        </span>
                        <span className="sw-leader" aria-hidden="true" />
                        <span className="sw-price sw-sign-face sw-chalk-yellow">{item.price}</span>
                      </button>
                      <div className="sw-desc flex items-baseline justify-between gap-3">
                        <span>
                          {item.description} <span className="whitespace-nowrap">{item.prepTimeMinutes} min.</span>
                        </span>
                        {quantity > 0 ? (
                          <button type="button" className="sw-minus" onClick={() => remove(item)} aria-label={`Remove one ${item.name}`}>
                            -
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <footer className="sw-counter fixed inset-x-0 bottom-0 px-5 py-4 sm:px-10" style={{ opacity: 0 }}>
        <form className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3" onSubmit={(event) => event.preventDefault()} aria-label="Your order">
          <p className="sw-sign-face text-base sm:text-xl">
            {count === 0 ? "Nothing chalked up yet. Tap a dish." : `${count} ${count === 1 ? "plate" : "plates"}`}
          </p>
          {count > 0 ? (
            <>
              <label className="flex items-center gap-2 font-semibold">
                Table
                <input className="sw-table" value={tableNo} onChange={(event) => setTableNo(event.target.value)} inputMode="numeric" maxLength={8} />
              </label>
              <span className="sw-sign-face ml-auto text-2xl">{formatNaira(totalKobo)}</span>
              <button type="submit" className="sw-button">
                Place order
              </button>
            </>
          ) : null}
        </form>
      </footer>
    </div>
  );
}
