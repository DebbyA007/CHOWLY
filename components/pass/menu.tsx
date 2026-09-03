"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira } from "@/lib/money";
import { play } from "@/lib/sound";
import { Lamp } from "./lamp";

type Scope = ReturnType<typeof createScope>;

// The menu is the pass. Three lamps on the rail, the name warmed into the steel, the
// menu on two thermal strips, and the customer's own ticket feeding up from a printer
// slot along the bottom edge. This is the one orchestrated load sequence in the app.
//
// Committing the order is the second moment: the ticket tears off the printer, swings
// up onto the rail and is spiked, then the order page opens under its own lamp.
export function PassMenu({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fired, setFired] = useState<{ id: string; reference: string } | null>(null);

  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      if (!self) return;
      const reduce = self.matches.reduceMotion === true;

      self.add("print", (line: HTMLElement) => {
        const count = line.querySelector(".count");
        if (!count) return;
        animate(count, reduce ? { opacity: [0, 1], duration: 120 } : { opacity: [0, 1], y: [6, 0], duration: 160, ease: "outQuad" });
      });
      self.add("feed", (row: HTMLElement) => {
        animate(row, reduce ? { opacity: [0, 1], duration: 150 } : { opacity: [0, 1], y: [16, 0], duration: 220, ease: "outQuad" });
      });
      // The tear: the ticket is pulled off the printer, swings up to the rail and is spiked.
      self.add("tear", (onDone: () => void) => {
        if (reduce) {
          onDone();
          return;
        }
        createTimeline({ onComplete: onDone })
          .add(".ticket", { y: -28, rotate: -2.5, duration: 240, ease: "inQuad" })
          .add(".ticket", { y: "-70vh", x: 60, rotate: [-2.5, 4], duration: 720, ease: "outQuad" })
          .add(".ticket", { rotate: 0, scale: 0.96, duration: 260, ease: "outBack(2)" }, "-=120")
          .add(".ticket", { opacity: 0, duration: 220 }, "+=120");
      });

      const all = [".lamp", ".pass-name", ".pass-sub", ".strip", ".slot"];
      if (reduce) {
        animate(all, { opacity: [0, 1], duration: 200 });
        animate(".line, .desc", { opacity: 1, duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      utils.set(".lamp", { opacity: 0 });
      utils.set(".strip", { opacity: 0 });

      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".lamp", { opacity: [0, 1], duration: 380, ease: "outQuad", delay: stagger(240) })
        .add(".pass-name", { opacity: [0, 1], y: [10, 0], duration: 700 }, "-=450")
        .add(".pass-sub", { opacity: [0, 1], duration: 400 }, "-=350")
        .add(
          ".strip",
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
        .add(".line, .desc", { opacity: [0, 1], duration: 140, delay: stagger(24) }, "-=550")
        .add(".slot", { opacity: [0, 1], y: [30, 0], duration: 450 }, "-=400");
    });
    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    if (!fired) return;
    scope.current?.methods.tear?.(() => router.push(`/order/${fired.id}`));
  }, [fired, router]);

  function add(item: MenuItemView, line: HTMLElement) {
    const wasEmpty = !cart[item.id];
    setError(null);
    void play("print");
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
    setError(null);
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

  async function fire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError("Nothing on the ticket yet. Tap a line on the strips.");
      return;
    }
    if (!tableNo.trim()) {
      setError("Enter the number printed on your table.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tableNo: tableNo.trim(), items: lines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })) }),
      });
      const json = (await response.json().catch(() => null)) as { id: string; reference: string; error?: string } | null;
      if (!response.ok || !json) {
        setError(json?.error ?? "The order could not be fired. Check the connection and try again.");
        return;
      }
      void play("tear");
      setFired({ id: json.id, reference: json.reference });
    } catch {
      setError("The order could not be fired. Check the connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={root} className="overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[22px]" aria-hidden="true">
        <div className="relative mx-auto max-w-6xl">
          {[
            { left: "18%", seed: 1, hide: true },
            { left: "42%", seed: 2, hide: false },
            { left: "66%", seed: 3, hide: true },
          ].map((lamp) => (
            <div key={lamp.seed} className={`lamp absolute -translate-x-1/2 ${lamp.hide ? "hidden sm:block" : ""}`} style={{ left: lamp.left, opacity: 0 }}>
              <Lamp seed={lamp.seed} />
            </div>
          ))}
        </div>
      </div>

      <header className="relative mx-auto max-w-6xl px-5 pb-8 pt-52 sm:px-8 sm:pt-60">
        <h1 className="pass-name display text-[clamp(3.4rem,10.5vw,9.5rem)] leading-[0.9] text-brass-light" style={{ opacity: 0, textWrap: "balance", textShadow: "2px 3px 0 var(--soot)" }}>
          {menu.restaurant.name}
        </h1>
        <p className="pass-sub mt-6 max-w-2xl text-sm text-brass-light sm:text-base" style={{ opacity: 0 }}>
          {menu.restaurant.location}. The pass is open. Tap a line to put it on your ticket.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-72 sm:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {menu.menus.map((section) => (
            <section key={section.id} className="strip paper torn-bottom px-5 pt-5 sm:px-7" style={{ opacity: 0, transformOrigin: "50% 0" }} aria-labelledby={`strip-${section.id}`}>
              <div className="flex items-baseline justify-between border-b-2 border-dashed border-ink pb-2">
                <h2 id={`strip-${section.id}`} className="text-lg font-bold">
                  {section.name.toUpperCase()}
                </h2>
                <span className="text-xs text-ink-soft">{section.items.length} lines</span>
              </div>
              <ul className="mt-2">
                {section.items.map((item) => {
                  const quantity = cart[item.id] ?? 0;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="line grid w-full cursor-pointer grid-cols-[22px_1fr_auto_auto] items-baseline gap-2.5 py-2 text-left hover:[&_.name]:bg-lamp-warm focus-visible:[&_.name]:bg-lamp-warm"
                        style={{ opacity: 0, ["--lamp-warm" as string]: "#f2a93b" }}
                        onClick={(event) => add(item, event.currentTarget)}
                        aria-label={`Add ${item.name} to the ticket`}
                      >
                        <span className={`inline-block h-3 w-3 rounded-full border-2 ${quantity > 0 ? "border-soot bg-soot" : "border-ink"}`} aria-hidden="true" />
                        <span className="name">
                          {item.name}
                          {quantity > 0 ? <span className="count font-bold text-char-ink"> x{quantity}</span> : null}
                        </span>
                        <span className="tabular">{item.price.replace("₦", "")}</span>
                        <span className="tabular min-w-[3ch] text-right text-ink-soft">{item.prepTimeMinutes}&apos;</span>
                      </button>
                      <div className="desc flex items-baseline justify-between gap-3 pb-1.5 pl-8 text-xs text-ink-soft" style={{ opacity: 0 }}>
                        <span>{item.description}</span>
                        {quantity > 0 ? (
                          <button type="button" className="h-7 w-7 border-2 border-ink-soft font-bold leading-none text-ink" onClick={() => remove(item)} aria-label={`Remove one ${item.name}`}>
                            -
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-ink-soft">Prices in naira. Minutes are the kitchen&apos;s own.</p>
            </section>
          ))}
        </div>
      </main>

      <aside className="slot fixed inset-x-0 bottom-0 z-20 border-t-4 border-brass bg-soot px-4 pt-3 sm:px-8" style={{ opacity: 0 }} aria-label="Your ticket">
        <form className="ticket paper torn-top mx-auto max-w-xl px-5 pb-4" onSubmit={fire} noValidate style={{ transformOrigin: "50% 100%" }}>
          <div className="flex items-baseline justify-between border-b-2 border-dashed border-ink pb-2">
            <span className="font-bold">YOUR TICKET</span>
            <span className="text-xs text-ink-soft" aria-live="polite">
              {fired ? `fired as ${fired.reference}` : count === 0 ? "nothing fired yet" : `${count} ${count === 1 ? "item" : "items"}`}
            </span>
          </div>
          {lines.length === 0 ? (
            <p className="py-3 text-sm text-ink-soft">Tap a line on the strips above. It prints here.</p>
          ) : (
            <ul className="py-2 text-sm">
              {lines.map((line) => (
                <li key={line.item.id} data-ticket-line={line.item.id} className="flex justify-between gap-3 py-0.5">
                  <span>
                    {line.item.name} <span className="font-bold text-char-ink">x{line.quantity}</span>
                  </span>
                  <span className="tabular">{formatNaira(line.item.priceKobo * line.quantity).replace("₦", "")}</span>
                </li>
              ))}
            </ul>
          )}
          {count > 0 ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-dashed border-ink pt-3">
              <label className="flex items-center gap-2 text-sm font-bold">
                TABLE
                <input
                  className="w-20 border-2 border-ink bg-paper px-2 py-1.5 font-bold tabular"
                  value={tableNo}
                  onChange={(event) => setTableNo(event.target.value)}
                  inputMode="numeric"
                  maxLength={8}
                  aria-label="Table number"
                />
              </label>
              <span className="ml-auto text-lg font-bold tabular">{formatNaira(totalKobo)}</span>
              <button type="submit" disabled={submitting || fired !== null} className="stamp-button bg-char-ink px-4 py-2.5 text-paper">
                {fired ? "Fired" : submitting ? "Firing" : "Fire the order"}
              </button>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="mt-3 text-sm font-bold text-char-ink">
              {error}
            </p>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
