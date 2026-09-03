"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, splitText, stagger, svg, utils } from "animejs";
import type { Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";

type Props = {
  menu: MenuView;
  cart?: Cart;
  onAdd?: (item: MenuItemView, button: HTMLElement) => void;
  onRemove?: (item: MenuItemView) => void;
};

// The menu, and the one orchestrated page-load sequence in the whole app: the enamel
// rims draw in, the restaurant name resolves, then the plates settle in from the
// centre. Everything after this answers an action. With reduced motion on, all of it
// collapses to a plain opacity change.
export function MenuBoard({ menu, cart, onAdd, onRemove }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    scope.current = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion)" },
    }).add((self) => {
      const name = root.current?.querySelector<HTMLElement>(".restaurant-name");
      if (!name) return;

      if (self?.matches.reduceMotion) {
        animate([".plate-rim", ".restaurant-name", ".plate-body", ".menu-head"], {
          opacity: [0, 1],
          duration: 200,
        });
        return;
      }

      // createDrawable starts each rim at nothing drawn, which is exactly right here and
      // exactly wrong above, so it is only created on the animated path.
      const rims = svg.createDrawable(".plate-rim rect");
      const split = splitText(name, { chars: true });
      // The rims draw in chalk over the deep ground, the way the enamel is seen first, and
      // take their ink colour as the plates settle under them.
      utils.set(rims, { draw: "0 0", stroke: "#f2efe6" });
      utils.set([".plate-rim", ".restaurant-name"], { opacity: 1 });
      utils.set(split.chars, { opacity: 0 });

      createTimeline({ defaults: { ease: "outExpo" } })
        .add(rims, {
          draw: "0 1",
          ease: "inOutSine",
          duration: 900,
          delay: stagger(40, { from: "center" }),
        })
        .add(split.chars, { opacity: [0, 1], y: [10, 0], duration: 500, delay: stagger(18) }, "-=600")
        .add(".menu-head", { opacity: [0, 1], duration: 400 }, "-=300")
        .add(
          ".plate-body",
          { opacity: [0, 1], scale: [0.97, 1], duration: 700, delay: stagger(45, { from: "center" }) },
          "-=350",
        )
        .add(rims, { stroke: "#0a1f33", duration: 600, ease: "inOutSine" }, "<");

      return () => split.revert();
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <div ref={root}>
      <div className="mb-10 sm:mb-14">
        <h1 className="restaurant-name display-wide text-5xl sm:text-7xl" style={{ opacity: 0 }}>
          {menu.restaurant.name}
        </h1>
        <p className="menu-head mt-3 text-chalk/80" style={{ opacity: 0 }}>
          {menu.restaurant.location}
        </p>
      </div>

      {menu.menus.map((section) => (
        <section key={section.id} aria-labelledby={`menu-${section.id}`} className="mb-12">
          <h2 id={`menu-${section.id}`} className="menu-head display-tight mb-5 text-2xl" style={{ opacity: 0 }}>
            {section.name}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <li key={item.id} className="relative">
                <svg className="plate-rim pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true" style={{ opacity: 0 }}>
                  <rect
                    x="0.75"
                    y="0.75"
                    style={{ width: "calc(100% - 1.5px)", height: "calc(100% - 1.5px)" }}
                    rx="27"
                    fill="none"
                    stroke="var(--rim)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <article className="plate-body speckle-chalk plate flex h-full flex-col p-5 text-ink" style={{ opacity: 0 }}>
                  <h3 className="display-tight text-xl">{item.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="text-lg font-medium tabular">{item.price}</span>
                    <span className="text-sm tabular text-ink-soft">{item.prepTimeMinutes} min to make</span>
                  </div>
                  {onAdd ? (
                    <div className="mt-4 flex items-center justify-end">
                      {(cart?.[item.id] ?? 0) > 0 ? (
                        <div className="flex items-center gap-1" role="group" aria-label={`${item.name} on the tray`}>
                          <button
                            type="button"
                            onClick={() => onRemove?.(item)}
                            aria-label={`Remove one ${item.name}`}
                            className="stamp rim h-9 w-9 bg-chalk text-lg leading-none"
                          >
                            -
                          </button>
                          <span className="tabular w-8 text-center font-medium" aria-live="polite">
                            {cart?.[item.id]}
                          </span>
                          <button
                            type="button"
                            onClick={(event) => onAdd(item, event.currentTarget)}
                            aria-label={`Add one more ${item.name}`}
                            className="stamp rim h-9 w-9 bg-chalk text-lg leading-none"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => onAdd(item, event.currentTarget)}
                          className="stamp bg-enamel-mid px-3.5 py-2 text-sm font-medium text-chalk"
                        >
                          Add to order
                        </button>
                      )}
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
