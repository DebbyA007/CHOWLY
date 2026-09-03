"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { Lamp } from "./lamp";

type Scope = ReturnType<typeof createScope>;

const REPOSITORY = "https://github.com/DebbyA007/CHOWLY";
const SUBMISSION = "https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md";

// The front door: the pass before service. The lamps hang cold over an empty rail, and
// they warm as you arrive, which is the one thing that moves without being asked. Two
// tickets hang from the rail, the two sides of the same pass, and either is open to
// anyone. The warming is the heat system, not an animation library: --heat goes from 0
// to 1 after mount and the stylesheet glides it, or steps it once under reduced motion.
export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const [heat, setHeat] = useState(0);

  useEffect(() => {
    const warm = window.setTimeout(() => setHeat(1), 350);
    scope.current = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".pass-name", ".pass-line", ".door", ".plate-row"];
      if (self?.matches.reduceMotion) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      utils.set(".door", { opacity: 0 });
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".pass-name", { opacity: [0, 1], y: [12, 0], duration: 800 }, 300)
        .add(".pass-line", { opacity: [0, 1], duration: 500, delay: stagger(120) }, "-=400")
        .add(
          ".door",
          {
            opacity: [0, 1],
            y: [-60, 0],
            rotate: [(_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 1.8 : -1.8), (_el?: unknown, i?: number) => ((i ?? 0) % 2 ? 0.8 : -0.7)],
            duration: 900,
            ease: "outBack(1.4)",
            delay: stagger(180),
          },
          "-=250",
        )
        .add(".plate-row", { opacity: [0, 1], y: [16, 0], duration: 500 }, "-=400");
    });
    return () => {
      window.clearTimeout(warm);
      scope.current?.revert();
    };
  }, []);

  return (
    <div ref={root} className="heat relative overflow-x-hidden" style={{ ["--heat" as string]: heat }} data-state={heat === 1 ? "waiting" : "cold"}>
      <div className="pointer-events-none absolute inset-x-0 top-[22px] hidden sm:block" aria-hidden="true">
        <div className="relative mx-auto max-w-6xl">
          {[
            { left: "23%", seed: 4 },
            { left: "39%", seed: 5 },
            { left: "55%", seed: 6 },
          ].map((lamp) => (
            <div key={lamp.seed} className="absolute -translate-x-1/2" style={{ left: lamp.left }}>
              <Lamp seed={lamp.seed} />
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-4 sm:hidden" aria-hidden="true">
        <div className="brass-bar h-[14px]" />
        <div className="absolute left-1/2 top-[14px] -translate-x-1/2">
          <Lamp seed={5} width={170} />
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-5 pb-16 pt-44 sm:px-8 sm:pt-60">
        <h1 className="pass-name display text-[clamp(4rem,14vw,12rem)] leading-[0.85] text-brass-light" style={{ opacity: 0, textShadow: "2px 3px 0 var(--soot)" }}>
          CHOWLY
        </h1>
        <p className="pass-line mt-6 max-w-2xl text-base text-paper sm:text-lg" style={{ opacity: 0 }}>
          A dining room from the kitchen side of the pass. Fire a ticket, the kitchen promises a time, and the lamp over your
          ticket keeps it. Run late and the light cools. Complain, rate, settle up.
        </p>
        <p className="pass-line mt-3 max-w-2xl text-sm text-brass-light" style={{ opacity: 0 }}>
          There is no login and no PIN, by design. Both sides of the pass are open to anyone with this link.
        </p>

        <section aria-label="Two ways in" className="mt-10">
          <div className="brass-bar h-[18px]" />
          <div className="-mt-[3px] grid gap-6 px-1 pb-4 pt-0 sm:grid-cols-2 sm:gap-8">
            {[
              {
                href: "/menu",
                head: "CUSTOMER SIDE",
                body: "Read the strips, fire a ticket, watch the lamp keep the kitchen's promise. Punch a rating, tear off a complaint slip if it runs late, settle the ticket.",
                action: "Take a table",
              },
              {
                href: "/waiter",
                head: "KITCHEN SIDE",
                body: "The rail. Every fired ticket hangs under its own lamp. Pull one off the pass, record who served, cooked and mixed, and it moves to the served rail.",
                action: "Open the pass",
              },
            ].map((door) => (
              <Link key={door.href} href={door.href} className="door paper torn-bottom relative block px-5 pt-7 sm:px-7" style={{ opacity: 0, transformOrigin: "50% 0" }}>
                <svg className="absolute left-1/2 top-1 -translate-x-1/2" width="22" height="30" viewBox="0 0 22 30" aria-hidden="true">
                  <circle cx="11" cy="11" r="5" fill="var(--steel)" stroke="var(--ink)" strokeWidth="2" />
                  <rect x="9.5" y="0" width="3" height="22" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="1" />
                </svg>
                <span className="block border-b-2 border-dashed border-ink pb-2 text-base font-bold">{door.head}</span>
                <span className="mt-3 block text-sm leading-relaxed text-ink-soft">{door.body}</span>
                <span className="stamp-button mt-4 inline-block bg-char-ink px-4 py-2.5 text-paper">{door.action}</span>
                <span className="mt-3 block text-xs text-ink-soft">Open to anyone. One click, no gate.</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="About this build" className="plate-row mt-8 flex flex-wrap items-stretch gap-3" style={{ opacity: 0 }}>
          <Link href="/directions" className="brass-plate flex-1 basis-64 px-4 py-3 text-sm">
            <span className="display-print block text-lg">Three directions</span>
            <span className="block">Three art directions were built for real and critiqued before this one was chosen.</span>
          </Link>
          <a href={REPOSITORY} rel="noopener" className="brass-plate flex-1 basis-40 px-4 py-3 text-sm">
            <span className="display-print block text-lg">Repository</span>
            <span className="block">The commit history, as the work was done.</span>
          </a>
          <a href={SUBMISSION} rel="noopener" className="brass-plate flex-1 basis-40 px-4 py-3 text-sm">
            <span className="display-print block text-lg">Submission document</span>
            <span className="block">How it was built, how AI was used, every feature, and a walkthrough.</span>
          </a>
          <p className="paper torn-both flex-1 basis-full px-4 pt-3 text-sm font-bold text-char-ink">
            Payment here is pretend. No money moves, and every payment record says so.
          </p>
        </section>
      </main>
    </div>
  );
}
