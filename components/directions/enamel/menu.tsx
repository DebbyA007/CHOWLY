"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, createSpring, createTimeline, splitText, stagger, svg, utils } from "animejs";
import "./enamel.css";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";

type Scope = ReturnType<typeof createScope>;

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A chip in the enamel: a small irregular bite out of the rim showing the metal, with a
// rust edge. Where it sits is seeded by the dish, so it never moves.
function Chip({ seed, radius }: { seed: number; radius: number }) {
  const angle = seeded(seed) * Math.PI * 2;
  const cx = 100 + Math.cos(angle) * (radius - 3);
  const cy = 100 + Math.sin(angle) * (radius - 3);
  const s = 3 + seeded(seed + 1) * 3;
  // Rounded so the server and the browser, whose Math.sin differ in the last digits,
  // render the same attribute and hydration stays clean.
  const f = (n: number) => n.toFixed(2);
  const d = `M ${f(cx - s)} ${f(cy - s * 0.4)} L ${f(cx - s * 0.2)} ${f(cy - s)} L ${f(cx + s * 0.9)} ${f(cy - s * 0.3)} L ${f(cx + s * 0.6)} ${f(cy + s * 0.8)} L ${f(cx - s * 0.5)} ${f(cy + s)} Z`;
  return <path d={d} fill="var(--ce-metal)" stroke="var(--ce-rust)" strokeWidth="1" />;
}

// A bowl seen from above, or a cup with a handle for the bar. Size carries data: the
// longer a dish takes, the bigger its bowl.
function Vessel({ cup, seed, size }: { cup: boolean; seed: number; size: number }) {
  const r = cup ? 72 : 92;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" className="block">
      <defs>
        <pattern id={`speck-${seed}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="5" r="0.8" fill="var(--ce-rim)" fillOpacity="0.14" />
          <circle cx="13" cy="12" r="0.6" fill="var(--ce-rim)" fillOpacity="0.1" />
        </pattern>
      </defs>
      {/* the hard offset under a lifted bowl: mass, drawn once, revealed on hover */}
      <circle className="ce-bowl-shadow" cx="104" cy="106" r={r} fill="var(--ce-rim)" />
      {cup ? <path d={`M ${100 + r - 2} 78 C ${100 + r + 34} 70, ${100 + r + 34} 130, ${100 + r - 2} 122`} fill="none" stroke="var(--ce-chalk)" strokeWidth="14" strokeLinecap="round" /> : null}
      {cup ? <path d={`M ${100 + r - 2} 78 C ${100 + r + 34} 70, ${100 + r + 34} 130, ${100 + r - 2} 122`} fill="none" stroke="var(--ce-rim)" strokeWidth="17" strokeLinecap="round" opacity="1" style={{ mixBlendMode: "normal" }} /> : null}
      {cup ? <path d={`M ${100 + r - 2} 78 C ${100 + r + 34} 70, ${100 + r + 34} 130, ${100 + r - 2} 122`} fill="none" stroke="var(--ce-chalk)" strokeWidth="12" strokeLinecap="round" /> : null}
      <circle className="ce-rim-ring" cx="100" cy="100" r={r} fill="var(--ce-chalk)" stroke="var(--ce-rim)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r={r} fill={`url(#speck-${seed})`} />
      <circle cx="100" cy="100" r={r - 11} fill="none" stroke="var(--ce-rim)" strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="100" cy="100" r={r - 24} fill="none" stroke="var(--ce-rim)" strokeWidth="1" strokeOpacity="0.16" />
      <Chip seed={seed * 3} radius={r} />
      {seeded(seed) > 0.55 ? <Chip seed={seed * 7} radius={r} /> : null}
    </svg>
  );
}

export function EnamelMenu({ menu }: { menu: MenuView }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (!self) return;
      const reduce = self.matches.reduceMotion === true;
      const name = root.current?.querySelector<HTMLElement>(".ce-name");
      if (!name) return;

      // Add: the bowl is set down again with a spring, and a spoonful flies to the lip.
      self.add("serve", (bowl: HTMLElement, from: DOMRect, to: DOMRect) => {
        const badge = root.current?.querySelector<HTMLElement>(".ce-badge");
        if (reduce) {
          if (badge) animate(badge, { opacity: [0.3, 1], duration: 200 });
          return;
        }
        animate(bowl, { scale: [1.06, 1], ease: createSpring({ stiffness: 260, damping: 12 }) });
        const path = pathRef.current;
        const layer = layerRef.current;
        if (!path || !layer) return;
        const x1 = from.left + from.width / 2, y1 = from.top + from.height / 2, x2 = to.left + to.width / 2, y2 = to.top + to.height / 2;
        path.setAttribute("d", `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 160} ${x2} ${y2}`);
        const flyer = document.createElement("span");
        flyer.setAttribute("aria-hidden", "true");
        Object.assign(flyer.style, { position: "fixed", left: "-13px", top: "-13px", width: "26px", height: "26px", borderRadius: "50%", background: "var(--ce-chalk)", border: "2px solid var(--ce-rim)", pointerEvents: "none", zIndex: "60" });
        layer.appendChild(flyer);
        const { translateX, translateY } = svg.createMotionPath(path);
        animate(flyer, { translateX, translateY, scale: [1, 0.5], duration: 620, ease: "inOutQuad", onComplete: () => { flyer.remove(); if (badge) animate(badge, { scale: [1.5, 1], ease: createSpring({ stiffness: 300, damping: 12 }) }); } });
      });

      const all = [".ce-tray-rim", ".ce-name", ".ce-sub", ".ce-head", ".ce-dish", ".ce-lip"];
      if (reduce) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      const split = splitText(name, { chars: true });
      utils.set(all, { opacity: 1 });
      utils.set(split.chars, { opacity: 0 });
      utils.set(".ce-dish", { opacity: 0 });

      createTimeline({ defaults: { ease: "outExpo" } })
        // the tray's rim is wiped clean, edge to edge
        .add(".ce-tray-rim", { opacity: [0, 1], scale: [1.03, 1], duration: 700 })
        // the name resolves
        .add(split.chars, { opacity: [0, 1], y: [14, 0], duration: 500, delay: stagger(22) }, "-=400")
        .add([".ce-sub", ".ce-head"], { opacity: [0, 1], duration: 400 }, "-=300")
        // the bowls are set down, each from a little above, landing at its own tilt
        .add(
          ".ce-dish",
          {
            opacity: [0, 1],
            scale: [1.18, 1],
            y: [-24, 0],
            duration: 800,
            ease: "outBack(1.1)",
            delay: stagger(70, { from: "center" }),
          },
          "-=250",
        )
        .add(".ce-lip", { opacity: [0, 1], y: [30, 0], duration: 500 }, "-=500");

      return () => split.revert();
    });
    return () => scope.current?.revert();
  }, []);

  function add(item: MenuItemView, bowl: HTMLElement) {
    setCart((current) => ({ ...current, [item.id]: Math.min(MAX_PER_ITEM, (current[item.id] ?? 0) + 1) }));
    const badge = root.current?.querySelector<HTMLElement>(".ce-badge");
    if (badge) scope.current?.methods.serve?.(bowl, bowl.getBoundingClientRect(), badge.getBoundingClientRect());
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
    <div ref={root} className="ce fixed inset-0 overflow-y-auto">
      <div className="ce-tray-rim fixed" style={{ opacity: 0 }} />
      <div ref={layerRef} aria-hidden="true" />
      <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true"><path ref={pathRef} fill="none" stroke="none" /></svg>

      <header className="mx-auto max-w-6xl px-10 pt-14 sm:px-16 sm:pt-20">
        <h1 className="ce-name ce-display text-[clamp(3.2rem,9.5vw,9rem)]" style={{ opacity: 0, textWrap: "balance" }}>
          {menu.restaurant.name}
        </h1>
        <p className="ce-sub mt-5 max-w-xl text-base text-chalk/80 sm:text-lg" style={{ opacity: 0 }}>
          {menu.restaurant.location}. Everything on this tray is made to order. The bigger the bowl, the longer it takes.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-8 pb-52 pt-8 sm:px-12">
        {menu.menus.map((section, sectionIndex) => (
          <section key={section.id} className="mt-10" aria-labelledby={`ce-${section.id}`}>
            <h2 id={`ce-${section.id}`} className="ce-head ce-display mb-2 text-2xl font-semibold" style={{ opacity: 0, fontVariationSettings: '"wdth" 110' }}>
              {section.name}
            </h2>
            <ul className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1 sm:justify-start sm:gap-x-4">
              {section.items.map((item, index) => {
                const cup = section.type === "DRINKS";
                const size = (cup ? 150 : 160) + item.prepTimeMinutes * (cup ? 5 : 6);
                const seed = sectionIndex * 100 + index + 1;
                const tilt = (seeded(seed + 9) - 0.5) * 7;
                const quantity = cart[item.id] ?? 0;
                return (
                  <li key={item.id} className="ce-dish relative" style={{ opacity: 0, marginTop: `${Math.round(seeded(seed + 3) * 18)}px`, transform: `rotate(${tilt.toFixed(1)}deg)` }}>
                    <button type="button" className="ce-bowl" style={{ ["--tilt" as string]: `${(tilt / 3).toFixed(1)}deg` }} onClick={(event) => add(item, event.currentTarget)} aria-label={`Add ${item.name}, ${item.price}, ${item.prepTimeMinutes} minutes, to the tray`}>
                      <Vessel cup={cup} seed={seed} size={size} />
                      <span className="ce-bowl-text">
                        <span className="ce-bowl-name ce-display" style={{ fontSize: `${Math.round(size / 11)}px`, lineHeight: 1.02 }}>{item.name}</span>
                        <span className="mt-1 tabular font-semibold" style={{ fontSize: `${Math.round(size / 13)}px` }}>{item.price}</span>
                        <span className="mt-1 text-xs text-ink-soft" style={{ color: "#3f5468" }}>{item.prepTimeMinutes} min</span>
                        {quantity > 0 ? <span className="ce-tag mt-1 text-xs">x{quantity}</span> : null}
                      </span>
                    </button>
                    {quantity > 0 ? (
                      <button type="button" className="ce-less absolute right-2 top-2" onClick={() => remove(item)} aria-label={`Remove one ${item.name}`}>
                        -
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      <footer className="ce-lip fixed inset-x-0 bottom-0 px-6 py-4 sm:px-12" style={{ opacity: 0 }}>
        <form className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3" onSubmit={(event) => event.preventDefault()} aria-label="Your tray">
          <span className="ce-badge inline-flex h-10 min-w-10 items-center justify-center rounded-full border-2 px-2 font-semibold tabular" style={{ background: "var(--ce-mid)", color: "var(--ce-chalk)", borderColor: "var(--ce-rim)" }}>
            {count}
          </span>
          <p className="font-medium">{count === 0 ? "The tray is empty. Tap a bowl to serve yourself." : `${count} on the tray: ${lines.map((l) => `${l.item.name} x${l.quantity}`).join(", ")}`}</p>
          {count > 0 ? (
            <>
              <label className="flex items-center gap-2 text-sm font-medium">
                Table
                <input className="ce-input" value={tableNo} onChange={(event) => setTableNo(event.target.value)} inputMode="numeric" maxLength={8} />
              </label>
              <span className="ml-auto text-xl font-semibold tabular">{formatNaira(totalKobo)}</span>
              <button type="submit" className="ce-button">
                Place order
              </button>
            </>
          ) : null}
        </form>
      </footer>
    </div>
  );
}
