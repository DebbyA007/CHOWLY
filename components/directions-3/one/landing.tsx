"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { Dish } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { Lamp } from "./lamp";
import { PASS_PALETTE, PassFrame, Peg, base } from "./frame";

const REPOSITORY = "https://github.com/DebbyA007/CHOWLY";
const SUBMISSION = "https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md";

// The front door: the pass at nine at night, in a lit room. The lamps come on over the
// rail as you arrive, two plates wait on the wooden counter under them, and two tickets
// hang from a lower rail: the customer's side and the waiter's.
export function PassLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [heat, setHeat] = useState(0);
  useEffect(() => {
    const warm = window.setTimeout(() => setHeat(1), 300);
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".pass-name", ".pass-line", ".counter", ".door", ".colophon"];
      if (self?.matches.reduceMotion || !firstVisit("one-landing")) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      utils.set(".door", { opacity: 0 });
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".pass-name", { opacity: [0, 1], y: [12, 0], duration: 800 }, 250)
        .add(".pass-line", { opacity: [0, 1], duration: 500 }, "-=400")
        .add(".counter", { opacity: [0, 1], y: [10, 0], duration: 500 }, "-=300")
        .add(".door", { opacity: [0, 1], y: [-50, 0], rotate: [(_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 1.6 : -1.6), (_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 0.7 : -0.6)], duration: 900, ease: "outBack(1.4)", delay: stagger(180) }, "-=250")
        .add(".colophon", { opacity: [0, 1], duration: 400 }, "-=400");
    });
    return () => {
      window.clearTimeout(warm);
      scope.revert();
    };
  }, []);
  return (
    <PassFrame>
      <div ref={root} className="heat relative" style={{ ["--heat" as string]: heat }} data-state={heat === 1 ? "waiting" : "cold"}>
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden sm:block" aria-hidden="true">
          <div className="relative mx-auto max-w-6xl">
            {[{ left: "24%", seed: 4 }, { left: "42%", seed: 5 }, { left: "60%", seed: 6 }].map((lamp) => (
              <div key={lamp.seed} className="absolute -translate-x-1/2" style={{ left: lamp.left }}>
                <Lamp seed={lamp.seed} width={190} />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 sm:hidden" aria-hidden="true">
          <Lamp seed={5} width={150} />
        </div>
        <main className="relative mx-auto max-w-6xl px-4 pb-10 pt-[118px] sm:px-8 sm:pt-[200px]">
          <h1 className="pass-name display sign-text text-[clamp(3.6rem,15vw,10rem)] leading-[0.85]" style={{ opacity: 0 }}>
            CHOWLY
          </h1>
          <p className="pass-line mt-4 max-w-xl text-[15px] leading-snug sm:text-lg" style={{ opacity: 0 }}>
            Order from your table at The Golden Gate. The kitchen promises a time, the lamp over your ticket keeps it, and you settle up before you go.
          </p>
          <div className="counter relative mt-12 sm:mt-16" style={{ opacity: 0 }} aria-hidden="true">
            <div className="wood3 h-14 border-t-2 border-[color:var(--wood-light)] border-b-4 border-b-[color:var(--wood-dark)] sm:h-16" />
            <div className="absolute -top-12 left-4 flex gap-4 sm:-top-16 sm:left-10 sm:gap-8">
              <div className="plate3 h-24 w-24 sm:h-32 sm:w-32"><Dish id="item_jollof_rice" material="gouache" palette={PASS_PALETTE} size={82} className="sm:hidden" /><Dish id="item_jollof_rice" material="gouache" palette={PASS_PALETTE} size={112} className="hidden sm:block" /></div>
              <div className="plate3 h-20 w-20 self-end sm:h-28 sm:w-28"><Dish id="item_suya_platter" material="gouache" palette={PASS_PALETTE} size={68} className="sm:hidden" /><Dish id="item_suya_platter" material="gouache" palette={PASS_PALETTE} size={96} className="hidden sm:block" /></div>
              <div className="plate3 hidden h-24 w-24 self-end sm:grid"><Dish id="item_chapman" material="gouache" palette={PASS_PALETTE} size={80} /></div>
            </div>
          </div>
          <section aria-label="Two ways in" className="mt-8">
            <div className="rail3 h-[14px]" />
            <div className="-mt-[2px] grid gap-5 px-1 sm:grid-cols-2 sm:gap-8">
              {[
                { href: `${base}/menu`, role: "customer", head: "AT THE TABLE", body: "Read the strips, put dishes on your ticket, fire it, and watch the lamp keep the kitchen's promise.", action: "Take a table" },
                { href: `${base}/waiter`, role: "waiter", head: "ON THE PASS", body: "Every fired ticket under its own lamp. Pull one down, record who served, cooked and mixed.", action: "Work the pass" },
              ].map((door) => (
                <Link key={door.href} href={door.href} data-enter={door.role} className="door paper torn-bottom relative block px-5 pt-9" style={{ opacity: 0, transformOrigin: "50% 0" }}>
                  <Peg className="absolute left-1/2 -top-1 -translate-x-1/2" />
                  <span className="block border-b-2 border-dashed border-ink pb-2 text-[15px] font-bold">{door.head}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink-soft">{door.body}</span>
                  <span className="stamp-button mt-4 inline-block bg-char-ink px-4 py-2.5 text-paper">{door.action}</span>
                </Link>
              ))}
            </div>
          </section>
          <p className="colophon mt-8 text-xs text-ink-soft" style={{ opacity: 0 }}>
            <a href={REPOSITORY} rel="noopener" className="underline">Repository</a>, <a href={SUBMISSION} rel="noopener" className="underline">submission document</a>, and the art directions: <Link href="/directions" className="underline">one</Link>, <Link href="/directions-2" className="underline">two</Link>, <Link href="/directions-3" className="underline">three</Link>.
          </p>
        </main>
      </div>
    </PassFrame>
  );
}
