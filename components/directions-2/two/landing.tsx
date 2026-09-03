"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { BillFrame, Candle } from "./frame";

const base = "/directions-2/two";

// The card, face up on the table, and the candle lit as you sit down.
export function BillLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0.2);
  useEffect(() => {
    const t = window.setTimeout(() => setP(1), 300);
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".t-title", ".t-line", ".t-door", ".t-links"];
      if (self?.matches.reduceMotion) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".t-title", { opacity: [0, 1], duration: 700 }, 200)
        .add(".t-line", { opacity: [0, 1], duration: 500, delay: stagger(120) }, "-=350")
        .add(".t-door", { opacity: [0, 1], y: [10, 0], duration: 550, delay: stagger(140) }, "-=250")
        .add(".t-links", { opacity: [0, 1], duration: 500 }, "-=300");
    });
    return () => {
      window.clearTimeout(t);
      scope.revert();
    };
  }, []);
  return (
    <BillFrame progress={p}>
      <main ref={root} className="mx-auto flex min-h-[calc(100dvh-96px)] max-w-2xl flex-col px-5 pb-8 pt-6">
        <div className="flex items-end justify-between gap-4">
          <h1 className="t-title garamond misreg text-[clamp(3.4rem,15vw,7rem)] leading-[0.9]" style={{ opacity: 0 }}>
            CHOWLY
          </h1>
          <div className="t-line shrink-0" style={{ opacity: 0 }}>
            <Candle progress={p} size={110} />
          </div>
        </div>
        <div className="rule mt-3" />
        <p className="t-line mt-4 max-w-md text-[19px] leading-snug" style={{ opacity: 0 }}>
          The card at The Golden Gate. Order from your seat; the kitchen names a time and the candle burns it down. Settle the account before you leave.
        </p>
        <p className="t-line mt-2 max-w-md text-[15px] italic text-[var(--ink-soft)]" style={{ opacity: 0 }}>
          No login, no PIN. Either side of the card is open to anyone with this link.
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
          <Link href={`${base}/menu`} className="t-door rule-double flex-1 px-1 py-3" style={{ opacity: 0 }}>
            <span className="garamond block text-3xl italic">Be seated</span>
            <span className="block text-[15px] text-[var(--ink-soft)]">The bill of fare, your order, the candle, the account.</span>
            <span className="ink-button mt-3 inline-block">Read the card</span>
          </Link>
          <Link href={`${base}/waiter`} className="t-door rule-double flex-1 px-1 py-3" style={{ opacity: 0 }}>
            <span className="garamond block text-3xl italic">Wait the tables</span>
            <span className="block text-[15px] text-[var(--ink-soft)]">The house book: every order, who cooked and mixed, served.</span>
            <span className="ink-button open mt-3 inline-block">Open the book</span>
          </Link>
        </div>

        <div className="t-links mt-6 flex flex-col gap-1.5 text-[15px]" style={{ opacity: 0 }}>
          <p className="font-bold" style={{ color: "var(--green)" }}>Payment here is pretend. No money moves, and every record says so.</p>
          <p>
            <Link href="/directions" className="underline">Three art directions</Link> and <Link href="/directions-2" className="underline">three more</Link> were built and critiqued before one was chosen.
          </p>
          <p>
            <a href="https://github.com/DebbyA007/CHOWLY" rel="noopener" className="underline">Repository</a>, <a href="https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md" rel="noopener" className="underline">submission document</a>.
          </p>
        </div>
      </main>
    </BillFrame>
  );
}
